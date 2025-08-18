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
  Tailwind,
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
}

const linkToIdentification = process.env.IDENTIFICATION_LINK_WEBSITE!

const toCurrentYear = new Date().getFullYear()

export default function PapermarkYearInReviewEmail({
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
}: EmailProps) {
  return (
    <Html>
      <Head />
      <Preview>First Credit Union - Loan Application Confirmation</Preview>
      <Tailwind>
        <Body className='bg-white font-sans'>
          <Container className='mx-auto w-full max-w-[600px] p-0'>
            <Section className='p-8 text-start'>
              {/* <Text className='mx-0 mt-4 mb-8 p-0 text-center font-normal text-2xl'>
                <span className='font-bold tracking-tighter text-fcu-primary-500'>
                  First Credit Union
                </span>
              </Text> */}
              <Text className='font-normal text-sm uppercase text-center tracking-wider text-[#828282]'>
                Loan Application Confirmation
              </Text>
              <Heading className='my-4 font-medium text-lg leading-tight text-center'>
                Your Loan Application has been received.
              </Heading>
              <Text className='text-lg mt-8 font-medium leading-none tracking-tight'>
                Hi {firstName},
              </Text>

              <Text className='mb-8 text-lg leading-8 tracking-tight'>
                Thank you for applying for a loan with First Credit Union.
                Please find below the details of your loan application.
              </Text>
            </Section>
            <Section className='pb-16 text-center'>
              <Link
                href='https://firstcreditunion.co.nz/'
                className='inline-flex items-center rounded-full bg-[#bbbb14] px-12 py-4 text-center font-bold text-base text-white no-underline tracking-tight'
              >
                Track my application
              </Link>
            </Section>

            <Section
              style={codeBox}
              className='my-6 bg-[#29819a] bg-[radial-gradient(circle_at_bottom_right,#00687f_0%,transparent_60%)] p-8 text-center'
            >
              <Heading className='m-0 font-light text-2xl text-[#fff] tracking-tight'>
                Loan Amount
              </Heading>
              <Text className='mt-4 mb-10 font-bold text-5xl text-white leading-none tracking-tight'>
                ${loanAmount}
              </Text>
              {/* <Text className='text-gray-900 text-sm leading-5 tracking-tight'>
                That&apos;s a lot of engagement! Your documents are resonating
                with your visitors.
              </Text> */}

              {/* <Hr className='mt-6' style={{ borderColor: '#c9c9c9' }} /> */}
              <Heading className='pt-5 font-medium text-[#bbbb14] text-xs uppercase tracking-widest'>
                Repayment Details
              </Heading>
              <Row className='mt-5'>
                <Column className='w-full text-center'>
                  <Text className='font-light text-[#fff] text-sm tracking-widest uppercase'>
                    {instalmentFrequencyHeader}
                  </Text>
                  <Text className='my-1 font-semibold text-2xl text-white tracking-tight'>
                    ${instalmentAmount}
                  </Text>
                  {/* <Text className='text-2xl text-gray-900'>documents</Text> */}
                </Column>
              </Row>
              <Row className='mt-5'>
                <Column className='w-full text-center'>
                  <Text className='font-light text-[#fff] text-sm tracking-widest uppercase'>
                    Total Interest
                  </Text>
                  <Text className='my-1 font-semibold text-2xl text-white tracking-tight'>
                    ${totalInterest}
                  </Text>
                  {/* <Text className='text-2xl text-gray-900'>links</Text> */}
                </Column>
              </Row>
              <Row className='mt-5'>
                <Column className='w-full text-center'>
                  <Text className='font-light text-[#fff] text-sm tracking-widest uppercase'>
                    Amount Payable
                  </Text>
                  <Text className='my-1 font-semibold text-2xl text-white '>
                    ${totalAmountPayable}
                  </Text>
                  {/* <Text className='text-2xl text-gray-900'>views</Text> */}
                </Column>
              </Row>
              {needProvidentInsurance === 'Yes' && (
                <Row className='mt-5'>
                  <Column className='w-full text-center'>
                    <Text className='font-light text-[#fff] text-sm tracking-widest uppercase'>
                      Provident CreditCare Insurance Premium
                    </Text>
                    <Text className='my-1 font-semibold text-2xl text-white '>
                      ${insuranceAmount}
                    </Text>
                    {/* <Text className='text-2xl text-gray-900'>views</Text> */}
                  </Column>
                </Row>
              )}
              {needProvidentInsurance === 'Yes' && (
                <Row className='mt-5'>
                  <Column className='w-full text-center'>
                    <Text className='font-light text-[#fff] text-sm tracking-widest uppercase'>
                      Insurance Type
                    </Text>
                    <Text className='my-1 font-semibold text-2xl text-white '>
                      {insuranceType}
                    </Text>
                    {/* <Text className='text-2xl text-gray-900'>views</Text> */}
                  </Column>
                </Row>
              )}
              {needProvidentInsurance === 'Yes' && (
                <Row className='mt-5'>
                  <Column className='w-full text-center'>
                    <Text className='font-light text-[#fff] text-sm tracking-widest uppercase'>
                      Cover Type
                    </Text>
                    <Text className='my-1 font-semibold text-2xl text-white '>
                      {coverType}
                    </Text>
                    {/* <Text className='text-2xl text-gray-900'>views</Text> */}
                  </Column>
                </Row>
              )}
              {needProvidentInsurance === 'Yes' && (
                <Row className='mt-5'>
                  <Column className='w-full text-center'>
                    <Text className='font-light text-[#fff] text-sm tracking-widest uppercase'>
                      Covers Included
                    </Text>
                    <Text className='my-1 font-semibold text-lg text-white '>
                      {coversIncluded}
                    </Text>
                    {/* <Text className='text-2xl text-gray-900'>views</Text> */}
                  </Column>
                </Row>
              )}

              <Row className='mt-5'>
                <Column className='w-full text-center'>
                  <Text className='my-1 font-light text-xs text-gray-200 uppercase'>
                    Submitted Date & Time: {submittedDateTime}
                  </Text>
                  {/* <Text className='text-2xl text-gray-900'>views</Text> */}
                </Column>
              </Row>
            </Section>
            <Section>
              <Row>
                <Text className='m-0 mt-[8px] text-[16px] leading-[24px]'>
                  Before we can open your account, we require the following
                  documents:
                </Text>
              </Row>
            </Section>
            <Section>
              <Row className='items-center'>
                <Column className='w-[90%]'>
                  <Text className='m-0 text-[20px] font-semibold leading-[28px]'>
                    <strong>Identification and Proof of Address</strong>
                  </Text>
                  <Text className='m-0 mt-[8px] text-[16px] leading-[24px]'>
                    Two colour copies of identifications and Proof of Address.
                    At least one form of identification{' '}
                    <strong>must contain a photo</strong>.{' '}
                    <Link style={anchor} href={linkToIdentification}>
                      Click here
                    </Link>{' '}
                    to view the forms of identification and proof of address we
                    can accept.
                  </Text>
                </Column>
              </Row>
            </Section>

            <Hr className='mx-0 my-[24px] w-full border border-solid !border-gray-300' />
            <Text>
              Please note that all identification and proof of address need to
              be certified by a trusted referee which is outlined in forms of
              identification link.
            </Text>
            <Text>
              Please email the above documents through to this email. Upon
              receiving your documents, you will receive a link by email to
              validate that your identity documents are authentic through a
              third-party company called Cloudcheck. Once that process is done,
              we will then get in touch with you.
            </Text>
            <Text>
              <strong>
                Please note: If we do not receive the above documents, we will
                be unable to open your First Credit Union account.
              </strong>
            </Text>
            <Text>
              If you have any questions, please give us a call. Our call centre
              is open Monday 10am-5pm and Tuesday – Friday 8am-5pm (excluding
              public holidays).
            </Text>
            <Text>We look forward to hearing from you.</Text>
            <Text>— First Credit Union team</Text>

            {/* <Section className='my-6 rounded-2xl bg-[#e4c5a0]/10 bg-[radial-gradient(circle_at_bottom_right,#e4c5a0_0%,transparent_60%)] p-8 text-center'>
              <Heading className='m-0 font-medium text-3xl text-[#9c7b4a]'>
                Your most active month
              </Heading>
              <Text className='my-4 font-bold text-5xl text-gray-900 leading-none'>
                {mostActiveMonth}
              </Text>
              <Text className='mb-4 font-medium text-3xl text-gray-900'>
                with {mostActiveMonthViews} views
              </Text>
              <Text className='text-gray-900 text-sm leading-5'>
                {mostActiveMonth} was your busiest month. What did you share
                that got so much attention?
              </Text>

              <Hr className='mt-6' style={{ borderColor: '#e4c5a0' }} />
              <Heading className='pt-5 font-medium text-gray-900 text-xs uppercase tracking-wider'>
                You&apos;re in the top
              </Heading>
              <Text className='my-4 font-bold text-7xl text-gray-900 leading-none'>
                {sharerPercentile}%
              </Text>
              <Text className='mb-4 font-medium text-gray-900 text-xl'>
                of sharers on Papermark
              </Text>
              <Text className='text-gray-900 text-sm leading-5'>
                You&apos;re one of our most active users. Thank you for sharing
                with Papermark!
              </Text>
            </Section> */}
            {/* 
            <Section className='my-6 rounded-2xl bg-[#10b981]/10 bg-[radial-gradient(circle_at_bottom_right,#10b981_0%,transparent_60%)] p-8 text-center'>
              <Heading className='m-0 font-medium text-3xl text-[#065f46]'>
                Your documents were viewed from
              </Heading>
              <Row className='mt-4'>
                <Column>
                  {viewingLocations.map((location, index) => (
                    <Text
                      key={index}
                      className='rounded-full bg-[#10b981] px-3 py-1 font-medium text-sm text-white'
                      style={{
                        margin: '4px 4px',
                        display: 'inline-block',
                      }}
                    >
                      {location}
                    </Text>
                  ))}
                </Column>
              </Row>
              <Text className='mt-4 text-[#065f46] text-sm leading-5 tracking-tight'>
                To keep the information you&apos;ve entered safe, please do not
                share this email.
              </Text>
            </Section> */}

            {/* <Section className='pb-6 text-center'>
              <Text className='text-gray-900 text-xl leading-8 tracking-tight'>
                Thank you for choosing First Credit Union. <br />
              </Text>
              <Link
                href='https://www.papermark.com'
                className='mt-4 inline-flex items-center rounded-full bg-gray-900 px-12 py-4 text-center font-bold text-sm text-white no-underline'
              >
                Share your stats
              </Link>
              <Link
                href='https://www.papermark.com'
                className='mt-4 block items-center text-center font-bold text-gray-900 text-sm no-underline'
              >
                Go to your dashboard
              </Link>
            </Section> */}
            <Hr style={hr} />
            <Section style={footer}>
              <Row>
                <Text style={{ textAlign: 'center', color: '#474747' }}>
                  ©{toCurrentYear} First Credit Union, All Rights Reserved{' '}
                  <br />
                  111 Collingwood Street, Hamilton Central, Hamilton 3204
                </Text>
              </Row>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

// PapermarkYearInReviewEmail.PreviewProps = {
//   submittedDateTime: '2024-01-01 12:00:00',
//   title: 'Mr',
//   firstName: 'John',
//   loanAmount: '10000',
//   loanTerm: '5 years',
//   interestRate: '5%',
//   totalInterest: '2500',
//   totalAmountPayable: '12500',
//   instalmentAmount: '2500',
//   instalmentFrequencyHeader: 'Monthly',
//   insuranceAmount: '1000',
//   needProvidentInsurance: 'Yes',
//   insuranceType: 'Provident',
//   coverType: 'Personal Loan',
//   coversIncluded: 'Accidental Death & Disability',
//   tempLoanApplicationNumber: '1234567890',
// } satisfies EmailProps

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
}

const codeBox = {
  borderRadius: '16px',
  marginBottom: '30px',
  padding: '30px 10px',
}

const anchor = {
  color: '#00687f',
}
