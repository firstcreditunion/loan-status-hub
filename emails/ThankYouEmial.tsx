import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'

interface EmailProps {
  recipientEmail: string
  title?: string
  firstName?: string
  loanAmount?: string
  instalmentAmount?: string
  instalmentFrequencyHeader?: string
  loanTerm?: string
  interestRate?: string
  totalInterest?: string
  totalAmountPayable?: string
  insuranceAmount?: string
  needProvidentInsurance?: string
  insuranceType?: string
  coverType?: string
  coversIncluded?: string
  tempLoanApplicationNumber?: string
  submittedDateTime: string
  loanApplicationNumber: string
  applicantName?: string
}

const linkToIdentification = process.env.IDENTIFICATION_LINK_WEBSITE!

const toCurrentYear = new Date().getFullYear()

export default function LoanApplyConfirmationEmail({
  recipientEmail,
  firstName,
  loanAmount,
  totalInterest,
  totalAmountPayable,
  instalmentAmount,
  instalmentFrequencyHeader,
  insuranceAmount,
  needProvidentInsurance,
  insuranceType,
  coverType,
  coversIncluded,
  submittedDateTime,
  loanApplicationNumber,
  applicantName,
}: EmailProps) {
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
      <Preview>First Credit Union - Loan Application Confirmation</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerSectionStyle}>
            <Text style={confirmationLabelStyle}>
              Loan Application Confirmation
            </Text>
            <Heading style={mainHeadingStyle}>
              Your Loan Application has been received.
            </Heading>
            <Text style={greetingStyle}>Hi {firstName},</Text>
            <Text style={introTextStyle}>
              Thank you for applying for a loan with First Credit Union. Please
              find below the details of your loan application.
            </Text>
          </Section>

          {/* <Section style={buttonSectionStyle}>
            <Link href={loanStatusLink} style={buttonStyle}>
              Track my application
            </Link>
          </Section> */}

          <Section style={loanDetailsBoxStyle}>
            <Heading style={loanAmountHeadingStyle}>Loan Amount</Heading>
            <Text style={loanAmountValueStyle}>${loanAmount}</Text>

            <Heading style={repaymentDetailsHeadingStyle}>
              Repayment Details
            </Heading>

            <Row style={detailRowStyle}>
              <Column style={detailColumnStyle}>
                <Text style={detailLabelStyle}>
                  {instalmentFrequencyHeader}
                </Text>
                <Text style={detailValueStyle}>${instalmentAmount}</Text>
              </Column>
            </Row>

            <Row style={detailRowStyle}>
              <Column style={detailColumnStyle}>
                <Text style={detailLabelStyle}>Total Interest</Text>
                <Text style={detailValueStyle}>${totalInterest}</Text>
              </Column>
            </Row>

            <Row style={detailRowStyle}>
              <Column style={detailColumnStyle}>
                <Text style={detailLabelStyle}>Amount Payable</Text>
                <Text style={detailValueStyle}>${totalAmountPayable}</Text>
              </Column>
            </Row>

            {needProvidentInsurance === 'Yes' && (
              <Row style={detailRowStyle}>
                <Column style={detailColumnStyle}>
                  <Text style={detailLabelStyle}>
                    Provident CreditCare Insurance Premium
                  </Text>
                  <Text style={detailValueStyle}>${insuranceAmount}</Text>
                </Column>
              </Row>
            )}

            {needProvidentInsurance === 'Yes' && (
              <Row style={detailRowStyle}>
                <Column style={detailColumnStyle}>
                  <Text style={detailLabelStyle}>Insurance Type</Text>
                  <Text style={detailValueStyle}>{insuranceType}</Text>
                </Column>
              </Row>
            )}

            {needProvidentInsurance === 'Yes' && (
              <Row style={detailRowStyle}>
                <Column style={detailColumnStyle}>
                  <Text style={detailLabelStyle}>Cover Type</Text>
                  <Text style={detailValueStyle}>{coverType}</Text>
                </Column>
              </Row>
            )}

            {needProvidentInsurance === 'Yes' && (
              <Row style={detailRowStyle}>
                <Column style={detailColumnStyle}>
                  <Text style={detailLabelStyle}>Covers Included</Text>
                  <Text style={detailValueLargeStyle}>{coversIncluded}</Text>
                </Column>
              </Row>
            )}

            {/* {submittedDateTime && (
                <Row style={detailRowStyle}>
                  <Column style={detailColumnStyle}>
                    <Text style={submittedDateStyle}>
                      Submitted Date & Time:{' '}
                      {format(
                        new Date(submittedDateTime),
                        'dd/MM/yyyy hh:mm:ss aaaa'
                      )}
                    </Text>
                  </Column>
                </Row>
              )} */}
          </Section>

          <Section>
            <Row>
              <Text style={documentRequirementStyle}>
                Before we can open your account, we require the following
                documents:
              </Text>
            </Row>
          </Section>

          <Section>
            <Row>
              <Column style={documentColumnStyle}>
                <Text style={documentHeadingStyle}>
                  <strong>Identification and Proof of Address</strong>
                </Text>
                <Text style={documentTextStyle}>
                  Two colour copies of identifications and Proof of Address. At
                  least one form of identification{' '}
                  <strong>must contain a photo</strong>.{' '}
                  <Link style={anchor} href={linkToIdentification}>
                    Click here
                  </Link>{' '}
                  to view the forms of identification and proof of address we
                  can accept.
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Text style={bodyTextStyle}>
            Please note that all identification and proof of address need to be
            certified by a trusted referee which is outlined in forms of
            identification link.
          </Text>
          <Text style={bodyTextStyle}>
            Please email the above documents through to this email. Upon
            receiving your documents, you will receive a link by email to
            validate that your identity documents are authentic through a
            third-party company called Cloudcheck. Once that process is done, we
            will then get in touch with you.
          </Text>
          <Text style={bodyTextStyle}>
            <strong>
              Please note: If we do not receive the above documents, we will be
              unable to open your First Credit Union account.
            </strong>
          </Text>
          <Text style={bodyTextStyle}>
            If you have any questions, please give us a call. Our call centre is
            open Monday 10am-5pm and Tuesday – Friday 8am-5pm (excluding public
            holidays).
          </Text>
          <Text style={bodyTextStyle}>
            We look forward to hearing from you.
          </Text>
          <Text style={bodyTextStyle}>— First Credit Union team</Text>

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

