import {
  Html,
  Head,
  Font,
  Preview,
  Tailwind,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Hr,
} from '@react-email/components'
import type * as React from 'react'
import type { VerificationCodeEmailProps } from '../lib/email-types'

// FCU Brand Colors (converted to hex for email compatibility)
const fcuColors = {
  primary: {
    50: '#e0f2fe', // oklch(86.62% 0.048 227.58)
    500: '#0369a1', // oklch(47.85% 0.087 220.03) - main brand blue
    600: '#0284c7', // oklch(44.33% 0.07 221.44)
    900: '#0c4a6e', // oklch(34.23% 0.038 223.01)
  },
  secondary: {
    500: '#22c55e', // oklch(65.84% 0.11 109.06) - brand green
    600: '#16a34a', // oklch(60.82% 0.091 108.81)
  },
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    600: '#4b5563',
    800: '#1f2937',
    900: '#111827',
  },
}

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
    <Html lang='en' dir='ltr'>
      <Head>
        <Font
          fontFamily='Inter'
          fallbackFontFamily='Arial'
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle='normal'
        />
        <Preview>
          {`Your verification code: ${verificationCode} - Expires in ${expiresInMinutes} minutes`}
        </Preview>
      </Head>

      <Tailwind>
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: 'Inter, Arial, sans-serif',
          }}
        >
          {/* Header */}
          <Section
            style={{
              backgroundColor: fcuColors.primary[500],
              borderRadius: '12px 12px 0 0',
              padding: '32px 24px',
            }}
          >
            <Row>
              <Column>
                <Heading
                  as='h1'
                  style={{
                    color: 'white',
                    fontSize: '28px',
                    fontWeight: '700',
                    textAlign: 'center',
                    margin: '0',
                    lineHeight: '1.2',
                  }}
                >
                  FCU Loan Status Portal
                </Heading>
                <Text
                  style={{
                    color: fcuColors.primary[50],
                    fontSize: '16px',
                    textAlign: 'center',
                    margin: '8px 0 0 0',
                    lineHeight: '1.5',
                  }}
                >
                  Secure Access Verification
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Section
            style={{
              backgroundColor: 'white',
              padding: '40px 32px',
              borderLeft: `1px solid ${fcuColors.neutral[100]}`,
              borderRight: `1px solid ${fcuColors.neutral[100]}`,
            }}
          >
            <Row>
              <Column>
                <Heading
                  as='h2'
                  style={{
                    color: fcuColors.neutral[800],
                    fontSize: '24px',
                    fontWeight: '600',
                    margin: '0 0 16px 0',
                    lineHeight: '1.3',
                  }}
                >
                  Hello {applicantName},
                </Heading>

                <Text
                  style={{
                    color: fcuColors.neutral[600],
                    fontSize: '16px',
                    lineHeight: '1.6',
                    margin: '0 0 24px 0',
                  }}
                >
                  You&apos;re receiving this email because you&apos;ve requested
                  access to view the status of your loan application{' '}
                  <strong>#{loanApplicationNumber}</strong>.
                </Text>

                <Text
                  style={{
                    color: fcuColors.neutral[600],
                    fontSize: '16px',
                    lineHeight: '1.6',
                    margin: '0 0 32px 0',
                  }}
                >
                  To verify your identity and secure your account, please use
                  the verification code below:
                </Text>
              </Column>
            </Row>

            {/* Verification Code Section */}
            <Section
              style={{
                backgroundColor: fcuColors.neutral[50],
                border: `2px solid ${fcuColors.primary[500]}`,
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                margin: '0 0 32px 0',
              }}
            >
              <Text
                style={{
                  color: fcuColors.neutral[600],
                  fontSize: '14px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  margin: '0 0 12px 0',
                }}
              >
                Your Verification Code
              </Text>

              <Text
                style={{
                  color: fcuColors.primary[600],
                  fontSize: '48px',
                  fontWeight: '700',
                  fontFamily: 'monospace',
                  letterSpacing: '8px',
                  margin: '0 0 16px 0',
                  lineHeight: '1',
                }}
              >
                {verificationCode}
              </Text>

              <Text
                style={{
                  color: fcuColors.neutral[600],
                  fontSize: '14px',
                  margin: '0',
                }}
              >
                This code expires in <strong>{expiresInMinutes} minutes</strong>
              </Text>
            </Section>

            {/* Instructions */}
            <Row>
              <Column>
                <Text
                  style={{
                    color: fcuColors.neutral[600],
                    fontSize: '16px',
                    lineHeight: '1.6',
                    margin: '0 0 24px 0',
                  }}
                >
                  <strong>Next steps:</strong>
                </Text>

                <Text
                  style={{
                    color: fcuColors.neutral[600],
                    fontSize: '15px',
                    lineHeight: '1.6',
                    margin: '0 0 12px 0',
                  }}
                >
                  1. Return to the loan status portal
                </Text>

                <Text
                  style={{
                    color: fcuColors.neutral[600],
                    fontSize: '15px',
                    lineHeight: '1.6',
                    margin: '0 0 12px 0',
                  }}
                >
                  2. Enter the 6-digit code above
                </Text>

                <Text
                  style={{
                    color: fcuColors.neutral[600],
                    fontSize: '15px',
                    lineHeight: '1.6',
                    margin: '0 0 32px 0',
                  }}
                >
                  3. Access your loan application status dashboard
                </Text>
              </Column>
            </Row>

            <Hr
              style={{
                border: 'none',
                borderTop: `1px solid ${fcuColors.neutral[100]}`,
                margin: '32px 0',
              }}
            />

            {/* Security Notice */}
            <Section
              style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '20px',
                margin: '0 0 32px 0',
              }}
            >
              <Text
                style={{
                  color: '#92400e',
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                }}
              >
                🔒 Security Notice
              </Text>
              <Text
                style={{
                  color: '#92400e',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  margin: '0',
                }}
              >
                Never share this verification code with anyone. FCU staff will
                never ask for your verification code via phone or email.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section
            style={{
              backgroundColor: fcuColors.neutral[50],
              borderRadius: '0 0 12px 12px',
              padding: '32px 24px',
              borderLeft: `1px solid ${fcuColors.neutral[100]}`,
              borderRight: `1px solid ${fcuColors.neutral[100]}`,
              borderBottom: `1px solid ${fcuColors.neutral[100]}`,
            }}
          >
            <Row>
              <Column>
                <Text
                  style={{
                    color: fcuColors.neutral[600],
                    fontSize: '14px',
                    textAlign: 'center',
                    margin: '0 0 16px 0',
                    lineHeight: '1.5',
                  }}
                >
                  Need help? Contact our support team at{' '}
                  <a
                    href={`mailto:${supportEmail}`}
                    style={{
                      color: fcuColors.primary[600],
                      textDecoration: 'none',
                    }}
                  >
                    {supportEmail}
                  </a>
                </Text>

                <Text
                  style={{
                    color: fcuColors.neutral[600],
                    fontSize: '12px',
                    textAlign: 'center',
                    margin: '0',
                    lineHeight: '1.4',
                  }}
                >
                  This email was sent to {recipientEmail} for loan application #
                  {loanApplicationNumber}.
                  <br />
                  If you did not request this verification, please contact us
                  immediately.
                </Text>
              </Column>
            </Row>
          </Section>
        </Container>
      </Tailwind>
    </Html>
  )
}

export default VerificationCodeEmail
