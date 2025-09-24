## Intercom + Supabase + Apps: End-to-end Implementation Plan (PAT-based)

This plan assumes you will use a Personal Access Token (PAT) stored in `INTERCOM_DEV_ACCESS_TOKEN` for all server-to-server API calls. OAuth is not used.

### 0) Prerequisites and environments

- Environments: Dev first, then Prod. Create separate PATs per workspace/env if possible.
- Secrets storage: Use `.env.local` for dev; Vercel/hosted secrets for production.
- Rate limits: Build with retries/backoff from the start.

### API usage notes and conventions (per Intercom docs)

- Regions: use the correct regional API base if needed (US `https://api.intercom.io/`, EU `https://api.eu.intercom.io`, AU `https://api.au.intercom.io`).
- Headers: always send `Authorization: Bearer <access token>` and `Accept: application/json`. Include `Intercom-Version` when required by endpoint examples.
- Encoding: JSON UTF-8; treat all object IDs as opaque strings.
- Identifiers: IDs are unique per workspace, not globally; store `workspace_id` alongside IDs in your mirror tables.
- Pagination: use cursor-based pagination for list and search (`per_page`, `pages.next.starting_after`).

```9:14:documentation/intercom/apis/using-rest-apis.md
| US                        | `https://api.intercom.io/`   |
| Europe                    | `https://api.eu.intercom.io` |
| Australia                 | `https://api.au.intercom.io` |
```

```3:12:documentation/intercom/apis/make-an-api-call.md
$ curl https://api.intercom.io/admins \
-H 'Authorization:Bearer <INSERT_ACCESS_TOKEN_HERE>' \
-H 'Accept: application/json'
```

```1:8:documentation/intercom/apis/identifiers-and-urls.md
# Identifiers and URLs
All objects in the API have an `id` field indicating their logical identifier.
```

```1:7:documentation/intercom/apis/pagination.md
# Pagination
Intercom APIs for listing and searching resources offer cursor-based pagination.
```

### Rate limits (required for PAT setup)

- Centralize calls
  - Route ALL Intercom HTTP calls through a single backend client. Inject `Authorization: Bearer ${INTERCOM_DEV_ACCESS_TOKEN}` server-side only.
  - Never call Intercom from the browser.

- Add a limiter/queue
  - Use a process-wide limiter to control concurrency and pacing.
  - Suggested defaults:
    - maxConcurrent: 2–4
    - minInterval: 100 ms between requests
  - Run all traffic (user actions, webhooks, backfills) through this limiter.

- Respect server hints and retry
  - On 429: if `Retry-After` is present, wait exactly that time then retry; otherwise exponential backoff with jitter (0.5s → 1s → 2s → 4s …, ±20% jitter).
  - On 500/502/503/504: same backoff policy.
  - Cap at 5 attempts, then surface an error and log context.

- Use rate-limit headers if available
  - Record limit/remaining/reset-style headers when present; pause or slow down as remaining approaches zero.
  - Feed into limiter (e.g., temporarily reduce concurrency or add a sleep until reset).

- Priority lanes
  - User-facing lane (admin clicks) with tighter budgets and short timeouts.
  - Background lane (backfills, nightly sync) with slower pace and larger timeouts.
  - Both lanes still share the global limiter so totals stay within quota.

- Idempotency for writes
  - Provide an idempotency key on POST/PUT that create side effects (`/conversations/{id}/reply`, `/custom_object_instances/{type}`, etc.).
  - Derive from a stable operation hash (e.g., conversation_id + local_message_id).

- Timeouts and circuit breaking
  - HTTP client timeout 10–20s; fail fast on hung sockets.
  - If repeated failures occur, open a short circuit (30–60s) to shed load, then half-open and retry.

- Backfill pacing
  - Keep page size small (20–50); sleep 250–500 ms between pages.
  - Query by `updated_at` windows; avoid full-history scans during business hours.

- Webhook processing
  - Acknowledge quickly (200). Offload heavy work to jobs using the same limiter and retry policy.

- Observability
  - Emit metrics: requests, error rates by status, retries, average limiter wait, concurrency, remaining/limit, queue lag.
  - Alert on sustained 429s, repeated circuit openings, long backoffs (>30s), job lag.

- Configuration knobs (env-driven)
  - `INTERCOM_RATE_MAX_CONCURRENCY` (default 2–4)
  - `INTERCOM_RATE_MIN_INTERVAL_MS` (default 100)
  - `INTERCOM_RETRY_MAX_ATTEMPTS` (default 5)
  - `INTERCOM_RETRY_BASE_DELAY_MS` (default 500)
  - `INTERCOM_RETRY_MAX_DELAY_MS` (default 8000)
  - `INTERCOM_USER_LANE_BUDGET` (e.g., 20 req/min)
  - `INTERCOM_BACKGROUND_LANE_BUDGET` (e.g., 200 req/min)

- Testing plan
  - Simulate 429 and 5xx to verify Retry-After handling, backoff, and idempotency.
  - Run a bounded backfill in dev to validate pacing and absence of bursts.
  - Ensure user-facing actions stay responsive while background jobs run.

### 1) Intercom portal setup (one-time, per workspace)

1. Create or identify the Intercom workspace you’ll use.
2. Generate a Personal Access Token (PAT) with full required permissions (you already have this).
   - Save as `INTERCOM_DEV_ACCESS_TOKEN` in your backend environment.
3. Enable Messenger identity verification.
   - Copy the identity secret → `INTERCOM_DEV_IDENTITY_SECRET`.
4. Enable Fin (AI) if in scope and set knowledge sources:
   - Help Center articles.
   - External content sources (mark pages with AI availability via API or UI).
5. Configure Office Hours in Intercom workspace settings.
6. Webhook Subscriptions in Intercom UI (already configured):
   - Topics currently enabled in your workspace (source: `documentation/intercom/webhook/subscribed_topics.md`):

```1:100:documentation/intercom/webhook/subscribed_topics.md
contact.user.created
On
User created

