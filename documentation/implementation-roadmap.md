# Implementation Roadmap: Loan Status Verification System

## Overview

This document provides a detailed, step-by-step implementation plan for building the loan status verification system with AWS SES + React Email integration. The plan is optimized for efficient development and follows best practices for security and maintainability.

## Implementation Strategy: Foundation-First Approach

Based on analysis of dependencies and complexity, here's the optimal implementation order:

### **Phase 1: Database Foundation (Days 1-3)**

**Priority: HIGHEST - Everything depends on this**

#### 1.1 Supabase Database Setup

```sql
-- Create the required tables in order of dependencies
-- Run these migrations in your Supabase SQL editor

-- 1. First, create the verification sessions table
CREATE TABLE api.user_verification_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    loan_application_number BIGINT NOT NULL,
    verification_code_hash TEXT NOT NULL, -- Store hashed codes
    code_expires_at TIMESTAMPTZ NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    attempts_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,

    -- Foreign key to existing loan application
    CONSTRAINT fk_loan_application
        FOREIGN KEY (loan_application_number)
        REFERENCES api.tblLoanApplication(Lnd_application_number),

    -- Ensure one active session per email/loan combo
    CONSTRAINT unique_active_session
        UNIQUE (email, loan_application_number)
        WHERE is_verified = FALSE
);

-- 2. Create indexes for performance
CREATE INDEX idx_verification_email ON api.user_verification_sessions(email);
CREATE INDEX idx_verification_loan ON api.user_verification_sessions(loan_application_number);
CREATE INDEX idx_verification_expires ON api.user_verification_sessions(code_expires_at);

-- 3. Create user access logs table
CREATE TABLE api.user_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    loan_application_number BIGINT NOT NULL,
    access_type TEXT NOT NULL, -- 'verification_request', 'verification_success', 'verification_failed', 'dashboard_access'
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    additional_data JSONB,

    CONSTRAINT fk_loan_application_log
        FOREIGN KEY (loan_application_number)
        REFERENCES api.tblLoanApplication(Lnd_application_number)
);

-- 4. Create verified users table
CREATE TABLE api.verified_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    loan_application_number BIGINT NOT NULL,
    supabase_user_id UUID,
    first_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_access_at TIMESTAMPTZ DEFAULT NOW(),
    access_count INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_loan_application_verified
        FOREIGN KEY (loan_application_number)
        REFERENCES api.tblLoanApplication(Lnd_application_number),

    CONSTRAINT unique_verified_user
        UNIQUE (email, loan_application_number)
);

-- 5. Create email logs table for AWS SES tracking
CREATE TABLE api.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_to TEXT NOT NULL,
    email_subject TEXT NOT NULL,
    email_template TEXT NOT NULL,
    aws_message_id TEXT,
    status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'bounced', 'complained'
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,

    -- Link to verification session
    verification_session_id UUID REFERENCES api.user_verification_sessions(id)
);
```

#### 1.2 Enable Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE api.user_verification_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.user_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.verified_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (service role can manage all, users see their own data)
CREATE POLICY "Service role full access" ON api.user_verification_sessions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users view own sessions" ON api.user_verification_sessions
    FOR SELECT USING (email = auth.jwt() ->> 'email');

-- Similar policies for other tables...
```

#### 1.3 Create Utility Functions

```sql
-- Function to generate verification codes
CREATE OR REPLACE FUNCTION api.generate_verification_code()
RETURNS TEXT AS $$
BEGIN
    RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to hash verification codes
