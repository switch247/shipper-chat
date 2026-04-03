## Shipper Chat — Design Document

### Purpose

This document captures the high-level architecture, main components, data flow, and operational considerations for the Shipper Chat application.

### High-level architecture

- Frontend: Next.js (app router). UI components live in `client/components/*` and UI primitives in `client/components/ui/*`.
- Backend: Next.js API routes and a Node-based realtime socket layer (see `server/` and `lib/socket.ts`).
- Database: Postgres (accessed via Prisma ORM).
- Auth: Google OAuth (see `client/components/auth/GoogleAuthProvider.tsx` and `client/app/auth/*`).

### Key components

- UI
	- `ChatInput`, `MessageList`, `MessageBubble` — core chat widgets.
	- `LeftNavbar`, `TopNavbar` — app navigation and user presence.

- Hooks & State
	- `use-presence` — presence management.
	- `use-auth` — exposes current user and session state.

- Realtime layer
	- `lib/socket.ts` — central socket client/abstraction.
	- Socket events: `message`, `typing`, `presence`, `join_room`.

- Data layer
	- Prisma models: `User`, `ChatRoom`, `Message`.
	- API routes under `server` and `client/app/api` provide CRUD and pagination.

### Message flow (simplified)

1. User composes text in `ChatInput` and sends.
2. Frontend calls `POST /api/chats/:id/messages` (optimistic UI can add the message locally).
3. Server validates, persists message via Prisma, returns saved message.
4. Server broadcasts the message over sockets to room members.
5. Clients receive `message` event and append to `MessageList`.

Alternative (socket-first): client emits `message` over socket; server persists then broadcasts back (choice depends on latency and ordering requirements).

### Data model decisions

- Messages are append-only and immutable once created.
- Use cursor-based pagination for message history (fast tail and older pages).
- Store minimal user profile with each message (or resolve via join on read) to avoid denormalization pitfalls.

### Presence & typing

- Presence is delivered via socket connections and stored as ephemeral state (last-seen timestamp persisted optionally).
- Typing indicators are transient socket messages with short TTL on the client.

### Scaling & operations

- Use Redis pub/sub for socket message propagation across multiple instances.
- Horizontal scale strategy:
	- Stateless Next.js servers behind a load balancer.
	- Socket cluster horizontally scaled with sticky sessions or with a separate socket gateway and Redis adapter.
	- Postgres for persistence; consider read-replicas for heavy read traffic.

### Security

- Enforce authentication at API and socket connect time.
- Validate and sanitize message content.
- Use rate limiting on message endpoints and socket emits.

### Observability

- Log important events (connect/disconnect, join_room, message persisted).
- Instrument message latency (send → persisted → broadcast) for SLOs.

### Deploy & Environment

- Required env vars:
	- `DATABASE_URL` (Postgres)
	- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
	- `SESSION_SECRET`
	- `REDIS_URL` (optional, for scaling sockets)

- Recommended commands for local dev:

```
pnpm install
pnpm prisma:migrate dev
pnpm dev
```

### Open questions / next steps

- Decide on socket implementation: Socket.io vs native WebSocket.
- Message retention policy and soft-delete strategy.
- Whether to store denormalized user snapshots on messages for faster reads.

