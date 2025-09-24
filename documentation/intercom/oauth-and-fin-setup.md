## OAuth and Fin setup (Intercom)

### Environment variables (dev)

- `INTERCOM_DEV_APP_NAME`
- `INTERCOM_DEV_CLIENT_ID`
- `INTERCOM_DEV_CLIENT_SECRET`
- `INTERCOM_DEV_OAUTH_REDIRECT_URI` (e.g., https://portal.example.com/api/intercom/oauth/callback)
- `INTERCOM_DEV_OAUTH_SCOPES` (space- or comma-separated; see Scopes below)
- `INTERCOM_DEV_IDENTITY_SECRET` (Messenger identity verification secret)
- (Webhook verification uses your App client_secret; no separate secret is required)

### Scopes (minimum for this project)

- Conversations: read, write
- Contacts: read, write
- Tickets: read, write (if using Tickets)
- Custom Objects: read, write
- Messages: write
- Events: write
- Admins: read (to read admin list/state)
- Webhooks/Subscriptions management: manage (create/list/delete) — configured in Intercom webhooks UI if not available via API

Note: Intercom names for scopes vary by UI; grant the above capabilities when installing the app. Use least privilege in prod.

### Redirect URI(s)

- Prefer a single backend callback in Portal to own the OAuth tokens for the workspace:
  - `INTERCOM_DEV_OAUTH_REDIRECT_URI = https://portal.<your-domain>/api/intercom/oauth/callback`
  - Status Hub should not handle OAuth directly; it will call your backend which uses the stored workspace token.

### OAuth flow

1. Build authorization URL with `client_id`, `redirect_uri`, required scopes, and `state`.
2. User (you, as admin) approves the app for the workspace.
3. Backend exchanges `code` for `access_token` and `refresh_token`.
4. Encrypt and store tokens (Supabase table or KMS-backed secret store). Record expiry and auto-refresh.
5. All server-to-server Intercom calls use this token.

Token endpoints and exact params are in Intercom OAuth docs; use standard Authorization Code flow with refresh.

### Identity verification (Messenger)

- Enable identity verification in Intercom. Retrieve the identity secret.
- Compute `user_hash = HMAC-SHA256(identity_secret, user_id)` on the server and pass to the Messenger boot config in both apps.
- Use the same stable `user_id`/`external_id` for the customer in both Portal (if customer UI exists) and Status Hub so it maps to the same Intercom contact.

```51:55:documentation/intercom/api docs/api.intercom.io.json
"identity_verification": false,
```

### Webhooks

- Create webhook subscriptions (in Intercom UI) for:
  - conversation.created, conversation.updated, conversation.part.created
  - contact.created, contact.updated
  - ticket.created, ticket.updated (if using Tickets)
- Verify webhook signatures via `X-Hub-Signature` using your App `client_secret` (`INTERCOM_DEV_CLIENT_SECRET`).
- Persist all webhook payloads (raw + normalized) into Supabase.

### Fin (AI) enablement

- Enable Fin in your workspace.
- Knowledge sources:
  - Intercom Help Center articles
  - External content pages via API; mark content as usable by AI Agent.

```24241:24246:documentation/intercom/api docs/api.intercom.io.json
"ai_agent_availability": {
  "type": "boolean",
  "description": "Whether the external page should be used to answer questions by AI Agent.",
```

### Messenger setup (next step after OAuth)

- Add Intercom Messenger to Status Hub with identity verification.
- Ensure the same contact appears in Inbox by matching `user_id`/`external_id` and `user_hash`.

### Next actions

1. Populate the env vars listed above for dev.
2. In Intercom, confirm app is installed to your workspace; enable identity verification and Fin.
3. Run OAuth once via the Portal backend to capture and store tokens.
4. Enable webhooks; plan to verify with `X-Hub-Signature` using your App client_secret.
5. Proceed to Messenger wiring in Status Hub, then webhook ingestion service.
