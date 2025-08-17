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
  Button,
  Hr,
} from '@react-email/components'
import type * as React from 'react'
import type { WelcomeEmailProps } from '../lib/email-types'

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
              backgroundColor: fcuColors.secondary[500],
              borderRadius: '12px 12px 0 0',
              padding: '32px 24px',
            }}
          >
            <Row>
              <Column>
                <Text
                  style={{
                    color: 'white',
                    fontSize: '48px',
                    textAlign: 'center',
                    margin: '0 0 16px 0',
                    lineHeight: '1',
                  }}
                >
                  ✅
                </Text>
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
                  Welcome to Your Dashboard!
                </Heading>
                <Text
                  style={{
                    color: '#dcfce7', // light green tint
                    fontSize: '16px',
                    textAlign: 'center',
                    margin: '8px 0 0 0',
                    lineHeight: '1.5',
                  }}
                >
                  Your account has been successfully verified
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
                  Congratulations! Your email has been successfully verified and
                  your account is now active. You can now access your loan
                  application status dashboard anytime.
                </Text>

                <Text
                  style={{
                    color: fcuColors.neutral[600],
                    fontSize: '16px',
                    lineHeight: '1.6',
                    margin: '0 0 32px 0',
                  }}
                >
                  Your loan application{' '}
                  <strong>#{loanApplicationNumber}</strong> is being processed,
                  and you&apos;ll be able to track its progress in real-time
                  through your personalized dashboard.
                </Text>
              </Column>
            </Row>

            {/* CTA Button */}
            <Section
              style={{
                textAlign: 'center',
                margin: '0 0 40px 0',
              }}
            >
              <Button
                href={dashboardUrl}
                style={{
                  backgroundColor: fcuColors.primary[500],
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '16px',
                  display: 'inline-block',
                  lineHeight: '1',
                }}
              >
                Access Your Dashboard
              </Button>
            </Section>

            {/* Features Section */}
            <Section
              style={{
                backgroundColor: fcuColors.neutral[50],
                borderRadius: '12px',
                padding: '32px',
                margin: '0 0 32px 0',
              }}
            >
              <Heading
                as='h3'
                style={{
                  color: fcuColors.neutral[800],
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: '0 0 24px 0',
                  textAlign: 'center',
                }}
              >
                What you can do in your dashboard:
              </Heading>

              <Row>
                <Column>
                  <Section style={{ margin: '0 0 20px 0' }}>
                    <Text
                      style={{
                        color: fcuColors.primary[600],
                        fontSize: '18px',
                        margin: '0 0 8px 0',
                      }}
                    >
                      📊
                    </Text>
                    <Text
                      style={{
                        color: fcuColors.neutral[800],
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: '0 0 4px 0',
                      }}
                    >
                      Track Application Status
                    </Text>
                    <Text
                      style={{
                        color: fcuColors.neutral[600],
                        fontSize: '14px',
                        lineHeight: '1.5',
                        margin: '0',
                      }}
                    >
                      Monitor your loan application progress in real-time
                    </Text>
                  </Section>

                  <Section style={{ margin: '0 0 20px 0' }}>
                    <Text
                      style={{
                        color: fcuColors.primary[600],
                        fontSize: '18px',
                        margin: '0 0 8px 0',
                      }}
                    >
                      📋
                    </Text>
                    <Text
                      style={{
                        color: fcuColors.neutral[800],
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: '0 0 4px 0',
                      }}
                    >
                      View Required Documents
                    </Text>
                    <Text
                      style={{
                        color: fcuColors.neutral[600],
                        fontSize: '14px',
                        lineHeight: '1.5',
                        margin: '0',
                      }}
                    >
                      See what documents are needed and their status
                    </Text>
                  </Section>

                  <Section style={{ margin: '0 0 20px 0' }}>
                    <Text
                      style={{
                        color: fcuColors.primary[600],
                        fontSize: '18px',
                        margin: '0 0 8px 0',
                      }}
                    >
                      🔔
                    </Text>
                    <Text
                      style={{
                        color: fcuColors.neutral[800],
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: '0 0 4px 0',
                      }}
                    >
                      Receive Updates
                    </Text>
                    <Text
                      style={{
                        color: fcuColors.neutral[600],
                        fontSize: '14px',
                        lineHeight: '1.5',
                        margin: '0',
                      }}
                    >
                      Get notified when your application status changes
                    </Text>
                  </Section>

                  <Section>
                    <Text
                      style={{
                        color: fcuColors.primary[600],
                        fontSize: '18px',
                        margin: '0 0 8px 0',
                      }}
                    >
                      💬
                    </Text>
                    <Text
                      style={{
                        color: fcuColors.neutral[800],
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: '0 0 4px 0',
                      }}
                    >
                      Direct Communication
                    </Text>
                    <Text
                      style={{
                        color: fcuColors.neutral[600],
                        fontSize: '14px',
                        lineHeight: '1.5',
                        margin: '0',
                      }}
                    >
                      Communicate directly with your loan officer
                    </Text>
                  </Section>
                </Column>
              </Row>
            </Section>

            <Hr
              style={{
                border: 'none',
                borderTop: `1px solid ${fcuColors.neutral[100]}`,
                margin: '32px 0',
              }}
            />

            {/* Security Info */}
            <Section
              style={{
                backgroundColor: '#eff6ff',
                border: `1px solid ${fcuColors.primary[500]}`,
                borderRadius: '8px',
                padding: '20px',
                margin: '0 0 32px 0',
              }}
            >
              <Text
                style={{
                  color: fcuColors.primary[600],
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                }}
              >
                🔐 Security & Privacy
              </Text>
              <Text
                style={{
                  color: fcuColors.primary[600],
                  fontSize: '14px',
                  lineHeight: '1.5',
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
                  Questions? We&apos;re here to help!{' '}
                  <a
                    href={`mailto:${supportEmail}`}
                    style={{
                      color: fcuColors.primary[600],
                      textDecoration: 'none',
                    }}
                  >
                    Contact Support
                  </a>
                </Text>

                <Text
                  style={{
                    color: fcuColors.neutral[600],
                    fontSize: '14px',
                    textAlign: 'center',
                    margin: '0 0 16px 0',
                    lineHeight: '1.5',
                  }}
                >
                  <a
                    href={dashboardUrl}
                    style={{
                      color: fcuColors.primary[600],
                      textDecoration: 'none',
                      fontWeight: '500',
                    }}
                  >
                    Access Your Dashboard →
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
                  FCU - Your trusted financial partner since 1951
                </Text>
              </Column>
            </Row>
          </Section>
        </Container>
      </Tailwind>
    </Html>
  )
}

export default WelcomeEmail
