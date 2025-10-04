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
        <meta name='color-scheme' content='light dark' />
        <meta name='supported-color-schemes' content='light dark' />
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
          {`🔐 Your FCU verification code is ${verificationCode} for loan #${loanApplicationNumber}. Valid for ${expiresInMinutes} minutes. Enter this code to securely access your loan status dashboard.`}
        </Preview>
      </Head>

      <Container
        style={{
          backgroundColor: brandColors.background.lighter,
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
              padding: '32px 32px 28px',
              textAlign: 'center',
              borderBottom: `4px solid ${brandColors.secondary}`,
              position: 'relative',
            }}
          >
            <Row>
              <Column>
                <Img
                  src='https://loanstatushub.firstcreditunion.co.nz/logo/android-chrome-192x192.png'
                  alt='First Credit Union - Your trusted financial partner'
                  width='96'
                  height='96'
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
            <Section
              style={{
                backgroundColor: brandColors.background.white,
                borderRadius: '16px',
                border: `2px solid ${brandColors.border.light}`,
                padding: '32px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
              }}
            >
              <Row>
                <Column>
                  <Heading
                    as='h2'
                    style={{
                      color: brandColors.text.primary,
                      fontSize: '26px',
                      fontWeight: '600',
                      margin: '0 0 20px 0',
                      lineHeight: '1.25',
                    }}
                  >
                    Hello {applicantName},
                  </Heading>

                  <Text
                    style={{
                      color: brandColors.text.secondary,
                      fontSize: '16px',
                      lineHeight: '1.6',
                      margin: '0 0 16px 0',
                    }}
                  >
                    You&apos;re receiving this email because you&apos;ve
                    requested access to view the status of your loan application{' '}
                    <strong style={{ color: brandColors.text.primary }}>
                      #{loanApplicationNumber}
                    </strong>
                    .
                  </Text>

                  <Text
                    style={{
                      color: brandColors.text.secondary,
                      fontSize: '16px',
                      lineHeight: '1.6',
                      margin: '0',
                    }}
                  >
                    To verify your identity and access your account, please use
                    the verification code below:
                  </Text>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* Hero Verification Code Section */}
          <Section
            style={{
              padding: '36px 32px',
            }}
          >
            <Section
              style={{
                width: '72px',
                height: '4px',
                backgroundColor: brandColors.primary,
                margin: '0 auto 24px',
                borderRadius: '999px',
              }}
            />
            <Section
              style={{
                backgroundColor: brandColors.background.white,
                border: `3px solid ${brandColors.primary}`,
                borderRadius: '16px',
                padding: '40px 24px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0, 104, 127, 0.15)',
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
                  lineHeight: '1.4',
                }}
              >
                Your Verification Code
              </Text>

              <Section
                style={{
                  backgroundColor: brandColors.background.lighter,
                  borderRadius: '12px',
                  padding: '20px 16px',
                  margin: '0 auto 20px',
                  maxWidth: '320px',
                  border: `2px solid ${brandColors.border.light}`,
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Text
                  style={{
                    color: brandColors.primary,
                    fontSize: '44px',
                    fontWeight: '700',
                    fontFamily: '"Courier New", Courier, monospace',
                    letterSpacing: '10px',
                    margin: '0',
                    lineHeight: '1.2',
                  }}
                >
                  {verificationCode}
                </Text>
              </Section>

              <Section
                style={{
                  backgroundColor: `${brandColors.secondary}20`,
                  borderRadius: '999px',
                  padding: '12px 24px',
                  display: 'inline-block',
                  border: `2px solid ${brandColors.secondary}`,
                  boxShadow: '0 2px 4px rgba(187, 187, 20, 0.15)',
                }}
              >
                <Text
                  style={{
                    color: brandColors.text.primary,
                    fontSize: '14px',
                    margin: '0',
                    fontWeight: '600',
                    lineHeight: '1.4',
                  }}
                >
                  ⏱️ Expires in{' '}
                  <span
                    style={{ color: brandColors.primary, fontSize: '15px' }}
                  >
                    {expiresInMinutes} minutes
                  </span>
                </Text>
              </Section>
            </Section>
          </Section>

          {/* Instructions Section */}
          <Section
            style={{
              padding: '0 32px 36px',
            }}
          >
            <Section
              style={{
                backgroundColor: brandColors.background.white,
                borderRadius: '16px',
                border: `2px solid ${brandColors.border.light}`,
                padding: '32px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
              }}
            >
              <Section
                style={{
                  width: '56px',
                  height: '3px',
                  backgroundColor: brandColors.secondary,
                  margin: '0 0 20px',
                  borderRadius: '999px',
                }}
              />
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
                    role='presentation'
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                    }}
                  >
                    <tr>
                      <td
                        style={{
                          padding: '16px 18px',
                          verticalAlign: 'top',
                          backgroundColor: brandColors.background.lighter,
                          borderRadius: '12px',
                          border: `2px solid ${brandColors.border.light}`,
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
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
                      <td style={{ padding: '8px 0' }} />
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: '16px 18px',
                          verticalAlign: 'top',
                          backgroundColor: brandColors.background.lighter,
                          borderRadius: '12px',
                          border: `2px solid ${brandColors.border.light}`,
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
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
                      <td style={{ padding: '8px 0' }} />
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: '16px 18px',
                          verticalAlign: 'top',
                          backgroundColor: brandColors.background.lighter,
                          borderRadius: '12px',
                          border: `2px solid ${brandColors.border.light}`,
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
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
          </Section>

          <Section style={{ padding: '0 32px' }}>
            <Hr
              style={{
                border: 'none',
                borderTop: `1px solid ${brandColors.border.light}`,
                margin: '0 0 36px 0',
              }}
            />
          </Section>

          {/* Security Notice with Secondary Color */}
          <Section
            style={{
              padding: '0 32px 36px',
            }}
          >
            <Section
              style={{
                backgroundColor: `${brandColors.secondary}15`,
                border: `2px solid ${brandColors.secondary}`,
                borderRadius: '14px',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(187, 187, 20, 0.1)',
              }}
            >
              <Text
                style={{
                  color: brandColors.text.primary,
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: '0 0 12px 0',
                }}
              >
                🔐 Security Notice
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
              padding: '36px 32px',
              borderTop: `1px solid ${brandColors.border.light}`,
            }}
          >
            <Row>
              <Column>
                <table
                  role='presentation'
                  align='center'
                  style={{
                    margin: '0 auto 20px',
                    borderCollapse: 'separate',
                    borderSpacing: '12px',
                  }}
                >
                  <tr>
                    <td
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '999px',
                        backgroundColor: brandColors.primary,
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        boxShadow: '0 2px 4px rgba(0, 104, 127, 0.2)',
                      }}
                    >
                      <Img
                        src='https://loanstatushub.firstcreditunion.co.nz/logo/favicon-32x32.png'
                        alt='FCU Support'
                        width='20'
                        height='20'
                        style={{
                          display: 'inline-block',
                          margin: '10px auto',
                        }}
                      />
                    </td>
                  </tr>
                </table>
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
                    margin: '0 0 12px 0',
                    lineHeight: '1.6',
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
                <Text
                  style={{
                    color: brandColors.text.secondary,
                    fontSize: '11px',
                    textAlign: 'center',
                    margin: '0',
                    lineHeight: '1.6',
                  }}
                >
                  <strong style={{ color: brandColors.primary }}>
                    First Credit Union
                  </strong>{' '}
                  • Your trusted financial partner since 1951
                  <br />© {new Date().getFullYear()} FCU. All rights reserved.
                </Text>
              </Column>
            </Row>
          </Section>
        </Container>
      </Container>
    </Html>
  )
}

export default VerificationCodeEmail
