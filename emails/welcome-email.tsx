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
  Link,
  Hr,
  Img,
} from '@react-email/components'
import type * as React from 'react'
import type { WelcomeEmailProps } from '../lib/email-types'

const toCurrentYear = new Date().getFullYear()

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({
  recipientEmail,
  applicantName,
  loanApplicationNumber,
  dashboardUrl,
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
        🎉 Welcome to FCU Loan Status Portal! Your account for loan #
        {loanApplicationNumber} is verified and ready. Access your personalized
        dashboard now to track your application in real-time.
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerSectionStyle}>
            <Row>
              <Column>
                <Img
                  src='https://loanstatushub.firstcreditunion.co.nz/logo/android-chrome-192x192.png'
                  alt='First Credit Union - Your trusted financial partner'
                  width='96'
                  height='96'
                  style={logoStyle}
                />
              </Column>
            </Row>
            <Text style={confirmationLabelStyle}>Account Verified</Text>
            <Heading style={mainHeadingStyle}>
              Welcome to Your Loan Status Dashboard!
            </Heading>
            <Text style={greetingStyle}>Hi {applicantName},</Text>
            <Text style={introTextStyle}>
              Your email has been successfully verified. You can now access your
              loan application status dashboard anytime. Your loan application{' '}
              <strong>#{loanApplicationNumber}</strong> is being processed, and
              you&apos;ll be able to track its progress in real-time through
              your personalised dashboard.
            </Text>
          </Section>

          <Section style={buttonSectionStyle}>
            <Link href={dashboardUrl} style={buttonStyle}>
              Access Your Dashboard →
            </Link>
          </Section>

          <Section style={dashboardInfoBoxStyle}>
            <Heading style={dashboardInfoHeadingStyle}>
              What you can do in your dashboard
            </Heading>

            <Row style={featureRowStyle}>
              <Column style={featureColumnStyle}>
                <Text style={featureIconStyle}>📊</Text>
                <Text style={featureLabelStyle}>Track Application Status</Text>
                <Text style={featureDescriptionStyle}>
                  Monitor your loan application progress in real-time
                </Text>
              </Column>
            </Row>

            <Row style={featureRowStyle}>
              <Column style={featureColumnStyle}>
                <Text style={featureIconStyle}>📋</Text>
                <Text style={featureLabelStyle}>View Required Documents</Text>
                <Text style={featureDescriptionStyle}>
                  See what documents are needed and their status
                </Text>
              </Column>
            </Row>
          </Section>

          <Section style={securityNoticeSectionStyle}>
            <Row>
              <Column style={securityNoticeColumnStyle}>
                <Text style={securityNoticeHeadingStyle}>
                  <strong>🔐 Security & Privacy</strong>
                </Text>
                <Text style={securityNoticeTextStyle}>
                  Your dashboard sessions are limited to{' '}
                  <strong>15 minutes</strong> for security. You&apos;ll need to
                  verify your email again for each new session to keep your
                  information safe.
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Text style={bodyTextStyle}>
            Questions? We&apos;re here to help!{' '}
            <Link style={anchor} href={`mailto:${supportEmail}`}>
              Contact Support
            </Link>
            .
          </Text>
          <Text style={bodyTextStyle}>
            You can also{' '}
            <Link style={anchor} href={dashboardUrl}>
              access your dashboard
            </Link>{' '}
            anytime.
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
                <br />
                Your trusted financial partner since 1951
              </Text>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail

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

const buttonSectionStyle = {
  paddingBottom: '48px',
  textAlign: 'center' as const,
}

const buttonStyle = {
  display: 'inline-block',
  backgroundColor: '#bbbb14',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 32px',
  borderRadius: '16px',
  letterSpacing: '0',
}

const dashboardInfoBoxStyle = {
  margin: '24px 0',
  backgroundColor: '#29819a',
  borderRadius: '16px',
  padding: '32px 40px',
  textAlign: 'center' as const,
}

const dashboardInfoHeadingStyle = {
  margin: '0 0 32px 0',
  fontSize: '12px',
  fontWeight: '500' as const,
  color: '#bbbb14',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
}

const featureRowStyle = {
  marginTop: '24px',
}

const featureColumnStyle = {
  width: '100%',
  textAlign: 'center' as const,
}

const featureIconStyle = {
  fontSize: '32px',
  margin: '0 0 12px 0',
  lineHeight: '1',
}

const featureLabelStyle = {
  fontSize: '18px',
  fontWeight: '600' as const,
  color: '#ffffff',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: '0 0 8px 0',
}

const featureDescriptionStyle = {
  margin: '0',
  fontSize: '14px',
  fontWeight: '300' as const,
  color: '#ffffff',
  lineHeight: '1.5',
  letterSpacing: '-0.01em',
}

const securityNoticeSectionStyle = {
  margin: '40px 0 24px 0',
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
