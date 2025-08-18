# UI Components Implementation Guide

## Overview

This document provides comprehensive documentation for all UI components implemented in the FCU Loan Status Verification System. The system uses **Next.js 15**, **Shadcn UI**, **Tailwind CSS**, and **FCU brand colors** to create a secure, user-friendly interface.

## 🎨 Design System

### Brand Colors (FCU)

- **Primary Blue**: `fcu-primary-*` (50-950 shades)
- **Secondary Green**: `fcu-secondary-*` (50-950 shades)
- **Gradients**: ``

### Typography & Spacing

- **Font**: System fonts with fallbacks
- **Spacing**: Consistent Tailwind spacing scale
- **Responsive**: Mobile-first design approach

## 🏗️ Architecture

### Component Structure

```
app/
├── page.tsx              # Landing/Entry page
├── verify/page.tsx       # Email verification flow
└── dashboard/page.tsx    # Loan status dashboard

components/
├── ui/                   # Shadcn UI components
├── session-timer.tsx     # Session management
├── security-alert.tsx    # Security notifications
└── loading-states.tsx    # Loading components
```

### State Management Pattern

- **Local State**: React useState for component-specific state
- **URL Parameters**: For passing data between pages
- **Session Management**: 15-minute timeout with warnings

## 📱 Page Components

### 1. Landing Page (`app/page.tsx`)

**Purpose**: Entry point for users accessing via email links

**States**:

- `initial`: Default welcome screen
- `validating`: Checking access credentials
- `valid-token`: Ready to proceed with verification
- `invalid-token`: Error state for bad links
- `existing-session`: User has active session
- `error`: Network or validation errors

**Key Features**:

- Token validation from URL parameters
- Existing session detection
- FCU branding and security messaging
- Responsive design

**URL Parameters**:

- `token`: Verification token (optional)
- `email`: User email address
- `loan`: Loan application number

**Code Example**:

```tsx
// State management
const [state, setState] = useState<LandingState>('initial')
const [tokenData, setTokenData] = useState<TokenValidation | null>(null)

// Session check
const sessionResponse = await fetch('/api/session-status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, loanApplicationNumber: loan }),
})
```

### 2. Verification Page (`app/verify/page.tsx`)

**Purpose**: 6-digit email verification flow

**States**:

- `loading`: Preparing verification
- `email-sent`: Code sent confirmation
- `enter-code`: Code input interface
- `success`: Verification successful
- `error`: Verification failed

**Key Features**:

- Auto-advancing UI flow
- 6-digit code input with formatting
- Real-time validation
- Resend functionality with cooldown
- Attempt tracking and rate limiting
- Auto-submit when code complete

**Security Features**:

- Maximum 3 verification attempts
- 10-minute code expiration
- 60-second resend cooldown
- Masked email display
- Input sanitization

**Code Example**:

```tsx
// Auto-submit on complete code
const handleCodeChange = (value: string) => {
  const numericValue = value.replace(/\D/g, '').slice(0, 6)
  setState((prev) => ({ ...prev, code: numericValue, error: '' }))

  if (numericValue.length === 6) {
    setTimeout(() => verifyCode(), 500)
  }
}

// Code verification
const verifyCode = useCallback(async () => {
  const response = await fetch('/api/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      loanApplicationNumber: loan,
      verificationCode: state.code,
    }),
  })
}, [state.code, state.attempts, state.maxAttempts, searchParams, router])
```

### 3. Dashboard Page (`app/dashboard/page.tsx`)

**Purpose**: Display loan status and manage user session

**States**:

- `loading`: Loading dashboard data
- `active`: Dashboard operational
- `session-expired`: Session timeout
- `error`: Data loading errors

**Key Features**:

- Real-time loan status display
- Session timer with warnings
- Loan officer contact information
- Session information panel
- Auto-refresh functionality
- Session extension dialog

**Data Display**:

- Current loan status with color-coded badges
- Application details (number, amount, type)
- Timeline information
- Contact details
- Session metadata

**Code Example**:

```tsx
// Session timer countdown
useEffect(() => {
  if (sessionTimeLeft > 0) {
    const timer = setTimeout(() => {
      setSessionTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearTimeout(timer)
  } else if (sessionTimeLeft === 0 && sessionInfo) {
    handleSessionExpired()
  }
}, [sessionTimeLeft, sessionInfo])

// Status color coding
const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'under review':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}
```

