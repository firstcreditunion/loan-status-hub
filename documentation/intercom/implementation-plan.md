## Intercom chatbot integration plan for Loan Processing (Portal) and Status Hub

### Goals

- Provide a two-way, auditable chat between lender (internal) and customer (external) tied to each loan application (e.g., application 101).
- Embed Intercom Messenger and Fin (optional) in both apps; enforce identity verification so both apps map to the same Intercom contact.
- Persist all conversations/messages for audit in Supabase, with reliable backfill and replay.
- Respect office hours: customers can always send messages; lenders respond during business hours.

### API usage notes and conventions (per Intercom docs)

- Regions: use the correct regional API base if needed (US `https://api.intercom.io/`, EU `https://api.eu.intercom.io`, AU `https://api.au.intercom.io`).
- Headers: send `Authorization: Bearer <access_token>` and `Accept: application/json`; include `Intercom-Version` header when required by the endpoint examples.
- Encoding: JSON UTF-8; treat IDs as opaque strings.
- Identifiers: object `id` values are unique per workspace, not globally; store `workspace_id` with IDs if you mirror data.
- Pagination: use cursor-based pagination (`per_page`, `pages.next.starting_after`) for list and search APIs.

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

### High-level architecture

- **Intercom workspace**: Single workspace for both apps to share contacts, conversations, and agents.
- **Portal (internal)**: Next.js app (`/loan-application/[id]`) where lenders view application and reply via Intercom API as an admin or open in Inbox.
- **Status Hub (customer)**: Next.js app where customers view status and chat via Intercom Messenger; identity-verified so it maps to the same contact.
- **Supabase**: System of record for loan data and audit mirror for Intercom conversations and parts.
- **Webhook receiver**: HTTPS endpoint (Vercel/Edge or server) to ingest Intercom webhooks for conversation/contact/ticket events; writes to Supabase.
- **Background jobs**: Backfill/repair sync by searching and fetching conversations periodically; retries and rate-limit-aware.

### Data model (Supabase)

Create normalized tables to mirror Intercom and link to domain entities:

- `intercom_contacts` (id, external_id, email, name, role, created_at, updated_at)
- `intercom_admins` (id, name, email, away, team_id, created_at, updated_at)
- `intercom_conversations` (id, state, subject/title, assignee_admin_id, contact_id, loan_application_id, last_updated_at, created_at)
- `intercom_conversation_parts` (id, conversation_id, author_type, author_id, body_text, body_html, part_type, attachments, metadata_json, created_at)
- `intercom_tickets` (id, category, state, assignee_admin_id, contact_id, loan_application_id, created_at, updated_at)
- `loan_application_chat_link` (loan_application_id, conversation_id, ticket_id NULLABLE, UNIQUE constraints)

Notes

- Use Intercom IDs as primary keys for mirror tables; add RLS based on your tenanting model.
- Store both plaintext and sanitized HTML for parts; keep raw JSON for forensics.
- Index by `loan_application_id`, `conversation_id`, `contact_id`, `last_updated_at` for fast lookups.

### Identity and contact strategy

- Enable Intercom identity verification in workspace settings.
- In both apps, boot the Messenger with the same authenticated customer identity, including `user_id` (or `external_id`) and `user_hash` (HMAC-SHA256), so the same Intercom contact is used across apps.
- On loan creation, ensure a matching Intercom contact exists; if not, create or upsert it with stable identifiers and core attributes (name, email, phone, membership id).

Key endpoints

- Create contact and search/update for upsert:
  - POST `/contacts` (create)
  - POST `/contacts/search` (find by external_id/email)
  - PUT `/contacts/{id}` (update; supports associating custom object instances)

```8416:8419:documentation/intercom/api docs/api.intercom.io.json
"/conversations": {
  "get": {
    "summary": "List all conversations",
```

```7631:7633:documentation/intercom/api docs/api.intercom.io.json
"/contacts": {
  "post": {
    "summary": "Create contact",
```

```7463:7465:documentation/intercom/api docs/api.intercom.io.json
"/contacts/search": {
  "post": {
    "summary": "Search contacts",
```

### Conversation lifecycle tied to loan application

1. Customer starts a chat in Status Hub (Intercom Messenger) or receives an outbound message; a conversation is created by Intercom.
2. Link the conversation to the specific application (e.g., 101) using one or more of:
   - Associate a Custom Object Instance (see below) with the conversation.
   - Add a conversation tag like `loan_application:101` for quick filtering.
   - Store the mapping `loan_application_id → conversation_id` in Supabase when the first event arrives.
3. Lender replies from the Portal page using server-to-server API (admin reply) or via Intercom Inbox; customer sees messages in Status Hub Messenger.
4. All conversation parts are persisted to Supabase via webhooks; nightly job backfills anything missed.

Core endpoints