// Inline styles for Outlook compatibility
const bodyStyle = {
  backgroundColor: '#f9fafb', // Changed from white to subtle gray for better visual separation
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
  backgroundColor: '#ffffff', // Added white background to container for card effect
}

const headerSectionStyle = {
  padding: '48px 40px 32px 40px', // Increased top padding for more breathing room
  textAlign: 'left' as const,
}

const confirmationLabelStyle = {
  fontSize: '12px', // Reduced from 14px for better hierarchy
  fontWeight: '600' as const, // Increased weight for better visibility
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
  letterSpacing: '0.1em', // Increased letter spacing for better readability
  color: '#6b7280', // Changed to a more professional gray
  margin: '0 0 8px 0', // Added bottom margin
}

const mainHeadingStyle = {
  margin: '0 0 32px 0', // Increased bottom margin for better spacing
  fontSize: '24px', // Increased from 18px for better hierarchy
  fontWeight: '600' as const, // Increased weight for emphasis
  lineHeight: '1.3',
  textAlign: 'center' as const,
  color: '#111827', // Darker color for better contrast
}

const greetingStyle = {
  fontSize: '16px', // Reduced from 18px for better hierarchy
  marginTop: '0', // Removed top margin
  marginBottom: '16px', // Added bottom margin
  fontWeight: '600' as const,
  lineHeight: '1.5', // Improved line height
  letterSpacing: '-0.01em', // Reduced letter spacing
  color: '#111827', // Darker color for better contrast
}

const introTextStyle = {
  marginBottom: '32px',
  fontSize: '16px', // Reduced from 18px for better hierarchy
  lineHeight: '1.6', // Improved from 2 for better readability
  letterSpacing: '-0.01em', // Reduced letter spacing
  color: '#374151', // Professional gray for body text
}

const buttonSectionStyle = {
  paddingBottom: '48px', // Reduced from 64px for better spacing
  textAlign: 'center' as const,
}

