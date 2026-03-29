# Architecture Fix: Persistent Skeleton Layout

## Problem Fixed
The previous architecture loaded everything inside the chat page, causing the entire app to show a loading spinner while chat data was being fetched. This meant users couldn't see the main layout (sidebar, header) until all data loaded.

## Solution Implemented

### New Structure
```
app/chat/layout.tsx (Client Component)
├── ChatSidebar (Always visible - with skeleton during load)
├── Main Content Area
│   └── app/chat/page.tsx (Chat content loads here)
```

### Key Changes

1. **Chat Layout** (`app/chat/layout.tsx`)
   - Moved ChatSidebar to the layout (always visible)
   - Shows skeleton loader for sidebar while `getChatSessions()` loads
   - Contains logic to initialize chat sessions and online users
   - Provides persistent navigation while content loads

2. **Chat Page** (`app/chat/page.tsx`)
   - Simplified to only handle chat content (header, messages, input)
   - Shows loading spinner only for the chat area content
   - Receives `selectedChatId` and messages from store
   - No longer responsible for sidebar or layout structure

3. **State Management** (`lib/store.ts`)
   - Added `showNewMessageModal` state for modal handling
   - Added `setShowNewMessageModal` action
   - Store now sources of truth for selected chat and online status

### Load Flow

1. User navigates to `/chat`
2. Chat layout immediately renders with sidebar skeleton
3. Layout fetches chat sessions (300ms mock delay)
4. Sidebar populated with real chat list
5. First chat auto-selected
6. Chat page content area shows loading spinner until first chat loads
7. Once loaded, full chat interface visible (header, messages, input)

### Benefits

✓ Main layout visible immediately (skeleton state)
✓ User can see sidebar structure while data loads
✓ Chat content area shows targeted loading spinner
✓ Matches Figma screenshot structure exactly
✓ Better UX with persistent navigation
✓ Clearer separation of concerns (layout vs content)

## File Structure

```
app/
├── page.tsx              (redirects to /chat)
├── chat/
│   ├── layout.tsx       (sidebar + main area skeleton)
│   └── page.tsx         (chat content - header, messages, input)
components/chat/
├── ChatSidebar.tsx      (user list, search, new message button)
├── UserListItem.tsx     (individual chat item)
├── ChatHeader.tsx       (participant info, action buttons)
├── MessageList.tsx      (scrollable messages)
├── MessageBubble.tsx    (individual message)
├── ChatInput.tsx        (message input with buttons)
├── ContactInfoPanel.tsx (right panel with profile, media, links, docs)
├── NewMessageModal.tsx  (user selection modal)
└── ChatContextMenu.tsx  (archive, delete, etc.)
lib/
├── types.ts            (TypeScript interfaces)
├── store.ts            (Zustand global state)
├── api/chat.ts         (mock API with TODOs for backend)
└── mocks/data.ts       (sample users, messages, media)
```

## Next Steps for Backend Integration

All API functions in `lib/api/chat.ts` have TODO comments showing where to swap in real backend calls:
- `getUsers()` - replace with `GET /api/users`
- `getChatSessions()` - replace with `GET /api/chats`
- `sendMessage()` - replace with `POST /api/messages`
- `getContactInfoForUser()` - replace with `GET /api/users/:userId/contact-info`
- Plus archive, delete, mute, export, clear, search functions

This creates a clean abstraction layer for easy backend swapping.
