# Prompt for Other Project Chat

Copy and paste this entire prompt into your loan application project chat to continue the implementation:

---

## **Context: Loan Status Link Integration**

I need to integrate a loan status portal link into my existing loan application Next.js project. I have already created a complete loan status verification system that's deployed at `https://loan-link-dev.vercel.app/` and now I need to modify my loan application project to generate proper links to this portal.

## **Current Situation**

1. **I have a loan application Next.js project** that collects loan applications and sends confirmation emails
2. **I have an existing email template** called `LoanApplyConfirmationEmail.tsx` with a "Track my application" button
3. **The loan status portal is already deployed** at `https://loan-link-dev.vercel.app/` and expects specific URL parameters
4. **I need to replace the static link** with a dynamic one that includes user-specific parameters

## **Required URL Parameters for Status Portal**

The loan status portal expects these URL parameters:

- `email`: User's email address (required)
- `loan`: Loan application number (required)
- `token`: Security token (optional but recommended)

## **My Current Email Template**

My existing `LoanApplyConfirmationEmail.tsx` has this structure:

```typescript
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
```

And currently has a static "Track my application" button:

```typescript
<Section className='pb-16 text-center'>
  <Link
    href='https://firstcreditunion.co.nz/'  // This needs to be dynamic
    className='inline-flex items-center rounded-full bg-[#bbbb14] px-12 py-4 text-center font-bold text-base text-white no-underline tracking-tight'
  >
    Track my application
  </Link>
</Section>
```

## **What I Need Help With**

I have a complete step-by-step integration guide saved at `/documentation/loan-status-link-integration-guide.md` in this project. Please:

1. **Read the integration guide** from the documentation folder
2. **Help me implement the changes** step by step according to the guide
3. **Create the link generator utility** as specified in the guide
4. **Update my email template** to use the dynamic link
5. **Update my email sending logic** to pass the required parameters
6. **Test the implementation** to ensure it generates proper URLs

## **Expected Outcome**

After implementation, the "Track my application" button should generate URLs like:

```
https://loan-link-dev.vercel.app/?email=user%40example.com&loan=12345&token=securitytoken
```

## **Key Requirements**

- Must work with my existing email template structure
- Need to generate security tokens for enhanced security
- Must pass loan application number and email to the status portal
- Should be production-ready with proper error handling
- Need to maintain existing email template styling and functionality

## **Files to Modify**

Based on the guide, I'll need to:

- Create `lib/loan-status-link-generator.ts`
- Update `LoanApplyConfirmationEmail.tsx`
- Update my email sending logic
- Update my API route that processes loan applications

Please help me implement this integration step by step, starting with reading the guide and then walking through each step of the implementation.

---

**Please start by reading the integration guide at `/documentation/loan-status-link-integration-guide.md` and then help me implement Step 1: Creating the Link Generator Utility.**