const buttonStyle = {
  display: 'inline-block',
  backgroundColor: '#bbbb14',
  color: '#ffffff',
  fontSize: '15px', // Reduced from 16px for better proportion
  fontWeight: '600' as const, // Reduced from bold for more refined look
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 32px', // Adjusted padding for better proportion
  borderRadius: '16px', // Changed from 9999px to modern rounded corners
  letterSpacing: '0', // Removed negative letter spacing
}

const loanDetailsBoxStyle = {
  margin: '24px 0',
  backgroundColor: '#29819a',
  borderRadius: '16px',
  padding: '32px 40px',
  textAlign: 'center' as const,
}

const loanAmountHeadingStyle = {
  margin: 0,
  fontSize: '24px',
  fontWeight: '300' as const,
  color: '#ffffff',
  letterSpacing: '-0.025em',
}

const loanAmountValueStyle = {
  marginTop: '16px',
  marginBottom: '40px',
  fontSize: '48px',
  fontWeight: 'bold' as const,
  color: '#ffffff',
  lineHeight: '1',
  letterSpacing: '-0.025em',
}

const repaymentDetailsHeadingStyle = {
  paddingTop: '20px',
  fontSize: '12px',
  fontWeight: '500' as const,
  color: '#bbbb14',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  margin: 0,
}

const detailRowStyle = {
  marginTop: '20px',
}

const detailColumnStyle = {
  width: '100%',
  textAlign: 'center' as const,
}

const detailLabelStyle = {
  fontSize: '14px',
  fontWeight: '300' as const,
  color: '#ffffff',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  margin: 0,
}

const detailValueStyle = {
  margin: '4px 0',
  fontSize: '24px',
  fontWeight: '600' as const,
  color: '#ffffff',
  letterSpacing: '-0.025em',
}

const detailValueLargeStyle = {
  margin: '4px 0',
  fontSize: '18px',
  fontWeight: '600' as const,
  color: '#ffffff',
  letterSpacing: '-0.025em',
}

const submittedDateStyle = {
  margin: '4px 0',
  fontSize: '12px',
  fontWeight: '300' as const,
  color: '#e5e5e5',
  textTransform: 'uppercase' as const,
}

const documentRequirementStyle = {
  margin: '40px 40px 24px 40px', // Added horizontal padding and increased spacing
  fontSize: '16px',
  lineHeight: '1.6', // Improved line height
  color: '#111827', // Darker color for better contrast
  fontWeight: '500' as const, // Added weight for emphasis
}

const documentColumnStyle = {
  width: '100%', // Changed from 90% for full width
  padding: '0 40px', // Added horizontal padding
}

const documentHeadingStyle = {
  margin: '0 0 12px 0', // Added bottom margin
  fontSize: '18px', // Reduced from 20px for better hierarchy
  fontWeight: '600' as const,
  lineHeight: '1.4', // Improved line height
  color: '#111827', // Darker color for better contrast
}

const documentTextStyle = {
  margin: '0 0 24px 0', // Added bottom margin for spacing
  fontSize: '15px', // Reduced from 16px for better hierarchy
  lineHeight: '1.6', // Improved line height
  color: '#374151', // Professional gray for body text
}

const bodyTextStyle = {
  fontSize: '15px', // Reduced from 16px for better hierarchy
  lineHeight: '1.6', // Improved line height
  color: '#374151', // Professional gray for body text
  margin: '0 40px 16px 40px', // Added horizontal padding for consistency
}

const hr = {
  borderColor: '#e5e7eb', // Lighter, more subtle divider
  margin: '32px 40px', // Added horizontal padding and increased spacing
  width: 'auto', // Changed from 100% to work with padding
  border: 'none', // Reset border
  borderTop: '1px solid #e5e7eb', // Single top border for cleaner look
}

const footer = {
  padding: '32px 40px 40px 40px', // Added padding for better spacing
}

const footerTextStyle = {
  textAlign: 'center' as const,
  color: '#6b7280', // Lighter gray for footer
  fontSize: '13px', // Increased from 12px for better readability
  lineHeight: '1.6', // Improved line height
  margin: 0, // Reset margin
}

const anchor = {
  color: '#00687f',
  textDecoration: 'underline', // Added underline for better link visibility
}
