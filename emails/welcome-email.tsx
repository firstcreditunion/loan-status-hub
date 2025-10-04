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
          🎉 Welcome to FCU Loan Status Portal! Your account for loan #
          {loanApplicationNumber} is verified and ready. Access your
          personalized dashboard now to track your application in real-time.
        </Preview>
      </Head>

      <Container
        style={{
          backgroundColor: brandColors.background.lighter,
          padding: '32px 12px',
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
                    margin: '0 auto 20px',
                    display: 'block',
                  }}
                />
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
            <Section
              style={{
                backgroundColor: brandColors.background.white,
                borderRadius: '16px',
                border: `2px solid ${brandColors.border.light}`,
                padding: '24px 20px',
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
                    Hi {applicantName},
                  </Heading>

                  <Text
                    style={{
                      color: brandColors.text.secondary,
                      fontSize: '16px',
                      lineHeight: '1.6',
                      margin: '0 0 24px 0',
                    }}
                  >
                    Your email has been successfully verified. You can now
                    access your loan application status dashboard anytime.
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
                    progress in real-time through your personalised dashboard.
                  </Text>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* CTA Section */}
          <Section
            style={{
              padding: '32px 32px 0',
            }}
          >
            <Section
              style={{
                backgroundColor: `${brandColors.primary}08`,
                borderRadius: '16px',
                border: `2px solid ${brandColors.primary}40`,
                padding: '24px 20px',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0, 104, 127, 0.08)',
              }}
            >
              <Section
                style={{
                  width: '72px',
                  height: '4px',
                  backgroundColor: brandColors.secondary,
                  margin: '0 auto 24px',
                  borderRadius: '999px',
                }}
              />
              <Text
                style={{
                  color: brandColors.text.primary,
                  fontSize: '18px',
                  fontWeight: '600',
                  margin: '0 0 20px 0',
                  textAlign: 'center',
                  lineHeight: '1.4',
                }}
              >
                Ready to view your application?
              </Text>
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
                  boxShadow: '0 2px 8px rgba(0, 104, 127, 0.25)',
                  border: 'none',
                }}
              >
                Access Your Dashboard →
              </Button>
            </Section>
          </Section>

          {/* Features Section */}
          <Section
            style={{
              padding: '32px 32px 0',
            }}
          >
            <Section
              style={{
                backgroundColor: brandColors.background.white,
                borderRadius: '16px',
                border: `2px solid ${brandColors.border.light}`,
                padding: '24px 20px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
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
                role='presentation'
                style={{
                  width: '100%',
                  borderCollapse: 'separate',
                  borderSpacing: '0 16px',
                }}
              >
                <tr>
                  <td
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      border: `2px solid ${brandColors.border.light}`,
                      backgroundColor: brandColors.background.lighter,
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    <table width='100%' role='presentation'>
                      <tr>
                        <td style={{ width: '36px', verticalAlign: 'top' }}>
                          <Text
                            style={{
                              fontSize: '22px',
                              margin: '0',
                            }}
                            role='img'
                            aria-label='Chart'
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
                              lineHeight: '1.4',
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
                      padding: '16px',
                      borderRadius: '14px',
                      border: `2px solid ${brandColors.border.light}`,
                      backgroundColor: brandColors.background.lighter,
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    <table width='100%' role='presentation'>
                      <tr>
                        <td style={{ width: '36px', verticalAlign: 'top' }}>
                          <Text
                            style={{
                              fontSize: '22px',
                              margin: '0',
                            }}
                            role='img'
                            aria-label='Documents'
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
                              lineHeight: '1.4',
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
              padding: '0 32px 32px',
            }}
          >
            <Section
              style={{
                backgroundColor: `${brandColors.secondary}15`,
                border: `2px solid ${brandColors.secondary}`,
                borderRadius: '14px',
                padding: '20px 16px',
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
                Your dashboard sessions are limited to{' '}
                <strong style={{ color: brandColors.text.primary }}>
                  15 minutes
                </strong>{' '}
                for security. You&apos;ll need to verify your email again for
                each new session to keep your information safe.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section
            style={{
              backgroundColor: brandColors.background.light,
              padding: '32px 24px',
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

export default WelcomeEmail
