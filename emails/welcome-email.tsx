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
  Button,
  Hr,
  Img,
} from '@react-email/components'
import type * as React from 'react'
import type { WelcomeEmailProps } from '../lib/email-types'

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

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({
  recipientEmail,
  applicantName,
  loanApplicationNumber,
  dashboardUrl,
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
          Welcome to FCU Loan Status Portal - Your account is now verified and
          ready to use
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
          {/* Header Section */}
          <Section
            style={{
              backgroundColor: brandColors.primary,
              padding: '32px 32px 28px',
              textAlign: 'center',
              borderBottom: `4px solid ${brandColors.secondary}`,
            }}
          >
            <Row>
              <Column>
                <Img
                  src='https://loanstatushub.firstcreditunion.co.nz/logo/android-chrome-192x192.png'
                  alt='FCU Logo'
                  width='96'
                  height='96'
                  style={{
                    margin: '0 auto 20px',
                    display: 'block',
                  }}
                />
                <Text
                  style={{
                    color: brandColors.background.white,
                    fontSize: '48px',
                    textAlign: 'center',
                    margin: '0 0 12px 0',
                    lineHeight: '1',
                  }}
                >
                  ✅
                </Text>
                <Heading
                  as='h1'
                  style={{
                    color: brandColors.background.white,
                    fontSize: '28px',
                    fontWeight: '700',
                    margin: '0',
                    lineHeight: '1.2',
                    letterSpacing: '-0.4px',
                  }}
                >
                  Welcome to Your Dashboard!
                </Heading>
                <Text
                  style={{
                    color: '#f4fce4',
                    fontSize: '16px',
                    textAlign: 'center',
                    margin: '10px 0 0 0',
                    lineHeight: '1.5',
                  }}
                >
                  Your account has been successfully verified
                </Text>
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
                    margin: '0 0 24px 0',
                  }}
                >
                  Congratulations! Your email has been successfully verified and
                  your account is now active. You can now access your loan
                  application status dashboard anytime.
                </Text>

                <Text
                  style={{
                    color: brandColors.text.secondary,
                    fontSize: '16px',
                    lineHeight: '1.6',
                    margin: '0',
                  }}
                >
                  Your loan application{' '}
                  <strong style={{ color: brandColors.text.primary }}>
                    #{loanApplicationNumber}
                  </strong>{' '}
                  is being processed, and you&apos;ll be able to track its
                  progress in real-time through your personalized dashboard.
                </Text>
              </Column>
            </Row>
          </Section>

          {/* CTA Section */}
          <Section
            style={{
              padding: '32px 32px 0',
            }}
          >
            <Section
              style={{
                width: '72px',
                height: '4px',
                backgroundColor: brandColors.secondary,
                margin: '0 auto 28px',
                borderRadius: '999px',
              }}
            />
            <Section style={{ textAlign: 'center' }}>
              <Button
                href={dashboardUrl}
                style={{
                  backgroundColor: brandColors.primary,
                  color: brandColors.background.white,
                  padding: '16px 36px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '16px',
                  letterSpacing: '0.4px',
                  display: 'inline-block',
                }}
              >
                Access Your Dashboard
              </Button>
            </Section>
          </Section>

          {/* Features Section */}
          <Section
            style={{
              padding: '40px 32px 0',
            }}
          >
            <Section
              style={{
                backgroundColor: brandColors.background.lighter,
                borderRadius: '12px',
                border: `1px solid ${brandColors.border.light}`,
                padding: '32px',
              }}
            >
              <Heading
                as='h3'
                style={{
                  color: brandColors.text.primary,
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: '0 0 28px 0',
                  textAlign: 'center',
                }}
              >
                What you can do in your dashboard:
              </Heading>

              <table
                style={{
                  width: '100%',
                  borderCollapse: 'separate',
                  borderSpacing: '0 16px',
                }}
              >
                <tr>
                  <td
                    style={{
                      padding: '16px 20px',
                      borderRadius: '10px',
                      border: `1px solid ${brandColors.border.light}`,
                      backgroundColor: brandColors.background.white,
                    }}
                  >
                    <table width='100%'>
                      <tr>
                        <td style={{ width: '36px', verticalAlign: 'top' }}>
                          <Text
                            style={{
                              fontSize: '22px',
                              margin: '0',
                            }}
                          >
                            📊
                          </Text>
                        </td>
                        <td style={{ verticalAlign: 'top' }}>
                          <Text
                            style={{
                              color: brandColors.text.primary,
                              fontSize: '16px',
                              fontWeight: '600',
                              margin: '0 0 4px 0',
                            }}
                          >
                            Track Application Status
                          </Text>
                          <Text
                            style={{
                              color: brandColors.text.secondary,
                              fontSize: '14px',
                              lineHeight: '1.5',
                              margin: '0',
                            }}
                          >
                            Monitor your loan application progress in real-time
                          </Text>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: '16px 20px',
                      borderRadius: '10px',
                      border: `1px solid ${brandColors.border.light}`,
                      backgroundColor: brandColors.background.white,
                    }}
                  >
                    <table width='100%'>
                      <tr>
                        <td style={{ width: '36px', verticalAlign: 'top' }}>
                          <Text
                            style={{
                              fontSize: '22px',
                              margin: '0',
                            }}
                          >
                            📋
                          </Text>
                        </td>
                        <td style={{ verticalAlign: 'top' }}>
                          <Text
                            style={{
                              color: brandColors.text.primary,
                              fontSize: '16px',
                              fontWeight: '600',
                              margin: '0 0 4px 0',
                            }}
                          >
                            View Required Documents
                          </Text>
                          <Text
                            style={{
                              color: brandColors.text.secondary,
                              fontSize: '14px',
                              lineHeight: '1.5',
                              margin: '0',
                            }}
                          >
                            See what documents are needed and their status
                          </Text>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: '16px 20px',
                      borderRadius: '10px',
                      border: `1px solid ${brandColors.border.light}`,
                      backgroundColor: brandColors.background.white,
                    }}
                  >
                    <table width='100%'>
                      <tr>
                        <td style={{ width: '36px', verticalAlign: 'top' }}>
                          <Text
                            style={{
                              fontSize: '22px',
                              margin: '0',
                            }}
                          >
                            🔔
                          </Text>
                        </td>
                        <td style={{ verticalAlign: 'top' }}>
                          <Text
                            style={{
                              color: brandColors.text.primary,
                              fontSize: '16px',
                              fontWeight: '600',
                              margin: '0 0 4px 0',
                            }}
                          >
                            Receive Updates
                          </Text>
                          <Text
                            style={{
                              color: brandColors.text.secondary,
                              fontSize: '14px',
                              lineHeight: '1.5',
                              margin: '0',
                            }}
                          >
                            Get notified when your application status changes
                          </Text>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: '16px 20px',
                      borderRadius: '10px',
                      border: `1px solid ${brandColors.border.light}`,
                      backgroundColor: brandColors.background.white,
                    }}
                  >
                    <table width='100%'>
                      <tr>
                        <td style={{ width: '36px', verticalAlign: 'top' }}>
                          <Text
                            style={{
                              fontSize: '22px',
                              margin: '0',
                            }}
                          >
                            💬
                          </Text>
                        </td>
                        <td style={{ verticalAlign: 'top' }}>
                          <Text
                            style={{
                              color: brandColors.text.primary,
                              fontSize: '16px',
                              fontWeight: '600',
                              margin: '0 0 4px 0',
                            }}
                          >
                            Direct Communication
                          </Text>
                          <Text
                            style={{
                              color: brandColors.text.secondary,
                              fontSize: '14px',
                              lineHeight: '1.5',
                              margin: '0',
                            }}
                          >
                            Communicate directly with your loan officer
                          </Text>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </Section>
          </Section>

          <Section style={{ padding: '32px 32px 0' }}>
            <Hr
              style={{
                border: 'none',
                borderTop: `1px solid ${brandColors.border.light}`,
                margin: '0 0 32px 0',
              }}
            />
          </Section>

          {/* Security Info */}
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
                  margin: '0 0 12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '34px',
                    height: '34px',
                    borderRadius: '999px',
                    backgroundColor: brandColors.secondary,
                    color: brandColors.primary,
                    fontWeight: '700',
                    fontSize: '16px',
                    lineHeight: '34px',
                    textAlign: 'center',
                    letterSpacing: '0.5px',
                  }}
                >
                  SEC
                </span>
                🔐 Security & Privacy
              </Text>
              <Text
                style={{
                  color: brandColors.text.secondary,
                  fontSize: '14px',
                  lineHeight: '1.6',
                  margin: '0',
                }}
              >
                Your dashboard sessions are limited to 15 minutes for security.
                You&apos;ll need to verify your email again for each new session
                to keep your information safe.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
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
                      }}
                    >
                      <Img
                        src='https://loanstatushub.firstcreditunion.co.nz/logo/favicon-32x32.png'
                        alt='Support Icon'
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
                  Questions? We&apos;re here to help!{' '}
                  <a
                    href={`mailto:${supportEmail}`}
                    style={{
                      color: brandColors.primary,
                      textDecoration: 'none',
                      fontWeight: '500',
                    }}
                  >
                    Contact Support
                  </a>
                </Text>

                <Text
                  style={{
                    color: brandColors.text.secondary,
                    fontSize: '14px',
                    textAlign: 'center',
                    margin: '0 0 16px 0',
                    lineHeight: '1.6',
                  }}
                >
                  <a
                    href={dashboardUrl}
                    style={{
                      color: brandColors.primary,
                      textDecoration: 'none',
                      fontWeight: '500',
                    }}
                  >
                    Access Your Dashboard →
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
                  This email was sent to {recipientEmail} for loan application #
                  {loanApplicationNumber}.
                  <br />
                  FCU - Your trusted financial partner since 1951
                </Text>
              </Column>
            </Row>
          </Section>
        </Container>
      </Container>
    </Html>
  )
}

export default WelcomeEmail