read_users_companies
read_write_users
read_single_user
contact.user.updated
On
User updated

read_users_companies
read_write_users
read_single_user
conversation_part.tag.created
On
Conversation tagged

read_conversations
conversation.admin.snoozed
On
Conversation snoozed

read_conversations
conversation.admin.unsnoozed
On
Conversation unsnoozed

read_conversations
conversation.operator.replied
On
Reply from Operator

read_conversations
conversation.priority.updated
On
Conversation priority updated

read_conversations
conversation.read
On
Conversation Read

read_conversations
conversation.user.created
On
New message from a user or lead

read_conversations
conversation.user.replied
On
Reply from a user or lead

read_conversations
ticket.attribute.updated
On
A ticket attribute get updated

read_tickets
ticket.closed
On
Ticket closed

read_tickets
ticket.contact.attached
On
Ticket contact attached

read_tickets
ticket.contact.replied
On
Reply from a contact

read_tickets
ticket.created
On
New ticket created

read_tickets
ticket.note.created
On
Note added to a ticket

read_tickets
ticket.rating.provided
On
Ticket rating provided

read_tickets
ticket.state.updated
On
Ticket state updated

read_tickets
ticket.team.assigned
On
Team get assigned to a ticket

read_tickets
```

- Endpoint: your webhook receiver URL (Portal backend).
- Verification: Intercom signs requests via `X-Hub-Signature` using your App's `client_secret`. Use `INTERCOM_DEV_CLIENT_SECRET` to verify.

7. Custom Object Type `LoanApplication` is created (source: `documentation/intercom/customObjects/LoanApplication.md`). Attributes currently defined:

```1:25:documentation/intercom/customObjects/LoanApplication.md
status
Status of your loan appliciation
Text
currency
Text
submitted_at
Loan application submitted datetime
Text
loan_amount
Number
member_id
Date
application_url
Text
external_id
Primary
A unique identifier, which can be used to link the Object Instance between Intercom and an external system.
Text
external_created_at
A timestamp declaring when an Object Instance of this type was created in an external system.
Date
external_updated_at
A timestamp declaring when an Object Instance of this type was last updated in an external system.
Date
```

References in your OpenAPI file for features leveraged later:

```74:76:documentation/intercom/api docs/api.intercom.io.json
"/admins/{id}/away": {
  "put": {
    "summary": "Set an admin to away",
```

```11799:11806:documentation/intercom/api docs/api.intercom.io.json
"/custom_object_instances/{custom_object_type_identifier}": {
  "parameters": [
    { "name": "custom_object_type_identifier", "example": "Order" }
```

```13450:13452:documentation/intercom/api docs/api.intercom.io.json
"/messages": {
  "post": {
    "summary": "Create a message",
```

### 2) Supabase setup (shared system of record)

Create audit/mirror tables with Intercom IDs as primary keys and strong indices:

- `intercom_contacts` (pk: id, external_id, email, name, role, created_at, updated_at)
- `intercom_admins` (pk: id, name, email, away, team_id, created_at, updated_at)
- `intercom_conversations` (pk: id, state, subject, assignee_admin_id, contact_id, loan_application_id, last_updated_at, created_at)
- `intercom_conversation_parts` (pk: id, conversation_id, author_type, author_id, body_text, body_html, part_type, attachments_json, metadata_json, created_at)
- `intercom_tickets` (pk: id, category, state, assignee_admin_id, contact_id, loan_application_id, created_at, updated_at)
- `loan_application_chat_link` (pk: loan_application_id, conversation_id unique, ticket_id nullable)
- `intercom_webhook_events` (id uuid, event_type, payload_json, processed_at, created_at)

Indexes

- By `loan_application_id`, `conversation_id`, `contact_id`, `last_updated_at`.

RLS

- Protect by organization/tenant if applicable. Service role bypass for webhooks.

Workspace scoping and identity

- All `intercom_*` mirror tables MUST include `workspace_id` (text, required).
- Uniqueness is enforced per workspace: `UNIQUE(workspace_id, id)` on contacts/admins/conversations/tickets/etc.
- Foreign keys between mirror tables should include `workspace_id` to avoid cross-workspace leakage.

#### Membership/Client enrichment additions (align with tblMembershipApplicationDetails and s$tblClient)

To minimize joins to operational tables during audits and analytics, enrich the Intercom mirror with key membership/client columns:

- intercom_contacts (add fields)
  - portal_client_number (int, nullable)
  - g3_client_number (text, nullable)
  - primary_email (text, nullable)
  - full_name (text, nullable)
  - role_for_client (text, nullable)
  - title (text, nullable)
  - first_name (text, nullable)
  - middle_name (text, nullable)
  - surname (text, nullable)
  - name_last_updated_at (timestamptz, nullable)

- intercom_conversations (add fields)
  - application_number (int, nullable)
  - portal_client_number (int, nullable)
  - application_status (text, nullable)
  - is_joint_application (bool, nullable)
  - trading_branch (text, nullable)
  - assigned_clerk_user (text, nullable)
  - application_complete (bool, nullable)
  - application_completed_by_member (bool, nullable)
  - application_completed_at (timestamptz, nullable)
  - client_application_date (timestamptz, nullable)
  - escalated_to (text, nullable)

- intercom_conversation_parts (add fields)
  - application_number (int, nullable)
  - portal_client_number (int, nullable)

- intercom_tickets (if used) (add fields)
  - application_number (int, nullable)
  - portal_client_number (int, nullable)
  - application_status (text, nullable)
  - trading_branch (text, nullable)

- loan_application_chat_link (expand)
  - application_number (int, required)
  - portal_client_number (int, nullable)
  - intercom_contact_id (text, nullable)
  - intercom_conversation_id (text, nullable)
  - intercom_ticket_id (text, nullable)
  - UNIQUE(application_number, intercom_conversation_id)
  - workspace_id (text, required)
  - created_at (timestamptz, default now())
  - updated_at (timestamptz, default now())

- Optional mapping table: intercom_contacts_to_clients
  - intercom_contact_id (pk part)
  - portal_client_number (pk part)
  - g3_client_number (text, nullable)
  - primary_email (text, nullable)
  - created_at, updated_at

Enrichment sources

- Names: prefer `s$tblClient.Title/first_name/middle_name/surname`; fallback to `tblMembershipApplicationDetails.applicant_name`.
- Email: prefer client email table; fallback to `tblMembershipApplicationDetails.email_address`.
- Application context: mirror `Application_Status`, `is_joint_application`, `trading_branch`, and `application_assigned_clerk_user` from `tblMembershipApplicationDetails`.
  - Completion context: also mirror `Application_Complete`, `application_completed_by_member`, `application_completed_by_member_datetime`, and `client_application_date`.

Indexes (add)

- intercom_contacts: (portal_client_number), (g3_client_number), (primary_email)
- intercom_conversations: (application_number), (portal_client_number), (application_status), (last_updated_at DESC)
- loan_application_chat_link: (application_number), (portal_client_number), (intercom_contact_id)
- intercom_conversation_parts: (conversation_id, created_at), (application_number, created_at)
- All intercom\_\* tables: `UNIQUE(workspace_id, id)` (where `id` is the Intercom resource id)
- For joins and filters: (workspace_id) on all mirror tables

Step-by-step (Dev) for Supabase setup

1. Create mirror tables (read models only)
   - Define `intercom_contacts`, `intercom_admins`, `intercom_conversations`, `intercom_conversation_parts`, `intercom_tickets`, `intercom_webhook_events`, and `loan_application_chat_link`.
   - Include `workspace_id` on all `intercom_*` tables; enforce `UNIQUE(workspace_id, id)`.
   - Add enrichment columns listed above (names, emails, application context, completion context, client numbers).

2. Indexes and constraints
   - Create the additional indexes listed above for fast lookups and reconciliation.
   - Add foreign keys using composite keys where applicable (including `workspace_id`) to prevent cross-workspace joins.

3. RLS and access patterns
   - Enable RLS where tenanting is required. Allow service-role bypass for webhook ingestion/backfills.
   - Keep webhook raw payloads in `intercom_webhook_events` with minimal RLS; normalize downstream via jobs.

4. Data flow wiring (no code yet)
   - Webhooks: upsert Contacts/Admins/Conversations/Parts/Tickets → update enrich fields from `tblMembershipApplicationDetails` and `s$tblClient*` tables.
   - Backfill: periodic `conversations/search` and `GET /conversations/{id}` → reconcile and fill gaps using `last_updated_at` and part timestamps.
   - Mapping: maintain `loan_application_chat_link` on first event linking `application_number`⇄`conversation_id` and keep it updated.

5. Identity and linkage
   - Contacts: prefer `Portal_Client_Number` as `external_id`; store `g3_client_number` when available.
   - Conversations/Tickets: store `application_number` and `portal_client_number`; tag with `loan_application:<number>` and `portal_client:<number>` (in Intercom) for additional robustness.

Identity and linkage conventions

- Intercom contact external_id: use `Portal_Client_Number` (stringified) for stability across multiple applications; fallback to email and reconcile later.
- Conversation linkage: keep the `LoanApplication` custom object association (`external_id = application_number`) and also tag conversations with `loan_application:<number>` and `portal_client:<number>`.
- Persist both numbers (`application_number`, `portal_client_number`) in `loan_application_chat_link` and denormalized columns above.

### 3) Status Hub (customer app) – Messenger with identity verification

Goal: Customer at `/loan-application/101` can chat; identity maps to same Intercom contact.

Steps

1. Add Intercom Messenger script and boot on authenticated pages.
2. Compute `user_hash = HMAC-SHA256(INTERCOM_DEV_IDENTITY_SECRET, user_id)` on the server and include in boot payload.
3. Provide stable identifiers: `user_id` or `external_id`, `email`, `name`.
4. Pass contextual `loan_application_id` as a custom attribute for routing/analytics.
5. Test: message sent from Status Hub appears in Intercom Inbox under the correct contact.

Key Intercom identity concept in your spec:

```51:55:documentation/intercom/api docs/api.intercom.io.json
"identity_verification": false,
```

### 4) Portal (lender app) – Admin workflow

Goal: Lender on `/loan-application/[id]` can see or send messages tied to that application.

Two options (can do both):

- Open Intercom Inbox for the conversation; or
- Build an internal reply UI that posts via API as an admin.

Endpoints for internal reply and conversation management:

```9672:9674:documentation/intercom/api docs/api.intercom.io.json
"/conversations/{id}/reply": {
  "post": { "summary": "Reply to a conversation" }
```

```10229:10231:documentation/intercom/api docs/api.intercom.io.json
"/conversations/{id}/parts": {
  "post": { "summary": "Manage a conversation" }
```

Implementation details

- Server calls only: use `INTERCOM_DEV_ACCESS_TOKEN` in `Authorization: Bearer <token>`.
- Build helper to map `loan_application_id → conversation_id` (from Supabase), then reply.
- Use idempotency keys for safety on writes.

### 5) Contact and object lifecycle (upsert)

On loan create/update:

1. Upsert Intercom Contact by `external_id` or email.
   - POST `/contacts` (create)
   - POST `/contacts/search` (find) → PUT `/contacts/{id}` (update)
2. (Optional) Upsert `LoanApplication` Custom Object Instance with `external_id = application_id`.
   - POST `/custom_object_instances/{LoanApplication}`
3. Associate the object to the contact and, when available, the conversation.
   - PUT `/contacts/{id}` and PUT `/conversations/{id}` with association payloads.

References

```7562:7565:documentation/intercom/api docs/api.intercom.io.json
"/contacts": {
  "get": { "summary": "List all contacts" },
```

```7463:7465:documentation/intercom/api docs/api.intercom.io.json
"/contacts/search": {
  "post": { "summary": "Search contacts" },
```

### 6) Linking conversations to applications

Linking strategy (use more than one for robustness):

- Association to `LoanApplication` custom object instance.
- Conversation tag `loan_application:101`.
- Persist mapping in `loan_application_chat_link` on first webhook event.

### 7) Webhook ingestion service (Portal backend)

1. Expose a secure endpoint to receive Intercom webhooks.
2. Verify webhook signature:
   - Header: `X-Hub-Signature` (format: `sha1=<hex>`)
   - Compute HMAC-SHA1 over the raw request body using `INTERCOM_DEV_CLIENT_SECRET` and compare.
3. Store raw payload into `intercom_webhook_events` first, then upsert normalized records:
   - Contacts, admins, conversations, conversation parts, tickets.
4. Maintain `loan_application_id` mapping via association/tag/attribute.
5. Return 200 quickly; offload heavy processing to a job/queue.

Relevant topics in your spec (office hours, admin logs, etc.)

```266:268:documentation/intercom/api docs/api.intercom.io.json
"/admins/activity_logs": {
  "get": { "summary": "List all activity logs" },
```

### 8) Backfill and repair jobs

1. Periodic `POST /conversations/search` filtered by `updated_at` to fetch recent conversations.
2. For each conversation, `GET /conversations/{id}` to pull full parts and reconcile into Supabase.
3. Detect gaps by last known `conversation_part` timestamp.
4. Respect rate limits: exponential backoff with jitter, honor `Retry-After`.

References

```9535:9537:documentation/intercom/api docs/api.intercom.io.json
"/conversations/search": {
  "post": { "summary": "Search conversations" },
```

### 9) Office hours behavior

- Customers can message anytime.
- Configure Intercom workflows for after-hours auto-acknowledgements.
- Optionally, toggle admins away/present programmatically via `PUT /admins/{id}/away` at open/close.

```74:76:documentation/intercom/api docs/api.intercom.io.json
"/admins/{id}/away": { "put": { "summary": "Set an admin to away" } }
```

### 10) Security and compliance

- Keep PAT server-side only; never expose to the browser.
- Scope: PAT is broad—treat as production secret and rotate periodically.
- Verify webhooks; log signature failures.
- Supabase RLS on audit tables as applicable.
- Idempotency keys on write endpoints; deduplicate by Intercom IDs when persisting.

### 11) Monitoring and alerting

- Log Intercom API errors, rate limit headers, and retry attempts.
- Alert on webhook failures, processing lag, and sync gaps.
- Track data drift between Intercom and Supabase via scheduled comparisons.

### 12) Step-by-step execution order (Dev)

1. Intercom portal
   - Confirm PAT, identity verification, Fin, Office Hours.
   - Create webhooks; verification will use your App `client_secret` (no separate secret required).
   - (Optional) Create `LoanApplication` custom object type.
2. Supabase
   - Create audit tables and indexes; configure RLS.
3. Status Hub
   - Add Messenger with identity verification; server computes `user_hash`.
   - Send a test message; confirm in Inbox.
4. Portal backend
   - Implement webhook receiver (verify signature, persist, normalize).
   - Implement admin reply endpoint using `POST /conversations/{id}/reply`.
   - Implement upsert flows for contacts and custom object instances on loan create/update.
5. Backfill
   - Implement and schedule conversation search + reconciliation.
6. Office hours
   - Configure workflows; (optional) automate admin away toggle.
7. Monitoring
   - Add logging, alerts, and dashboards.

### Minimal endpoint map (this spec)

- Contacts: `POST /contacts`, `POST /contacts/search`, `PUT /contacts/{id}`, `GET /contacts`
- Conversations: `GET /conversations`, `GET /conversations/{id}`, `POST /conversations/search`, `POST /conversations/{id}/reply`, `POST /conversations/{id}/parts`
- Custom Objects: `POST/GET/DELETE /custom_object_instances/{type}`, `PUT /conversations/{id}`, `PUT /contacts/{id}` for associations
- Messages: `POST /messages`
- Tickets (optional): `POST /tickets`, `POST /tickets/{id}/reply`, `POST /conversations/{id}/convert`, `POST /tickets/search`
- Events: `POST /events`
- Admins and logs: `GET /admins`, `GET /admins/{id}`, `PUT /admins/{id}/away`, `GET /admins/activity_logs`

---

When you’re ready, I can generate SQL for the Supabase tables and skeleton endpoints for the webhook receiver and admin reply, wired to `INTERCOM_DEV_ACCESS_TOKEN`.

--- Requirements for Status Hub:
Environment and Secrets
Server-only secrets:
INTERCOM_IDENTITY_SECRET: Intercom Messenger identity verification secret.
INTERCOM_DEV_ACCESS_TOKEN: For server-to-server Intercom API calls (not used by Messenger, never exposed).

Client-readable config:
NEXT_PUBLIC_INTERCOM_APP_ID: Intercom Workspace App ID.
NEXT_PUBLIC_INTERCOM_REGION (optional): us, eu, or au to select the correct host.
Operational toggles:
NEXT_PUBLIC_INTERCOM_MESSENGER_ENABLED: true|false feature flag.
INTERCOM_MESSENGER_DEBUG (optional): true|false for verbose logging.

Deployment:
Set values in .env.local for dev and hosting platform secrets for prod.
Document ownership and rotation policy for all Intercom secrets.

Intercom Workspace Configuration

Enable identity verification for Messenger in workspace settings.
Confirm App ID and note it for client boot.
Office Hours configured (for after-hours behaviors).
Allowed domains: add your dev and prod domains so Messenger loads.
(Optional) Region: confirm your workspace region (US/EU/AU).

Data Preconditions (Auth and Identity)

Stable identifier: choose a durable user_id (not email) that persists across sessions.
User profile: make email and name available after auth.
Context attributes: ensure you can provide loan_application_id and any other attributes you want to analyze/route on.

Server Responsibility (Identity Hash)

Compute user_hash on the server using HMAC‑SHA256 of the user_id with INTERCOM_IDENTITY_SECRET.
Expose a secure server endpoint or server component that returns the Intercom boot payload fields: user_id (or external_id), email, name, user_hash, plus contextual attributes (e.g., loan_application_id).
Never compute or expose the secret in the browser.

Frontend Integration (Loading and Booting)

Load Messenger only on authenticated pages (e.g., your loan-application routes).
Boot payload must include:
app_id (from NEXT_PUBLIC_INTERCOM_APP_ID)
user_id (or external_id) — must match what was hashed
user_hash (from server)
email, name
Custom attributes: loan_application_id, and any others needed
Lifecycle:
On login/auth ready: boot Messenger with the payload.
On logout: shutdown Messenger and clear identity.
On user switch: update/shutdown then re-boot with new identity.

Context and Routing (Per Application)

Attach loan_application_id as a custom attribute in the boot payload.
(Optional) Standardize attribute names for analytics/routing (e.g., portal_client_number, application_status if needed later).

Security, Privacy, and Compliance

CSP: allow Intercom script, frames, and connections for your region host (api.intercom.io or regional variant).
PII minimization: only send required fields; avoid sensitive values.
Consent: gate Messenger load behind user consent if required (GDPR/CCPA).
Do not leak secrets: INTERCOM_IDENTITY_SECRET and PAT remain server-only.

Performance and UX

Defer loading: load script after auth is confirmed or when the route requires it.
Feature flag: guard via NEXT_PUBLIC_INTERCOM_MESSENGER_ENABLED for safe rollout.
Accessibility: verify keyboard navigation and contrast of the launcher on your theme.

Observability

Client logging: enable debug in non-prod during rollout.
Server logs/metrics: log identity payload build events and any failures.
Alerting: notify on persistent boot failures, high error rates, or CSP violations.

Testing and QA

Dev domain test: confirm Messenger loads on dev URL.
Identity verification: verify Intercom shows “Verified” on the contact; mismatches indicate wrong user_id or hash.
Contact linkage: send a message and confirm it appears under the correct contact.
Context: verify loan_application_id appears as a custom attribute in Intercom.
Login/logout flows: ensure boot/shutdown on transitions; test multi-tab behavior.
Region: confirm correct regional host calls (US/EU/AU) if set.

Rollout

Staged enablement: enable on a subset of routes or internal users first.
Monitor: watch error logs, page performance, and Intercom Inbox mapping.
Document: write a short runbook for identity issues (hash mismatches, missing attributes, logout glitches).
Key outcome: Messenger loads only for authenticated users, identity is verified (via user_hash), and conversations are contextually linked to loan_application_id for routing/analytics.