- Retrieve and search conversations:
  - GET `/conversations`
  - GET `/conversations/{id}`
  - POST `/conversations/search`
- Reply and manage:
  - POST `/conversations/{id}/reply` (admin/customer reply)
  - POST `/conversations/{id}/parts` (assign, open/close/snooze, notes)

```9672:9674:documentation/intercom/api docs/api.intercom.io.json
"/conversations/{id}/reply": {
  "post": {
    "summary": "Reply to a conversation",
```

```10229:10231:documentation/intercom/api docs/api.intercom.io.json
"/conversations/{id}/parts": {
  "post": {
    "summary": "Manage a conversation",
```

### Linking conversations to loan applications with Custom Objects

- Define a Custom Object Type in Intercom (via UI) named `LoanApplication` with fields like `external_id`, `status`, `amount`, `submitted_at`, etc.
- For each application, upsert a `LoanApplication` instance with `external_id = application_id`.
- Associate the instance to both the Intercom contact and the conversation.

Key endpoints

- Create or update instance:
  - POST `/custom_object_instances/{custom_object_type_identifier}` (by external_id)
- Fetch/delete instance:
  - GET `/custom_object_instances/{custom_object_type_identifier}` (by external_id)
- Associate instance to conversation/contact:
  - PUT `/conversations/{id}` with association payload
  - PUT `/contacts/{id}` with association payload

```11799:11806:documentation/intercom/api docs/api.intercom.io.json
"/custom_object_instances/{custom_object_type_identifier}": {
  "parameters": [
    {
      "name": "custom_object_type_identifier",
      "example": "Order",
```

```9104:9109:documentation/intercom/api docs/api.intercom.io.json
"Conversations",
"Custom Object Instances"
...
"operationId": "updateConversation",
```

### Optional: Tickets for internal workflows

- If you prefer structured, assignable work items, create a ticket per loan application and link it to the conversation.
- Use ticket replies for internal or external updates; link tracker/back-office as needed.

Key endpoints

- POST `/tickets` (create), POST `/tickets/{id}/reply` (reply), POST `/conversations/{id}/convert` (convert to ticket), `/tickets/search` (find by attributes).

```17501:17503:documentation/intercom/api docs/api.intercom.io.json
"/tickets/{id}/reply": {
  "post": {
    "summary": "Reply to a ticket",
```

```18023:18025:documentation/intercom/api docs/api.intercom.io.json
"/tickets": {
  "post": {
    "summary": "Create a ticket",
```

### Starting outbound/admin messages

- Use outbound messages to prompt or re-engage the customer (creates or continues a conversation depending on type).

Key endpoint

- POST `/messages` (create message)

```13450:13452:documentation/intercom/api docs/api.intercom.io.json
"/messages": {
  "post": {
    "summary": "Create a message",
```

### Eventing, webhooks, and audit

- Prefer Intercom Webhooks to receive events: conversation created/updated, parts created, admin/customer replies, contact updates, ticket events.
  - Subscribe to topics via the Developer Hub UI (Webhooks page of your App), not via REST.
  - Verify requests via `X-Hub-Signature` computed over the raw body using your App `client_secret` (HMAC-SHA1, header format `sha1=<hex>`).
- Persist events to Supabase within a transaction; upsert contacts/admins/conversations/parts, link to `loan_application_id` via association/tag or prior mapping.
- Backfill/repair sync
  - On schedule, use `POST /conversations/search` by `updated_at` and known association/tag to retrieve and reconcile missing messages.
  - Also emit `POST /events` for domain-level milestones (e.g., loan status changes) to enrich Intercom.

```20:29:documentation/intercom/webhook/set-up-webhooks.md
To configure your Webhook subscriptions, navigate to your App in your Developer Hub and select Webhooks to set up a Webhook subscription.
```

```1:6:documentation/intercom/webhook/webhooks.md
# Webhooks
Webhooks are a way that you can access real-time notifications about events that happen in your Intercom workspace.
```

```25:35:documentation/intercom/webhook/webhook-notifications.md
We will resend if we do not receive HTTP 200 within 5000ms. Respond 200 quickly and offload work.
```

Key endpoints in this spec

- Conversations search and retrieval: `/conversations`, `/conversations/{id}`, `/conversations/search`
- Events ingestion: POST `/events`
- Admin activity logs (for governance): GET `/admins/activity_logs`

```12911:12913:documentation/intercom/api docs/api.intercom.io.json
"/events": {
  "post": {
    "summary": "Submit a data event",
```

```266:268:documentation/intercom/api docs/api.intercom.io.json
"/admins/activity_logs": {
  "get": {
    "summary": "List all activity logs",
```

### Office hours and availability

