import {
  Html,
  Head,
  Font,
  Preview,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Hr,
  Img,
} from '@react-email/components'
import type * as React from 'react'
import type { VerificationCodeEmailProps } from '../lib/email-types'

// FCU Brand Colors - Modern, Clean Palette
const brandColors = {
  primary: '#00687f', // Teal - Main brand color
  secondary: '#bbbb14', // Olive/Gold - Accent color
  text: {
    primary: '#1a1a1a', // Dark text
    secondary: '#666666', // Medium gray
  },
  background: {
    white: '#ffffff',
    light: '#f5f5f5',
    lighter: '#fafafa',
  },
  border: {
    light: '#e5e5e5',
    medium: '#d4d4d4',
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

      <Container
        style={{
          backgroundColor: brandColors.background.lighter,
          backgroundImage:
            'linear-gradient(135deg, rgba(0, 104, 127, 0.08) 0%, rgba(0, 104, 127, 0.02) 100%)',
          padding: '40px 20px',
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        {/* Main Card Container */}
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: brandColors.background.white,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          }}
        >
          {/* Header Section with Logo */}
          <Section
            style={{
              backgroundColor: brandColors.primary,
              padding: '28px 32px 24px',
              textAlign: 'center',
              borderBottom: `4px solid ${brandColors.secondary}`,
            }}
          >
            <Row>
              <Column>
                <Img
                  src='https://loanstatushub.firstcreditunion.co.nz/logo/android-chrome-192x192.png'
                  alt='FCU Logo'
                  width='72'
                  height='72'
                  style={{
                    margin: '0 auto',
                    display: 'block',
                  }}
                />
              </Column>
            </Row>
          </Section>

          {/* Greeting Section */}
          <Section
            style={{
              padding: '40px 32px 0',
            }}
          >
            <Row>
              <Column>
                <Heading
                  as='h2'
                  style={{
                    color: brandColors.text.primary,
                    fontSize: '24px',
                    fontWeight: '600',
                    margin: '0 0 20px 0',
                    lineHeight: '1.3',
                  }}
                >
                  Hello {applicantName},
                </Heading>

                <Text
                  style={{
                    color: brandColors.text.secondary,
                    fontSize: '16px',
                    lineHeight: '1.7',
                    margin: '0 0 16px 0',
                  }}
                >
                  You&apos;re receiving this email because you&apos;ve requested
                  access to view the status of your loan application{' '}
                  <strong style={{ color: brandColors.text.primary }}>
                    #{loanApplicationNumber}
                  </strong>
                  .
                </Text>

                <Text
                  style={{
                    color: brandColors.text.secondary,
                    fontSize: '16px',
                    lineHeight: '1.7',
                    margin: '0',
                  }}
                >
                  To verify your identity and access your account, please use
                  the verification code below:
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Hero Verification Code Section */}
          <Section
            style={{
              padding: '40px 32px',
            }}
          >
            <Section
              style={{
                backgroundColor: brandColors.background.lighter,
                border: `3px solid ${brandColors.primary}`,
                borderRadius: '12px',
                padding: '40px 24px',
                textAlign: 'center',
              }}
            >
              <Text
                style={{
                  color: brandColors.text.secondary,
                  fontSize: '13px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  margin: '0 0 20px 0',
                }}
              >
                Your Verification Code
              </Text>

              <Text
                style={{
                  color: brandColors.primary,
                  fontSize: '44px',
                  fontWeight: '700',
                  fontFamily: '"Courier New", Courier, monospace',
                  letterSpacing: '12px',
                  margin: '0 0 20px 0',
                  lineHeight: '1',
                  padding: '16px 0',
                }}
              >
                {verificationCode}
              </Text>

              <Text
                style={{
                  color: brandColors.text.secondary,
                  fontSize: '14px',
                  margin: '0',
                  fontWeight: '500',
                }}
              >
                Expires in{' '}
                <strong style={{ color: brandColors.text.primary }}>
                  {expiresInMinutes} minutes
                </strong>
              </Text>
            </Section>
          </Section>

          {/* Instructions Section */}
          <Section
            style={{
              padding: '0 32px 32px',
            }}
          >
            <Row>
              <Column>
                <Text
                  style={{
                    color: brandColors.text.primary,
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 0 20px 0',
                  }}
                >
                  Next steps:
                </Text>

                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                  }}
                >
                  <tr>
                    <td
                      style={{
                        padding: '12px 0',
                        verticalAlign: 'top',
                      }}
                    >
                      <Text
                        style={{
                          color: brandColors.primary,
                          fontSize: '18px',
                          fontWeight: '700',
                          margin: '0',
                          width: '32px',
                          display: 'inline-block',
                        }}
                      >
                        1.
                      </Text>
                      <Text
                        style={{
                          color: brandColors.text.secondary,
                          fontSize: '15px',
                          lineHeight: '1.6',
                          margin: '0',
                          display: 'inline',
                        }}
                      >
                        Return to the loan status portal
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: '12px 0',
                        verticalAlign: 'top',
                      }}
                    >
                      <Text
                        style={{
                          color: brandColors.primary,
                          fontSize: '18px',
                          fontWeight: '700',
                          margin: '0',
                          width: '32px',
                          display: 'inline-block',
                        }}
                      >
                        2.
                      </Text>
                      <Text
                        style={{
                          color: brandColors.text.secondary,
                          fontSize: '15px',
                          lineHeight: '1.6',
                          margin: '0',
                          display: 'inline',
                        }}
                      >
                        Enter the 6-digit code above
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: '12px 0',
                        verticalAlign: 'top',
                      }}
                    >
                      <Text
                        style={{
                          color: brandColors.primary,
                          fontSize: '18px',
                          fontWeight: '700',
                          margin: '0',
                          width: '32px',
                          display: 'inline-block',
                        }}
                      >
                        3.
                      </Text>
                      <Text
                        style={{
                          color: brandColors.text.secondary,
                          fontSize: '15px',
                          lineHeight: '1.6',
                          margin: '0',
                          display: 'inline',
                        }}
                      >
                        Access your loan application status dashboard
                      </Text>
                    </td>
                  </tr>
                </table>
              </Column>
            </Row>
          </Section>

          <Section style={{ padding: '0 32px' }}>
            <Hr
              style={{
                border: 'none',
                borderTop: `1px solid ${brandColors.border.light}`,
                margin: '0 0 32px 0',
              }}
            />
          </Section>

          {/* Security Notice with Secondary Color */}
          <Section
            style={{
              padding: '0 32px 40px',
            }}
          >
            <Section
              style={{
                backgroundColor: `${brandColors.secondary}15`,
                border: `2px solid ${brandColors.secondary}`,
                borderRadius: '10px',
                padding: '24px',
              }}
            >
              <Text
                style={{
                  color: brandColors.text.primary,
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                }}
              >
                🔒 Security Notice
              </Text>
              <Text
                style={{
                  color: brandColors.text.secondary,
                  fontSize: '14px',
                  lineHeight: '1.6',
                  margin: '0',
                }}
              >
                Never share this verification code with anyone. FCU staff will
                never ask for your verification code via phone or email. If you
                did not request this code, please contact us immediately.
              </Text>
            </Section>
          </Section>

          {/* Footer Section */}
          <Section
            style={{
              backgroundColor: brandColors.background.light,
              padding: '32px',
              borderTop: `1px solid ${brandColors.border.light}`,
            }}
          >
            <Row>
              <Column>
                <Text
                  style={{
                    color: brandColors.text.secondary,
                    fontSize: '14px',
                    textAlign: 'center',
                    margin: '0 0 16px 0',
                    lineHeight: '1.6',
                  }}
                >
                  Need help? Contact our support team at{' '}
                  <a
                    href={`mailto:${supportEmail}`}
                    style={{
                      color: brandColors.primary,
                      textDecoration: 'none',
                      fontWeight: '500',
                    }}
                  >
                    {supportEmail}
                  </a>
                </Text>

                <Text
                  style={{
                    color: brandColors.text.secondary,
                    fontSize: '12px',
                    textAlign: 'center',
                    margin: '0',
                    lineHeight: '1.5',
                  }}
                >
                  This email was sent to{' '}
                  <strong style={{ color: brandColors.text.primary }}>
                    {recipientEmail}
                  </strong>{' '}
                  for loan application{' '}
                  <strong style={{ color: brandColors.text.primary }}>
                    #{loanApplicationNumber}
                  </strong>
                  .
                </Text>
              </Column>
            </Row>
          </Section>
        </Container>

        {/* Bottom Spacer */}
        <Section style={{ padding: '20px 0 0' }}>
          <Text
            style={{
              color: brandColors.text.secondary,
              fontSize: '11px',
              textAlign: 'center',
              margin: '0',
            }}
          >
            © {new Date().getFullYear()} FCU. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Html>
  )
}

export default VerificationCodeEmail
