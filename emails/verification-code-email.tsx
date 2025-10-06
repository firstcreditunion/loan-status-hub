import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Hr,
  Img,
  Link,
} from '@react-email/components'
import type * as React from 'react'
import type { VerificationCodeEmailProps } from '../lib/email-types'

const toCurrentYear = new Date().getFullYear()

export const VerificationCodeEmail: React.FC<
  Readonly<VerificationCodeEmailProps>
> = ({
  recipientEmail,
  verificationCode,
  loanApplicationNumber,
  applicantName,
  expiresInMinutes,
  supportEmail,
}) => {
  return (
    <Html>
      <Head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        <link
          href='https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap'
          rel='stylesheet'
        />
      </Head>
      <Preview>
        {`🔐 Your FCU verification code is ${verificationCode} for loan #${loanApplicationNumber}. Valid for ${expiresInMinutes} minutes. Enter this code to securely access your loan status dashboard.`}
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerSectionStyle}>
            <Text style={confirmationLabelStyle}>Email Verification</Text>
            <Heading style={mainHeadingStyle}>
              Verify Your Identity to Access Loan Status
            </Heading>
            <Text style={greetingStyle}>Hello {applicantName},</Text>
            <Text style={introTextStyle}>
              You&apos;re receiving this email because you&apos;ve requested
              access to view the status of your loan application{' '}
              <strong>#{loanApplicationNumber}</strong>. To verify your identity
              and access your account, please use the verification code below:
            </Text>
          </Section>

          <Section style={verificationCodeBoxStyle}>
            <Heading style={verificationCodeHeadingStyle}>
              Your Verification Code
            </Heading>
            <Text style={verificationCodeValueStyle}>{verificationCode}</Text>

            <Text style={expiryLabelStyle}>
              ⏱️ Expires in {expiresInMinutes} minutes
            </Text>
          </Section>

          <Section style={instructionsSectionStyle}>
            <Row>
              <Column style={instructionsColumnStyle}>
                <Text style={instructionsHeadingStyle}>
                  <strong>Next steps:</strong>
                </Text>
                <Text style={instructionTextStyle}>
                  <strong>1.</strong> Return to the loan status portal
                </Text>
                <Text style={instructionTextStyle}>
                  <strong>2.</strong> Enter the 6-digit code above
                </Text>
                <Text style={instructionTextStyle}>
                  <strong>3.</strong> Access your loan application status
                  dashboard
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Section style={securityNoticeSectionStyle}>
            <Row>
              <Column style={securityNoticeColumnStyle}>
                <Text style={securityNoticeHeadingStyle}>
                  <strong>🔐 Security Notice</strong>
                </Text>
                <Text style={securityNoticeTextStyle}>
                  Never share this verification code with anyone. FCU staff will
                  never ask for your verification code via phone or email. If
                  you did not request this code, please contact us immediately.
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Text style={bodyTextStyle}>
            Need help? Contact our support team at{' '}
            <Link style={anchor} href={`mailto:${supportEmail}`}>
              {supportEmail}
            </Link>
            .
          </Text>
          <Text style={bodyTextStyle}>
            This email was sent to <strong>{recipientEmail}</strong> for loan
            application <strong>#{loanApplicationNumber}</strong>.
          </Text>

          <Hr style={hr} />
          <Section style={footer}>
            <Row>
              <Text style={footerTextStyle}>
                ©{toCurrentYear} First Credit Union, All Rights Reserved <br />
                111 Collingwood Street, Hamilton Central, Hamilton 3204
              </Text>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default VerificationCodeEmail

// Inline styles for Outlook compatibility
const bodyStyle = {
  backgroundColor: '#f9fafb',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: 0,
  padding: 0,
}

const containerStyle = {
  margin: '0 auto',
  width: '100%',
  maxWidth: '600px',
  padding: 0,
  backgroundColor: '#ffffff',
}

const headerSectionStyle = {
  padding: '48px 40px 32px 40px',
  textAlign: 'center' as const,
}

const logoStyle = {
  margin: '0 auto 24px auto',
  display: 'block',
}

const confirmationLabelStyle = {
  fontSize: '12px',
  fontWeight: '600' as const,
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
  letterSpacing: '0.1em',
  color: '#6b7280',
  margin: '0 0 8px 0',
}

const mainHeadingStyle = {
  margin: '0 0 32px 0',
  fontSize: '24px',
  fontWeight: '600' as const,
  lineHeight: '1.3',
  textAlign: 'center' as const,
  color: '#111827',
}

const greetingStyle = {
  fontSize: '16px',
  marginTop: '0',
  marginBottom: '16px',
  fontWeight: '600' as const,
  lineHeight: '1.5',
  letterSpacing: '-0.01em',
  color: '#111827',
  textAlign: 'left' as const,
}

const introTextStyle = {
  marginBottom: '32px',
  fontSize: '16px',
  lineHeight: '1.6',
  letterSpacing: '-0.01em',
  color: '#374151',
  textAlign: 'left' as const,
}

const verificationCodeBoxStyle = {
  margin: '24px 0',
  backgroundColor: '#29819a',
  borderRadius: '16px',
  padding: '32px 40px',
  textAlign: 'center' as const,
}

const verificationCodeHeadingStyle = {
  margin: 0,
  fontSize: '12px',
  fontWeight: '500' as const,
  color: '#bbbb14',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
}

const verificationCodeValueStyle = {
  marginTop: '16px',
  marginBottom: '24px',
  fontSize: '48px',
  fontWeight: 'bold' as const,
  color: '#ffffff',
  lineHeight: '1',
  letterSpacing: '10px',
  fontFamily: '"Courier New", Courier, monospace',
}

const expiryLabelStyle = {
  margin: 0,
  fontSize: '14px',
  fontWeight: '300' as const,
  color: '#ffffff',
  letterSpacing: '-0.01em',
}

const instructionsSectionStyle = {
  margin: '40px 0 24px 0',
}

const instructionsColumnStyle = {
  width: '100%',
  padding: '0 40px',
}

const instructionsHeadingStyle = {
  margin: '0 0 12px 0',
  fontSize: '18px',
  fontWeight: '600' as const,
  lineHeight: '1.4',
  color: '#111827',
}

const instructionTextStyle = {
  margin: '0 0 12px 0',
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#374151',
}

const securityNoticeSectionStyle = {
  margin: '24px 0',
}

const securityNoticeColumnStyle = {
  width: '100%',
  padding: '0 40px',
}

const securityNoticeHeadingStyle = {
  margin: '0 0 12px 0',
  fontSize: '16px',
  fontWeight: '600' as const,
  lineHeight: '1.4',
  color: '#111827',
}

const securityNoticeTextStyle = {
  margin: '0',
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#374151',
}

const bodyTextStyle = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 40px 16px 40px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 40px',
  width: 'auto',
  border: 'none',
  borderTop: '1px solid #e5e7eb',
}

const footer = {
  padding: '32px 40px 40px 40px',
}

const footerTextStyle = {
  textAlign: 'center' as const,
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: 0,
}

const anchor = {
  color: '#00687f',
  textDecoration: 'underline',
}