- Configure official office hours in Intercom settings to influence SLAs/expectations and Messenger copy.
- Optionally set admins away/present programmatically around your schedule to control assignment and auto-replies.
- Customers can always send messages; lenders answer during hours. Use Intercom workflows to send an automated after-hours acknowledgement.

Key endpoints

- GET `/admins`, GET `/admins/{id}` (read admin state), PUT `/admins/{id}/away` (toggle away)
- Office hours are also reflected in analytics schemas and activity logs.

```74:76:documentation/intercom/api docs/api.intercom.io.json
"/admins/{id}/away": {
  "put": {
    "summary": "Set an admin to away",
```

```393:395:documentation/intercom/api docs/api.intercom.io.json
"/admins": {
  "get": {
    "summary": "List all admins",
```

```19902:19906:documentation/intercom/api docs/api.intercom.io.json
"messenger_search_required_change",
"messenger_spaces_change",
"office_hours_change",
```

### Fin/AI and knowledge sources (optional)

- Enable Fin and provide knowledge via Help Center and External Content API; mark which sources are available to AI.
- Maintain external pages relevant to loans/membership in Intercom with `ai_agent_availability`.

Reference in this spec

```24241:24246:documentation/intercom/api docs/api.intercom.io.json
"ai_agent_availability": {
  "type": "boolean",
  "description": "Whether the external page should be used to answer questions by AI Agent.",
```

### Security, auth, and permissions

- Use Intercom PAT or OAuth app with least-privilege scopes. Store secrets in Vercel/Env.
- Implement identity verification in both apps so only authenticated customers can use Messenger for their own account.
- Server-to-server calls only from backend; never expose tokens to the browser.
- Apply RLS in Supabase to protect audit tables and linkages by org/tenant.

### Error handling and resiliency

- Handle HTTP 429 backoff; respect `Retry-After` and use exponential backoff with jitter.
- Use idempotency keys on write endpoints (e.g., replies) to avoid duplicates.
- Queue outbound writes and webhook processing; ensure at-least-once delivery semantics with deduplication by Intercom IDs.

### Implementation checklist

1. Intercom workspace setup
   - Enable identity verification; obtain signing secret; create OAuth app or PAT.
   - Define Custom Object Type `LoanApplication` with schema in Intercom UI.
   - Configure Office Hours and basic after-hours workflow.
   - (Optional) Enable Fin and register external content sources.
2. Supabase
   - Create audit tables listed above and indexes; enforce RLS as needed.
3. Identity and Messenger
   - Add Intercom Messenger to both apps; compute `user_hash` for signed-in customers; pass stable `user_id`/`external_id`.
4. Contact lifecycle
   - On loan creation/update, upsert contact and custom object instance via `/contacts`, `/custom_object_instances/*`.
5. Conversation linking
   - On first conversation event, attach `LoanApplication` instance to conversation via `PUT /conversations/{id}` and record mapping in Supabase.
6. Admin reply from Portal
   - Implement server endpoint that calls `POST /conversations/{id}/reply` with `type: admin`, `admin_id`, `message_type: comment`.
7. Webhooks ingestion
   - Subscribe to conversation/contact/ticket topics; verify signatures; upsert to Supabase; maintain mapping.
8. Backfill jobs
   - Periodically run `POST /conversations/search` filtered by last update to reconcile.
9. Office hours behavior
   - Cron to toggle `/admins/{id}/away` per schedule; ensure workflows auto-reply after hours.
10. Monitoring

- Track failures, rate limits, and audit via `/admins/activity_logs`.

### Minimal endpoint map (from this spec)

- Contacts: `POST /contacts`, `POST /contacts/search`, `PUT /contacts/{id}`, `GET /contacts`
- Conversations: `GET /conversations`, `GET /conversations/{id}`, `POST /conversations/search`, `POST /conversations/{id}/reply`, `POST /conversations/{id}/parts`
- Custom Objects: `POST/GET/DELETE /custom_object_instances/{type}`, `PUT /conversations/{id}`, `PUT /contacts/{id}` for associations
- Messages: `POST /messages`
- Tickets (optional): `POST /tickets`, `POST /tickets/{id}/reply`, `POST /conversations/{id}/convert`, `POST /tickets/search`
- Events: `POST /events`
- Admins and logs: `GET /admins`, `GET /admins/{id}`, `PUT /admins/{id}/away`, `GET /admins/activity_logs`

### Open items (outside this OpenAPI file)

- Webhooks: Manage subscriptions in the Developer Hub UI. Validate payloads via `X-Hub-Signature` using your App `client_secret`. I can incorporate specific topic names and example payloads as needed.
- Messenger identity verification specifics: the exact parameter (`user_hash`) and generation flow are documented in the Intercom Messenger docs. We will follow that when wiring the frontend.

---

If you want, I can adapt this plan into concrete tasks for both codebases (Portal and Status Hub), or generate DB migration SQL for Supabase once you sign off.