## 🔧 Utility Components

### 1. Session Timer (`components/session-timer.tsx`)

**Purpose**: Real-time session countdown with warnings

**Props**:

- `expiresAt`: Session expiration timestamp
- `onExpired`: Callback when session expires
- `onExtend`: Optional session extension function
- `showWarningAt`: Warning threshold (default: 2 minutes)

**Features**:

- Real-time countdown display
- Color-coded urgency (green → yellow → red)
- Warning dialog at configurable threshold
- Session extension capability
- Auto-hide functionality

**Usage**:

```tsx
<SessionTimer
  expiresAt={sessionInfo.sessionExpiresAt}
  onExpired={() => router.push('/verify')}
  onExtend={extendSession}
  showWarningAt={120}
/>
```

### 2. Security Alert (`components/security-alert.tsx`)

**Purpose**: Display security events and notifications

**Event Types**:

- `rate_limit`: Too many requests
- `session_timeout`: Session expired
- `suspicious_activity`: Security concerns
- `max_attempts`: Verification attempts exceeded
- `info`: General information

**Severity Levels**:

- `low`: Information (blue)
- `medium`: Warning (yellow)
- `high`: Alert (orange)
- `critical`: Danger (red)

**Features**:

- Auto-dismiss with configurable timeout
- Severity-based styling
- Dismissible notifications
- Batch display management
- Predefined event creators

**Usage**:

```tsx
// Create security events
const rateLimitEvent = createSecurityEvent.rateLimitExceeded(300)
const timeoutEvent = createSecurityEvent.sessionTimeout()

// Display alerts
<SecurityAlertManager
  events={securityEvents}
  onDismissEvent={(index) => removeEvent(index)}
  maxVisible={3}
/>
```

### 3. Loading States (`components/loading-states.tsx`)

**Purpose**: Consistent loading UI across the application

**Components**:

- `LoadingSpinner`: Generic spinner with text
- `VerificationPageSkeleton`: Verification page placeholder
- `DashboardPageSkeleton`: Dashboard placeholder
- `LandingPageSkeleton`: Landing page placeholder
- `EmailSendingState`: Email transmission status
- `CodeVerificationState`: Code validation status
- `SessionValidationState`: Session check status

**Features**:

- Consistent FCU branding
- Responsive design
- Skeleton loading patterns
- Context-specific messaging

**Usage**:

```tsx
// Conditional loading states
{
  state === 'loading' ? <VerificationPageSkeleton /> : <VerificationForm />
}

// Inline loading
;<LoadingSpinner size='md' text='Validating session...' />
```

## 🎯 User Experience Flow

### 1. Entry Flow

```
Email Link → Landing Page → Token Validation → Verification Page
```

### 2. Verification Flow

```
Send Code → Email Confirmation → Code Entry → Validation → Success
```

### 3. Dashboard Flow

```
Session Check → Data Loading → Status Display → Session Management
```

### 4. Session Management

```
Active Session → Warning (2min) → Extension Dialog → Logout/Extend
```

## 🔒 Security Features

### Input Validation

- Email format validation
- Numeric-only code input
- Loan number format checking
- XSS prevention through sanitization

### Rate Limiting UI

- Visual feedback for rate limits
- Countdown timers for retry attempts
- Progressive delay messaging

### Session Security

- Real-time session monitoring
- Automatic timeout warnings
- Secure logout functionality
- Session extension with re-validation

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px (single column)
- **Tablet**: 768px - 1024px (adaptive layout)
- **Desktop**: > 1024px (multi-column)

### Mobile Optimizations

- Touch-friendly input fields
- Larger tap targets
- Simplified navigation
- Optimized text sizes

### Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader compatibility
- High contrast color ratios

## 🎨 Styling Guidelines

### Color Usage

