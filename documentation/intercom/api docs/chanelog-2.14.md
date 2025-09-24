# Changelog (v2.14)

For changes that have been updated across all versions, see the [Unversioned changes](/docs/build-an-integration/learn-more/rest-apis/unversioned-changes) page.

There are [breaking changes](/docs/build-an-integration/learn-more/rest-apis/api-changelog#about-breaking-changes-in-the-intercom-api) in this version, which are detailed below.

## Breaking Changes

### Admin Assignment Limit Change Activity Logs

We now have two separate activity types to show changes to ticket and conversation assignment limits: `admin_conversation_assignment_limit_change` and `admin_ticket_assignment_limit_change`. Similarly, metadata will show `ticket_assignment_limit` and `conversation_assignment_limit` instead of `assignment_limit`.

### Ticket Update API Changes

The ticket update endpoint (`PUT /tickets/{id}`) has been restructured to support workflow execution and explicit admin attribution. This is a **breaking change** that affects how you specify the admin performing the update and assign tickets.

**Key Changes:**

- **New `admin_id` field:** You can now specify which admin is performing the ticket update using the top-level `admin_id` field. This enables proper workflow execution and attribution of actions to specific admins.
- **New `assignee_id` field:** Direct assignment of tickets is now done via the top-level `assignee_id` field instead of nested within an `assignment` object.
- **Deprecated `assignment` object:** The previous method of assigning tickets using the nested `assignment: { admin_id, assignee_id }` structure is no longer supported in v2.14.

**Migration Guide:**

Previous format (v2.13 and earlier):

```json
{
  "ticket_attributes": { ... },
  "assignment": {
    "admin_id": "123",
    "assignee_id": "456"
  }
}
```

New format (v2.14):

```json
{
  "ticket_attributes": { ... },
  "admin_id": 123,
  "assignee_id": "456"
}
```

**Important Notes:**

- The `admin_id` field must be an integer and refers to the admin performing the update (not necessarily the assignee)
- The `assignee_id` field is a string and refers to the admin or team being assigned to the ticket
- If `admin_id` is not provided, the system will use the Operator (Fin) as the default admin
- The admin specified in `admin_id` must exist and have access to the workspace, otherwise a 404 error will be returned

## New API Endpoints

### Calls API

Weâ€™ve added a new Calls API to retrieve calls and related assets (recordings and transcripts).

**New Endpoints:**

- `GET /calls` â€“ List all calls with page-based pagination (`page`, `per_page`, default 25, max 25)
- `GET /calls/{id}` â€“ Retrieve a call by id
- `GET /calls/{id}/recording` â€“ Redirects (302) to a signed URL for the callâ€™s recording (returns 404 if not available)
- `GET /calls/{id}/transcript` â€“ Returns the call transcript; if none exists, returns `[{}]`; returns 404 if the call does not exist
- `POST /calls/search` - Returns calls for the specified `conversation_ids` (max 20), including transcript and transcript_status when available

**Notes:**

- Responses and pagination envelopes are consistent with other list endpoints in the API.
- Recording endpoints may return a 302 redirect via the `Location` header.

For complete documentation and more examples, see the [Calls API Reference](https://developers.intercom.com/docs/references/rest-api/api.intercom.io/calls/).

### Away Status Reasons API

Custom away status reasons per workspace can be fetched using the [Away Status Reasons API](https://developers.intercom.com/docs/references/rest-api/api.intercom.io/away-staus-reasons/).

### Custom Channel Events API

You can now integrate your own platform as a custom Intercom channel, by notifying Intercom of events that happen in it (like a user opening a conversation in your platform, or sending a message through your platform).

Closed Beta
These API endpoints are part of the **closed Beta** for "Fin over API", towards allowing Fin to work everywhere.

### Internal Articles API

A new Internal Articles API has been added to manage your internal knowledge base content. This enables teams to automate content management workflows and integrate internal documentation with external systems.

**New Endpoints:**

- `GET /internal_articles` - List all internal articles with pagination support
- `POST /internal_articles` - Create a new internal article
- `GET /internal_articles/{id}` - Retrieve a specific internal article by ID
- `PUT /internal_articles/{id}` - Update an existing internal article
- `DELETE /internal_articles/{id}` - Delete an internal article
- `GET /internal_articles/search` - Search for internal articles based on query parameters

**Request Example:**

```json
POST /internal_articles
{
  "title": "How to handle refunds",
  "body": "Step-by-step guide for processing customer refunds...",
  "owner_id": 123456,
  "author_id": 123456,
  "locale": "en"
}
```

### News Items: Published Date Support

The News Items API now supports specifying a `published_at` date when creating or updating news items. This allows you to set custom publish dates for news items, particularly useful when importing existing content or maintaining historical accuracy.

**Key Changes:**

- Added `published_at` field to news item responses, showing when the news item was published
- Added `published_at` field to newsfeed assignments in both requests and responses
- The `published_at` field accepts Unix timestamps (in seconds)
- Publish dates must be in the past - future dates are not allowed as scheduling is not supported via the API

**Request Example:**

```json
POST /news/news_items
{
  "title": "Product Update",
  "body": "New features released",
  "sender_id": "123",
  "newsfeed_assignments": [
    {
      "newsfeed_id": 53,
      "published_at": 1664638214
    }
  ]
}
```

**Response includes:**

- `published_at` field at the news item level showing the overall publish date
- `published_at` field within each newsfeed assignment showing when it was published to that specific newsfeed

### Reporting Data Export API

A new Reporting Data Export API has been added to programmatically export reporting datasets. This enables you to download your reporting data for analysis in external tools or data warehouses.

**New Endpoints:**

- `POST /export/reporting_data/enqueue` - Enqueue a new reporting data export job
- `GET /export/reporting_data/{job_identifier}` - Check the status of an export job
- `GET /export/reporting_data/get_datasets` - List available datasets and their attributes

**Key Features:**

- Export reporting datasets with customizable attribute selection
- Specify time ranges for data extraction using Unix timestamps
- Support for multiple dataset types (conversation, admin_status_change, conversation_state, etc.)
- Concurrent job limit of 5 pending exports per workspace
- Exported data is delivered as compressed files (.tgz format)

**Example Export Request:**

```json
POST /export/reporting_data/enqueue
{
  "dataset_id": "conversation",
  "attribute_ids": [
    "conversation_id",
    "conversation_started_at"
  ],
  "start_time": 1717490000,
  "end_time": 1717510000
}
```

**Response:**

```json
{
  "job_identifier": "job1",
  "status": "pending",
  "download_url": "",
  "download_expires_at": ""
}
```

**Notes:**

- Jobs are processed asynchronously - poll the status endpoint to check completion
- Download URLs are temporary and expire after a set period
- The API respects rate limits to ensure system stability

### Job Status API

A new endpoint `/jobs/status/{id}` allows you to check the status of asynchronous API operations:

```
GET /jobs/status/{id}
```

Returns job execution details including:

- Current status (pending, in_progress, success, failed)
- Resource type and ID when completed
- Direct URL to the created resource

This enables monitoring of background jobs initiated through async endpoints like `/tickets/enqueue`.

## Backwards Compatible Changes

### Send Quick Replies

Quick replies represent admin defined values that an end-user can select, most often represented in the UI as clickable buttons that display below a message. In the [Reply to a conversation endpoint](https://developers.intercom.com/docs/references/rest-api/api.intercom.io/conversations/replyconversation), admins can define and send a choice of quick reply options, and end-users can choose their reply and their response can be sent using the API.

The historical reply option choices can be viewed for a conversation part in the metadata of the conversation part.

For example, this is what the quick reply options look like in a `quick_reply` part type from a bot.

```
{
  "metadata": {
    "quick_reply_options": [
      {
        "uuid": "1448547007",
        "text": "oui",
        "translations": {
          "en": "yes",
          "fr": "oui"
        }
      },
      {
        "uuid": "1448547008",
        "text": "non",
        "translations": {
          "en": "no",
          "fr": "non"
        }
      }
    ]
  }
}
```

Once the contact replies, the metadata on the conversation part will capture their choice and display it like this:

```
metadata: { quick_reply_option_uuid: '1448547007' }
```

### New Webhook Topic: conversation.operator.replied

We've added a new webhook topic `conversation.operator.replied` that triggers when Fin or a bot replies to a conversation. This webhook enables real-time notifications for automated operator responses, helping you track and respond to bot interactions in your conversations.

**Event Details:**

- **Topic Name:** `conversation.operator.replied`
- **Description:** Triggered when Fin/Bot replies to a conversation
- **Required Scope:** Read conversations
- **Payload:** Contains the conversation part created by the operator reply

### Conversation Translations

Added a new optional `include_translations` query parameter to the conversation retrieval endpoint (`GET /conversations/{id}`). When set to `true`, conversation parts will be translated to the detected language of the conversation, enabling multi-language support for conversation content.

### AI Agent Rating Timestamps

Added `created_at` and `updated_at` fields to the AI Agent rating information within conversation responses. These timestamps provide visibility into when customers rated their AI Agent interactions and when those ratings were last modified.

### Conversation Rating Timestamps

Added `updated_at` field to the conversation rating information within conversation responses. This timestamp provides visibility into when teammate conversation ratings were last modified.

### AI agent and AI answer attributes available in author

Within the author object of a conversation part we have added two new fields: `is_ai_answer` and `from_ai_agent`.

Use `from_ai_agent` to understand if the bot reply was sent from the AI agent, rather than from a workflow operator or other type of bot.

Use `is_ai_answer` to understand if the reply represented in the conversation part was generated by the AI agent.

### Ticket Part Attribute Updates

Added `updated_attribute_data` field to ticket part responses to track attribute changes within tickets.

### Multiple recipients supported when creating message

The create message endpooint now supports multiple users in the `to` and `cc` field in the form of an array of recipient objects.

Similarly the `bcc` field has been added.

```
{
  "from": {
    "type": "admin",
    "id": "991267816"
  },
  "to": [
    {
      "type": "user",
      "id": "6762f2391bb69f9f2193bc19"
    },
    {
      "type": "lead",
      "id": "6762f23c1bb69f9f2193bc1b"
    },
    {
      "type": "user",
      "id": "6762f23d1bb69f9f2193bc1c"
    }
  ],
  "cc": [
    {
      "type": "user",
      "id": "6762f23e1bb69f9f2193bc1d"
    },
    {
      "type": "user",
      "id": "6762f23f1bb69f9f2193bc1e"
    }
  ],
  "bcc": [
    {
      "type": "user",
      "id": "6762f23e1bb69f9f2193bc2f"
    }
  ],
  "message_type": "conversation",
  "body": "heyy"
}
```

### Ticket Assignment on Creation

The [Create a ticket](https://developers.intercom.com/docs/references/rest-api/api.intercom.io/tickets/createticket) endpoint now supports immediate assignment when creating tickets. You can specify assignees in the `assignment` object:

```json
{
  "assignment": {
    "admin_assignee_id": "123",
    "team_assignee_id": "8"
  }
}
```

- `admin_assignee_id`: The ID of the admin to assign the ticket to
- `team_assignee_id`: The ID of the team to assign the ticket to

Both fields are optional. If not provided, the ticket will be created unassigned.

### Asynchronous Ticket Creation

A new endpoint `/tickets/enqueue` has been added for asynchronous ticket creation. This endpoint:

- Validates input parameters before enqueuing the job
- Returns a job ID immediately for tracking
- Processes ticket creation asynchronously for better performance with large volumes

```json
POST /tickets/enqueue
{
  "ticket_type_id": "88",
  "contacts": [{"id": "123"}],
  "ticket_attributes": {...}
}
```

Response includes a job object with:

- `id`: Job identifier for status tracking
- `status`: Current job status (pending, in_progress, success, failed)
- `url`: URL to check job status at `/jobs/status/{id}`
- `resource_type`: "ticket"
- `resource_id`: Created ticket ID (when successful)
- `resource_url`: URL to retrieve the created ticket (when successful)

### New Webhook Topic: job.completed

A new webhook topic `job.completed` has been added that triggers when an asynchronous API job completes. This allows real-time notifications when background operations finish processing.

### Company Association for Conversations

The [Update a conversation](https://developers.intercom.com/docs/references/rest-api/api.intercom.io/conversations/updateconversation) endpoint now supports associating conversations with companies using the `company_id` field:

```json
PUT /conversations/{id}
{
  "company_id": "5f4d3c1c-7b1b-4d7d-a97e-6095715c6632"
}
```

- Set `company_id` to associate the conversation with a company
- Set to `null` to remove the company association
- The company must exist and be accessible within the workspace
