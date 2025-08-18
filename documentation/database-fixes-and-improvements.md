# Database Fixes and Improvements

This document outlines the key fixes and improvements made to resolve production issues encountered during deployment.

## Issues Resolved

### 1. Duplicate Key Violation in Verification Sessions

**Problem:** `unique_active_session` constraint violation when creating new verification sessions.

**Root Cause:**

- Missing DELETE policy for the `anon` role on `user_verification_sessions` table
- Cleanup logic couldn't delete existing sessions before creating new ones

**Solution:**

```sql
-- Added missing DELETE policy
CREATE POLICY "System can delete verification sessions" ON api.user_verification_sessions
    FOR DELETE TO anon USING (true);
```

**Code Changes:**

```typescript
// Enhanced error handling in createVerificationSession
const { error: deleteError } = await supabase
  .schema('api')
  .from('user_verification_sessions')
  .delete()
  .eq('email', sanitizeString(email))
  .eq('loan_application_number', loanApplicationNumber)

if (deleteError) {
  console.error('Error deleting existing sessions:', deleteError)
  // Continue anyway - might be no existing sessions
}
```

### 2. "Multiple (or no) rows returned" Error

**Problem:** `PGRST116` error when querying for users or sessions that don't exist.

**Root Cause:** Using `.single()` method which expects exactly one row, but throws error when zero rows exist.

**Solution:** Changed to `.maybeSingle()` for queries that might return zero rows:

```typescript
// ✅ Before (caused errors)
const { data, error } = await supabase
  .from('verified_users')
  .select('*')
  .eq('email', email)
  .single() // Throws error if no rows

// ✅ After (handles zero rows gracefully)
const { data, error } = await supabase
  .from('verified_users')
  .select('*')
  .eq('email', email)
  .maybeSingle() // Returns null if no rows
```

**Functions Updated:**

- `getVerifiedUser()` - handles case where user hasn't been verified yet
- `getVerificationSession()` - handles case where no active session exists

### 3. Foreign Key Constraint Violations

**Problem:** Attempting to log user actions with non-existent loan application numbers.

**Root Cause:** Logging functions were called with loan numbers before validating they exist in `tblLoanApplication`.

**Solution:** Added validation and used security event logging for invalid loan numbers:

```typescript
// Check if loan exists before logging user actions
const loanApplication = await getLoanApplication(loanNumberAsInt)
if (!loanApplication) {
  // Use security event instead of user action logging
  await logSecurityEvent(
    'loan_not_found',
    'medium',
    'Verification requested for non-existent loan application',
    ipAddress,
    email,
    undefined, // Don't pass non-existent loan number
    userAgent,
    { requestedLoanNumber: loanNumberAsInt }
  )
  return
}
```

### 4. RLS Policy Inconsistency

**Problem:** New tables used `public` role while existing tables used `anon` role.

**Root Cause:** Inconsistent role assignment during initial table creation.

**Solution:** Updated all policies to use `anon` role consistently:

```sql
-- Updated policies for all new tables
CREATE POLICY "System can insert" ON api.table_name
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "System can update" ON api.table_name
    FOR UPDATE TO anon USING (true);

CREATE POLICY "System can delete" ON api.table_name
    FOR DELETE TO anon USING (true);
```

## Database Schema Improvements

### Enhanced Unique Constraints

Existing constraints that prevent data integrity issues:

```sql
-- Prevents duplicate active verification sessions
CREATE UNIQUE INDEX unique_active_session
ON api.user_verification_sessions(email, loan_application_number)
WHERE is_verified = false;

-- Prevents duplicate verified users
ALTER TABLE api.verified_users
ADD CONSTRAINT unique_verified_user
UNIQUE (email, loan_application_number);
```

### Complete RLS Policy Set

All tables now have comprehensive policies:

```sql
-- user_verification_sessions
CREATE POLICY "System can insert verification sessions" ON api.user_verification_sessions
    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "System can update verification sessions" ON api.user_verification_sessions
    FOR UPDATE TO anon USING (true);
CREATE POLICY "System can delete verification sessions" ON api.user_verification_sessions
    FOR DELETE TO anon USING (true);
CREATE POLICY "Users can read own verification sessions" ON api.user_verification_sessions
    FOR SELECT TO anon USING (
        (auth.jwt() ->> 'email') = email OR
        auth.uid()::text IN (
            SELECT supabase_user_id::text
            FROM api.verified_users
            WHERE verified_users.email = user_verification_sessions.email
        )
    );

-- verified_users
CREATE POLICY "System can insert verified users" ON api.verified_users
    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "System can update verified users" ON api.verified_users
    FOR UPDATE TO anon USING (true);
CREATE POLICY "Users can read own verified user record" ON api.verified_users
    FOR SELECT TO anon USING (
        (auth.jwt() ->> 'email') = email OR
        auth.uid() = supabase_user_id
    );

-- user_access_logs
CREATE POLICY "System can insert access logs" ON api.user_access_logs
    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Users can read own access logs" ON api.user_access_logs
    FOR SELECT TO anon USING (
        (auth.jwt() ->> 'email') = email OR
        auth.uid()::text IN (
            SELECT supabase_user_id::text
            FROM api.verified_users
            WHERE verified_users.email = user_access_logs.email
        )
    );

-- security_events
CREATE POLICY "System can insert security events" ON api.security_events
    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "System can read security events" ON api.security_events
    FOR SELECT TO anon USING (true);
CREATE POLICY "System can update security events" ON api.security_events
    FOR UPDATE TO anon USING (true);

-- rate_limiting
CREATE POLICY "System can insert rate limiting records" ON api.rate_limiting
    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "System can read rate limiting records" ON api.rate_limiting
    FOR SELECT TO anon USING (true);
CREATE POLICY "System can update rate limiting records" ON api.rate_limiting
    FOR UPDATE TO anon USING (true);
CREATE POLICY "System can delete expired rate limiting records" ON api.rate_limiting
    FOR DELETE TO anon USING (true);
```