CREATE OR REPLACE FUNCTION api.hash_verification_code(code TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(digest(code || current_setting('app.jwt_secret', true), 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup expired sessions
CREATE OR REPLACE FUNCTION api.cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM api.user_verification_sessions
    WHERE code_expires_at < NOW() AND is_verified = FALSE;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Phase 2: Email System Setup (Days 4-7)**

**Priority: HIGH - Required for verification flow**

#### 2.1 Install Dependencies

```bash
# Install AWS SES and React Email dependencies
npm install @aws-sdk/client-ses @react-email/components @react-email/render
npm install --save-dev @react-email/tailwind

# Install additional utilities
npm install bcryptjs jsonwebtoken crypto-js
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

#### 2.2 AWS SES Configuration

```typescript
// lib/ses-client.ts
import { SESClient } from '@aws-sdk/client-ses'

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export default sesClient
```

#### 2.3 Project Structure for Email Templates

```
emails/
├── templates/
│   ├── verification-code.tsx
│   ├── welcome.tsx
│   └── status-update.tsx
├── components/
│   ├── EmailLayout.tsx
│   ├── Header.tsx
│   └── Footer.tsx
├── utils/
│   ├── send-email.ts
│   └── email-renderer.ts
└── types/
    └── email-types.ts
```

#### 2.4 Create Email Templates

```typescript
// emails/templates/verification-code.tsx
import React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Img,
} from '@react-email/components'

interface VerificationCodeEmailProps {
  verificationCode: string
  applicantName: string
  loanApplicationNumber: string
  expiryMinutes: number
}

export const VerificationCodeEmail = ({
  verificationCode,
  applicantName,
  loanApplicationNumber,
  expiryMinutes = 10,
}: VerificationCodeEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Img
            src='https://your-domain.com/logo.png'
            width='150'
            height='50'
            alt='Your Company Logo'
            style={logo}
          />
        </Section>

        <Section style={content}>
          <Text style={heading}>Verify Your Email Address</Text>

          <Text style={paragraph}>Hello {applicantName},</Text>

          <Text style={paragraph}>
            To access the status of your loan application #
            {loanApplicationNumber}, please enter the following verification
            code:
          </Text>

          <Section style={codeContainer}>
            <Text style={code}>{verificationCode}</Text>
          </Section>

          <Text style={paragraph}>
            This code will expire in {expiryMinutes} minutes for your security.
          </Text>

          <Text style={paragraph}>
            If you didn't request this verification, please ignore this email.
          </Text>
        </Section>

        <Hr style={hr} />

        <Section style={footer}>
          <Text style={footerText}>
            © 2024 Your Company. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const logoContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const content = {
  padding: '0 48px',
}

const heading = {
  fontSize: '24px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#484848',
  padding: '17px 0 0',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.4',
  color: '#484848',
}

const codeContainer = {
  background: '#f4f4f4',
  borderRadius: '4px',
  margin: '16px auto 16px auto',
  verticalAlign: 'middle',
  width: '280px',
  textAlign: 'center' as const,
}

const code = {
  color: '#000',
  display: 'inline-block',
  fontSize: '32px',
  fontWeight: 700,
  letterSpacing: '6px',
  lineHeight: '40px',
  paddingBottom: '8px',
  paddingTop: '8px',
  margin: '0 auto',
  width: '100%',
}

const hr = {
  borderColor: '#dfe1e4',
  margin: '42px 0 26px',
}

const footer = {
  textAlign: 'center' as const,
}

const footerText = {
  fontSize: '12px',
  color: '#b7b3b0',
  lineHeight: '15px',
  textAlign: 'center' as const,
  marginBottom: '50px',
}

export default VerificationCodeEmail
```

#### 2.5 Email Service Implementation

```typescript
// lib/email-service.ts
import { SendEmailCommand } from '@aws-sdk/client-ses'
import { render } from '@react-email/render'
import sesClient from './ses-client'
import { VerificationCodeEmail } from '../emails/templates/verification-code'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SendVerificationEmailParams {
  email: string
  verificationCode: string
  applicantName: string
  loanApplicationNumber: string
  sessionId: string
}

export class EmailService {
  static async sendVerificationCode({
    email,
    verificationCode,
    applicantName,
    loanApplicationNumber,
    sessionId,
  }: SendVerificationEmailParams): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    try {
      // Render email template
      const emailHtml = render(
        <VerificationCodeEmail
          verificationCode={verificationCode}
          applicantName={applicantName}
          loanApplicationNumber={loanApplicationNumber}
          expiryMinutes={10}
        />
      )

      // Prepare SES command
      const command = new SendEmailCommand({
        Source: process.env.AWS_SES_FROM_EMAIL!,
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: {
            Data: `Verification Code for Loan Application #${loanApplicationNumber}`,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: emailHtml,
              Charset: 'UTF-8',
            },
          },
        },
      })

      // Send email
      const result = await sesClient.send(command)

      // Log email in database
      await supabase.from('email_logs').insert({
        email_to: email,
        email_subject: `Verification Code for Loan Application #${loanApplicationNumber}`,
        email_template: 'verification-code',
        aws_message_id: result.MessageId,
        status: 'sent',
        verification_session_id: sessionId,
      })

      return {
        success: true,
        messageId: result.MessageId,
      }
    } catch (error) {
      console.error('Error sending verification email:', error)

      // Log error in database
      await supabase.from('email_logs').insert({
        email_to: email,
        email_subject: `Verification Code for Loan Application #${loanApplicationNumber}`,
        email_template: 'verification-code',
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        verification_session_id: sessionId,
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async sendWelcomeEmail(
    email: string,
    applicantName: string
  ): Promise<void> {
    // Implementation for welcome email
  }

  static async sendStatusUpdateEmail(
    email: string,
    newStatus: string
  ): Promise<void> {
    // Implementation for status update email
  }
}
```

### **Phase 3: Authentication & Token System (Days 8-12)**

**Priority: HIGH - Core functionality**

#### 3.1 Token System Implementation

```typescript
// lib/token-service.ts
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

export interface TokenPayload {
  email: string
  loanApplicationNumber: string
  timestamp: string
}

export class TokenService {
  private static readonly SECRET = process.env.JWT_SECRET!
  private static readonly EXPIRY = '24h'

  static generateAccessToken(payload: TokenPayload): string {
    // Add signature for integrity
    const signature = crypto
      .createHmac('sha256', this.SECRET)
      .update(
        `${payload.email}:${payload.loanApplicationNumber}:${payload.timestamp}`
      )
      .digest('hex')

    const tokenPayload = {
      ...payload,
      signature,
    }

    return jwt.sign(tokenPayload, this.SECRET, { expiresIn: this.EXPIRY })
  }

  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.SECRET) as any

      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', this.SECRET)
        .update(
          `${decoded.email}:${decoded.loanApplicationNumber}:${decoded.timestamp}`
        )
        .digest('hex')

      if (decoded.signature !== expectedSignature) {
        throw new Error('Invalid token signature')
      }

      return {
        email: decoded.email,
        loanApplicationNumber: decoded.loanApplicationNumber,
        timestamp: decoded.timestamp,
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }
}
```

#### 3.2 Verification Code Service

```typescript
// lib/verification-service.ts
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import { EmailService } from './email-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export class VerificationService {
  static async initiateVerification(
    email: string,
    loanApplicationNumber: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString()

      // Hash the code
      const hashedCode = await bcrypt.hash(code, 12)

      // Set expiry (10 minutes)
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 10)

      // Get applicant name from loan application
      const { data: loanApp } = await supabase
        .from('tblLoanApplication')
        .select('applicant_name')
        .eq('Lnd_application_number', loanApplicationNumber)
        .single()

      if (!loanApp) {
        return { success: false, error: 'Loan application not found' }
      }

      // Create verification session
      const { data: session, error } = await supabase
        .from('user_verification_sessions')
        .insert({
          email,
          loan_application_number: loanApplicationNumber,
          verification_code_hash: hashedCode,
          code_expires_at: expiresAt.toISOString(),
          ip_address: ipAddress,
          user_agent: userAgent,
        })
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      // Send verification email
      const emailResult = await EmailService.sendVerificationCode({
        email,
        verificationCode: code,
        applicantName: loanApp.applicant_name || 'Valued Customer',
        loanApplicationNumber: loanApplicationNumber.toString(),
        sessionId: session.id,
      })

      if (!emailResult.success) {
        return { success: false, error: emailResult.error }
      }

      // Log access attempt
      await supabase.from('user_access_logs').insert({
        email,
        loan_application_number: loanApplicationNumber,
        access_type: 'verification_request',
        ip_address: ipAddress,
        user_agent: userAgent,
        session_id: session.id,
      })

      return { success: true, sessionId: session.id }
    } catch (error) {
      console.error('Verification initiation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async verifyCode(
    sessionId: string,
    code: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ success: boolean; supabaseUser?: any; error?: string }> {
    try {
      // Get verification session
      const { data: session } = await supabase
        .from('user_verification_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('is_verified', false)
        .single()

      if (!session) {
        return {
          success: false,
          error: 'Invalid or expired verification session',
        }
      }

      // Check if expired
      if (new Date() > new Date(session.code_expires_at)) {
        return { success: false, error: 'Verification code has expired' }
      }

      // Check attempts
      if (session.attempts_count >= session.max_attempts) {
        return {
          success: false,
          error: 'Maximum verification attempts exceeded',
        }
      }

      // Verify code
      const isValidCode = await bcrypt.compare(
        code,
        session.verification_code_hash
      )

      // Increment attempts
      await supabase
        .from('user_verification_sessions')
        .update({ attempts_count: session.attempts_count + 1 })
        .eq('id', sessionId)

      if (!isValidCode) {
        // Log failed attempt
        await supabase.from('user_access_logs').insert({
          email: session.email,
          loan_application_number: session.loan_application_number,
          access_type: 'verification_failed',
          ip_address: ipAddress,
          user_agent: userAgent,
          session_id: sessionId,
        })

        return { success: false, error: 'Invalid verification code' }
      }

      // Mark session as verified
      await supabase
        .from('user_verification_sessions')
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq('id', sessionId)

      // Create or update verified user
      await supabase.from('verified_users').upsert(
        {
          email: session.email,
          loan_application_number: session.loan_application_number,
          last_access_at: new Date().toISOString(),
        },
        {
          onConflict: 'email,loan_application_number',
        }
      )

      // Create Supabase Auth user
      const { data: authUser, error: authError } =
        await supabase.auth.admin.createUser({
          email: session.email,
          email_confirm: true,
          user_metadata: {
            loan_application_number: session.loan_application_number,
            verified_at: new Date().toISOString(),
          },
        })

      if (authError) {
        console.error('Error creating auth user:', authError)
        // Continue anyway - verification was successful
      }

      // Log successful verification
      await supabase.from('user_access_logs').insert({
        email: session.email,
        loan_application_number: session.loan_application_number,
        access_type: 'verification_success',
        ip_address: ipAddress,
        user_agent: userAgent,
        session_id: sessionId,
      })

      return { success: true, supabaseUser: authUser }
    } catch (error) {
      console.error('Code verification failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}
```

### **Phase 4: API Routes (Days 13-15)**

**Priority: HIGH - Connects frontend to backend**

#### 4.1 Verification Initiation API

```typescript
// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { TokenService } from '@/lib/token-service'
import { VerificationService } from '@/lib/verification-service'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Verify and decode token
    const payload = TokenService.verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get IP and User Agent
    const headersList = headers()
    const ipAddress =
      headersList.get('x-forwarded-for') ||
      headersList.get('x-real-ip') ||
      'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    // Initiate verification
    const result = await VerificationService.initiateVerification(
      payload.email,
      parseInt(payload.loanApplicationNumber),
      ipAddress,
      userAgent
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
      email: payload.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
    })
  } catch (error) {
    console.error('Verification initiation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### 4.2 Code Verification API

```typescript
// app/api/auth/verify-code/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { VerificationService } from '@/lib/verification-service'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { sessionId, code } = await request.json()

    if (!sessionId || !code) {
      return NextResponse.json(
        { error: 'Session ID and verification code are required' },
        { status: 400 }
      )
    }

    // Get IP and User Agent
    const headersList = headers()
    const ipAddress =
      headersList.get('x-forwarded-for') ||
      headersList.get('x-real-ip') ||
      'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    // Verify code
    const result = await VerificationService.verifyCode(
      sessionId,
      code,
      ipAddress,
      userAgent
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Create session token for dashboard access
    const { data: sessionData } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: result.supabaseUser?.email || '',
    })

    return NextResponse.json({
      success: true,
      redirectUrl: '/dashboard',
      sessionToken: sessionData.properties?.action_link,
    })
  } catch (error) {
    console.error('Code verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### **Phase 5: UI Components (Days 16-20)**

**Priority: MEDIUM - User interface**

#### 5.1 Verification Page

```typescript
// app/verify/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Shield } from 'lucide-react'

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [step, setStep] = useState<'loading' | 'email-sent' | 'enter-code'>(
    'loading'
  )
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setError('Invalid verification link')
      return
    }

    initiateVerification(token)
  }, [searchParams])

  const initiateVerification = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send verification code')
        return
      }

      setSessionId(data.sessionId)
      setMaskedEmail(data.email)
      setStep('email-sent')

      // Auto-advance to code entry after 3 seconds
      setTimeout(() => setStep('enter-code'), 3000)
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  const verifyCode = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, code }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Verification failed')
        return
      }

      // Redirect to dashboard
      router.push(data.redirectUrl)
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6)
    setCode(numericValue)

    // Auto-submit when 6 digits entered
    if (numericValue.length === 6) {
      setTimeout(() => verifyCode(), 500)
    }
  }

  if (step === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='pt-6'>
            <div className='flex flex-col items-center space-y-4'>
              <Loader2 className='h-8 w-8 animate-spin' />
              <p>Preparing verification...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'email-sent') {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100'>
              <Mail className='h-6 w-6 text-blue-600' />
            </div>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              We've sent a 6-digit verification code to {maskedEmail}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-4'>
                The code will expire in 10 minutes
              </p>
              <Button onClick={() => setStep('enter-code')} className='w-full'>
                I've received the code
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
            <Shield className='h-6 w-6 text-green-600' />
          </div>
          <CardTitle>Enter Verification Code</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to {maskedEmail}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-2'>
            <Input
              type='text'
              placeholder='000000'
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className='text-center text-2xl font-mono tracking-widest'
              maxLength={6}
              disabled={loading}
            />
            <p className='text-xs text-gray-500 text-center'>
              Code expires in 10 minutes
            </p>
          </div>

          <Button
            onClick={verifyCode}
            className='w-full'
            disabled={loading || code.length !== 6}
          >
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>

          <div className='text-center'>
            <button
              className='text-sm text-blue-600 hover:underline'
              onClick={() => {
                // Implement resend functionality
              }}
            >
              Didn't receive the code? Resend
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### **Phase 6: Environment Configuration (Days 21-22)**

**Priority: HIGH - Required for deployment**

#### 6.1 Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AWS SES Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@yourdomain.com

# JWT & Security
JWT_SECRET=your_64_character_jwt_secret_here
CSRF_SECRET=your_64_character_csrf_secret_here

# Application Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
VERIFICATION_CODE_EXPIRY_MINUTES=10
MAX_VERIFICATION_ATTEMPTS=3

# Development
NODE_ENV=development
```

## Implementation Checklist

### ✅ Phase 1: Database Foundation (Days 1-3)

- [ ] Create Supabase tables with migrations
- [ ] Set up Row Level Security policies
- [ ] Create utility functions
- [ ] Test database connections

### ✅ Phase 2: Email System (Days 4-7)

- [ ] Install AWS SES and React Email dependencies
- [ ] Configure AWS SES client
- [ ] Create email template structure
- [ ] Build verification code email template
- [ ] Implement email service class
- [ ] Test email sending functionality

### ✅ Phase 3: Authentication & Tokens (Days 8-12)

- [ ] Implement token service
- [ ] Create verification service
- [ ] Set up code hashing and validation
- [ ] Test token generation and verification

### ✅ Phase 4: API Routes (Days 13-15)

- [ ] Create verification initiation API
- [ ] Build code verification API
- [ ] Add error handling and logging
- [ ] Test API endpoints

### ✅ Phase 5: UI Components (Days 16-20)

- [ ] Build verification page
- [ ] Create dashboard page
- [ ] Add loading states and error handling
- [ ] Test user flow end-to-end

### ✅ Phase 6: Configuration & Testing (Days 21-22)

- [ ] Set up environment variables
- [ ] Configure deployment settings
- [ ] Conduct comprehensive testing
- [ ] Deploy to staging environment

## Why This Order?

1. **Database First**: Everything depends on data structure
2. **Email System Early**: Critical for verification flow and can be tested independently
3. **Auth & Tokens**: Core security layer that connects email and UI
4. **API Routes**: Bridge between backend services and frontend
5. **UI Last**: Can be built once backend is stable
6. **Configuration**: Final step before deployment

This approach minimizes dependencies and allows for incremental testing at each phase. Each phase can be completed and tested before moving to the next, reducing integration issues.

## Next Steps

**Start with Phase 1** - Database setup is the foundation everything else builds on. Once you have the database tables created and tested, you can move to Phase 2 (Email System) which can be developed and tested independently.

Would you like me to help you implement Phase 1 first, or do you have questions about any specific part of this roadmap?