```css
/* Primary actions */
.bg-fcu-primary-600.hover:bg-fcu-primary-700

/* Secondary actions */
.bg-fcu-secondary-600.hover:bg-fcu-secondary-700

/* Background gradients */
.bg-gradient-to-br.from-fcu-primary-50.to-fcu-secondary-50

/* Status indicators */
.text-green-800.bg-green-100  /* Success */
.text-yellow-800.bg-yellow-100  /* Warning */
.text-red-800.bg-red-100  /* Error */
```

### Typography Scale

```css
/* Headers */
.text-2xl.font-semibold  /* Page titles */
.text-lg.font-medium     /* Section headers */

/* Body text */
.text-base               /* Regular content */
.text-sm                 /* Secondary information */
.text-xs                 /* Labels and metadata */

/* Special formatting */
.font-mono.tracking-widest  /* Verification codes */
```

### Spacing Patterns

```css
/* Component spacing */
.space-y-6               /* Major sections */
.space-y-4               /* Related groups */
.space-y-2               /* Form fields */

/* Padding */
.p-6                     /* Card content */
.p-4                     /* Smaller containers */
.py-2.px-4               /* Buttons */
```

## 🔄 State Management Patterns

### Page State

```tsx
type PageState = 'loading' | 'active' | 'error' | 'expired'

interface ComponentState {
  step: PageState
  data: any | null
  error: string
  loading: boolean
}
```

### Error Handling

```tsx
// Consistent error pattern
try {
  const response = await apiCall()
  if (!response.ok) {
    setState((prev) => ({
      ...prev,
      error: data.error || 'Operation failed',
    }))
    return
  }
  // Success handling
} catch {
  setState((prev) => ({
    ...prev,
    error: 'Network error. Please try again.',
  }))
}
```

### Loading States

```tsx
// Loading pattern
const handleAction = async () => {
  setState((prev) => ({ ...prev, loading: true, error: '' }))
  try {
    await performAction()
    setState((prev) => ({ ...prev, loading: false }))
  } catch {
    setState((prev) => ({
      ...prev,
      loading: false,
      error: 'Action failed',
    }))
  }
}
```

## 🧪 Testing Considerations

### Component Testing

- State transitions
- User interactions
- Error scenarios
- Loading states
- Responsive behavior

### Integration Testing

- Page navigation flows
- API integration
- Session management
- Security features

### Accessibility Testing

- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios
- Focus management

## 🚀 Performance Optimizations

### Code Splitting

- Page-based code splitting (automatic with Next.js)
- Component lazy loading where appropriate
- Dynamic imports for heavy components

### Bundle Optimization

- Tree shaking for unused code
- Optimized imports from UI libraries
- Minimal external dependencies

### Runtime Performance

- Efficient re-renders with React.memo
- Optimized state updates
- Debounced user inputs
- Memoized expensive calculations

## 📋 Implementation Checklist

### ✅ Completed Features

- [x] **Landing Page**: Token validation and session detection
- [x] **Verification Page**: 6-digit code input with security features
- [x] **Dashboard Page**: Loan status display with session management
- [x] **Session Timer**: Real-time countdown with warnings
- [x] **Security Alerts**: Comprehensive security event system
- [x] **Loading States**: Consistent loading UI components
- [x] **Responsive Design**: Mobile-first responsive layout
- [x] **FCU Branding**: Brand colors and styling throughout
- [x] **Error Handling**: Comprehensive error states and recovery
- [x] **Accessibility**: ARIA labels and keyboard navigation

### 🔄 Future Enhancements

- [ ] **Dark Mode**: Theme switching capability
- [ ] **Internationalization**: Multi-language support
- [ ] **PWA Features**: Offline functionality and app-like behavior
- [ ] **Advanced Analytics**: User interaction tracking
- [ ] **Push Notifications**: Status update notifications
- [ ] **Biometric Auth**: Fingerprint/Face ID integration

## 🎉 Summary

The UI implementation provides a complete, secure, and user-friendly interface for the FCU Loan Status Verification System. Key achievements:

1. **Complete User Flow**: From email link to dashboard access
2. **Security First**: Rate limiting, session management, and input validation
3. **FCU Branding**: Consistent brand colors and professional design
4. **Mobile Ready**: Responsive design for all devices
5. **Accessible**: WCAG compliance and screen reader support
6. **Performant**: Optimized loading and efficient state management

The system is ready for production deployment and provides a solid foundation for future enhancements.