## Code Quality Improvements

### Enhanced Error Handling

```typescript
// Improved session cleanup with error logging
const { error: deleteError } = await supabase
  .schema('api')
  .from('user_verification_sessions')
  .delete()
  .eq('email', sanitizeString(email))
  .eq('loan_application_number', loanApplicationNumber)

if (deleteError) {
  console.error('Error deleting existing sessions:', deleteError)
  // Continue anyway - might be no existing sessions
}
```

### Better Input Validation

```typescript
// Enhanced validation in API routes
if (!loanApplication) {
  await logSecurityEvent(
    'loan_not_found',
    'medium',
    'Verification requested for non-existent loan application',
    ipAddress,
    email,
    undefined, // Don't pass non-existent loan number
    userAgent,
    { requestedLoanNumber: loanNumberAsInt }
  )
  return NextResponse.json(
    { error: 'Loan application not found' },
    { status: 404 }
  )
}
```

### Type Safety Improvements

```typescript
// Use .maybeSingle() for optional data
export async function getVerifiedUser(
  email: string,
  loanApplicationNumber: number
): Promise<VerifiedUser | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .schema('api')
    .from('verified_users')
    .select('*')
    .eq('email', email)
    .eq('loan_application_number', loanApplicationNumber)
    .eq('is_active', true)
    .maybeSingle() // ✅ Handles zero rows gracefully

  if (error) {
    console.error('Error fetching verified user:', error)
    return null
  }

  return data
}
```

## Testing Recommendations

### Database Testing

1. **Test duplicate session creation:**

```typescript
// Should not throw error
await createVerificationSession(email, loanNumber, code1)
await createVerificationSession(email, loanNumber, code2) // Should replace first
```

2. **Test non-existent data queries:**

```typescript
// Should return null, not throw error
const user = await getVerifiedUser('nonexistent@email.com', 999999)
expect(user).toBeNull()
```

3. **Test foreign key validation:**

```typescript
// Should use security logging, not user action logging
const result = await sendVerificationCode('test@email.com', '999999')
expect(result.error).toContain('Loan application not found')
```

### Error Scenario Testing

1. **Rate limiting edge cases**
2. **Concurrent session creation**
3. **Database connection failures**
4. **Invalid input handling**
5. **Email delivery failures**

## Performance Considerations

### Index Optimization

Ensure these indexes exist for optimal performance:

```sql
-- Check existing indexes
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'api'
  AND tablename IN ('user_verification_sessions', 'verified_users', 'user_access_logs');

-- Add missing indexes if needed
CREATE INDEX IF NOT EXISTS idx_verification_sessions_email_loan
ON api.user_verification_sessions(email, loan_application_number);

CREATE INDEX IF NOT EXISTS idx_verification_sessions_expires
ON api.user_verification_sessions(code_expires_at)
WHERE is_verified = false;

CREATE INDEX IF NOT EXISTS idx_access_logs_email_loan
ON api.user_access_logs(email, loan_application_number);
```

### Query Optimization

- Use `.maybeSingle()` instead of `.single()` when zero rows are possible
- Batch related operations to reduce database round trips
- Use database functions for complex operations
- Implement proper cleanup procedures for expired data

## Monitoring and Alerts

### Key Metrics to Monitor

1. **Duplicate key violations** - Should be zero after fixes
2. **PGRST116 errors** - Should be eliminated
3. **Foreign key violations** - Should use security logging instead
4. **Session cleanup success rate**
5. **Email delivery success rate**

### Recommended Alerts

- Database error rate > 1%
- Session creation failure rate > 5%
- Email delivery failure rate > 10%
- Unusual security event patterns

## Migration Checklist

When deploying these fixes:

- [ ] Apply new RLS policies
- [ ] Update application code
- [ ] Test error scenarios
- [ ] Monitor error logs
- [ ] Verify email delivery
- [ ] Check session management
- [ ] Validate cleanup procedures

## Conclusion

These fixes address the core production issues while improving overall system reliability and maintainability. The enhanced error handling, consistent RLS policies, and better input validation provide a more robust foundation for the loan status verification system.
