# Shipper Chat — API Specification

## Overview

This document describes the public and internal HTTP + WebSocket APIs used by the Shipper Chat application. The project uses Next.js for the frontend, Node/Next API routes for REST, and a realtime socket layer (see `lib/socket.ts`). Persistent storage is via Prisma (see `prisma/schema.prisma`).

Base API paths
- REST: `/api/*`
- WebSocket/Realtime: `/socket` (Socket.io or WebSocket endpoint)

Authentication
- OAuth (Google) for user sign-in; server issues a session cookie or JWT for authenticated requests.
- All protected endpoints require a valid session cookie or `Authorization: Bearer <token>` header.

## Models

- User
	- `id` (string)
	- `name` (string)
	- `email` (string)
	- `avatarUrl` (string | null)

- ChatRoom
	- `id` (string)
	- `name` (string)
	- `isPrivate` (boolean)
	- `members` (User[])

- Message
	- `id` (string)
	- `roomId` (string)
	- `senderId` (string)
	- `text` (string)
	- `createdAt` (ISO timestamp)

## REST Endpoints

Auth
- `GET /api/auth/login` — redirects to OAuth provider.
- `GET /api/auth/callback` — OAuth callback; creates/updates user and issues session.
- `POST /api/auth/logout` — invalidates session.

Users
- `GET /api/users` — list users (minimal info). Query params: `?q=` to search. Auth required.
- `GET /api/users/:id` — get user profile (public fields). Auth optional.

Chats
- `GET /api/chats` — list chat rooms the user is a member of. Auth required.
- `POST /api/chats` — create a new chat room. Body: `{ name, isPrivate, memberIds[] }`. Auth required.
- `GET /api/chats/:id/messages` — page messages. Query: `?limit=&cursor=`. Auth & membership required.
- `POST /api/chats/:id/messages` — send a message (persist + broadcast via WS). Body: `{ text }`. Auth & membership required.

Presence and typing
- `GET /api/presence/:userId` — query last-seen or presence state. Usually provided via websocket presence events.

Errors
- Standard JSON error envelope: `{ "error": { "code": <string>, "message": <string>, "details"?: {} } }`.

## WebSocket / Realtime API

Endpoint: `/socket` (uses Socket.io or ws)

Events (client -> server)
- `authenticate` — payload: `{ token }` or uses session cookie on connect.
- `join_room` — `{ roomId }` — join a room (server will add socket to room channel).
- `leave_room` — `{ roomId }`.
- `message` — `{ roomId, text }` — sends a message; server persists and broadcasts.
- `typing` — `{ roomId, isTyping }` — ephemeral typing indicator.

Events (server -> client)
- `connected` — initial ack after auth.
- `joined_room` — `{ roomId, members }` — confirmation.
- `message` — `{ id, roomId, senderId, text, createdAt }` — new message broadcast.
- `presence` — `{ userId, status }` — online/offline/idle.
- `typing` — `{ userId, roomId, isTyping }`.

Scaling notes
- For multi-server deployments use a broker (Redis pub/sub) to forward WS events between instances.
- Persist messages in Postgres via Prisma; use indexes on `(roomId, createdAt)` for efficient paging.

## Example request & response

POST /api/chats/room-123/messages
Request body:

```
{ "text": "Hello team" }
```

200 OK (broadcast + persisted):

```
{
	"id": "msg_abc123",
	"roomId": "room-123",
	"senderId": "user_1",
	"text": "Hello team",
	"createdAt": "2026-04-03T12:34:56.789Z"
}
```

## Security considerations
- Validate and rate-limit message creation endpoints to avoid spam.
- Sanitize or escape message content where rendered to prevent XSS.
- Use TLS in transit and secure cookies (HttpOnly, Secure, SameSite).

## Versioning
- Start without explicit versioning (`/api/*`). Add `v1` prefix when introducing breaking changes: `/api/v1/...`.
