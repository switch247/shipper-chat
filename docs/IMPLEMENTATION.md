# Chat Application Implementation Guide

## Overview

This is a production-grade chat MVP built with Next.js 15, React 19, TypeScript, and Tailwind CSS. The application features a three-panel chat interface with real-time message simulation using mock data and API service layers.

## Architecture

### Design System
- **Primary Color**: Teal (#1DB584 - `oklch(0.527 0.209 178.8)`)
- **Layout**: Responsive three-panel (Sidebar 320px | Chat Area flex | Contact Info 320px collapsible)
- **Typography**: Geist font family with semantic sizing
- **Theme**: Light mode default with dark mode support via next-themes

### Core Technologies
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript with strict mode
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **State Management**: Zustand
- **Styling**: Tailwind CSS 4.2 with OKLCH color system
- **Storage**: Mock API layer (ready for backend integration)

## Project Structure

```
app/
├── chat/
│   ├── layout.tsx        # Chat layout wrapper
│   └── page.tsx          # Main chat interface (all components integrated)
├── page.tsx              # Root page (redirects to /chat)
├── layout.tsx            # Root layout with theme provider
└── globals.css           # Global styles and design tokens

components/
├── chat/
│   ├── ChatSidebar.tsx           # User list and search
│   ├── UserListItem.tsx          # Individual chat item component
│   ├── ChatHeader.tsx            # Header with user info and actions
│   ├── MessageList.tsx           # Message container
│   ├── MessageBubble.tsx         # Individual message with timestamp/read status
│   ├── ChatInput.tsx             # Message input and send button
│   ├── ContactInfoPanel.tsx      # Collapsible contact details panel
│   ├── ChatContextMenu.tsx       # Dropdown menu for chat actions
│   └── NewMessageModal.tsx       # User search and selection modal
└── ui/                           # shadcn/ui components (pre-installed)

lib/
├── types.ts              # TypeScript interfaces (User, Message, ChatSession, ContactInfo)
├── store.ts              # Zustand store for global state
├── api/
│   └── chat.ts           # Mock API service layer with TODO comments
└── mocks/
    └── data.ts           # Sample users, messages, media, links, docs

hooks/
├── use-mobile.ts         # (shadcn utility)
└── use-toast.ts          # (shadcn utility)

lib/utils.ts              # Utility functions (cn, etc.)
```

## Key Features

### 1. **Three-Panel Chat Interface**
- Left Sidebar: User list with search, unread badges, online status
- Center: Selected chat with message history
- Right: Contact info panel (collapsible) showing media gallery, links, docs

### 2. **Message System**
- Sent/received message bubbles with proper alignment
- Timestamps with relative time (e.g., "3 mins ago")
- Read indicators (single/double checkmark)
- Mock message threading with proper formatting

### 3. **User Management**
- 7 mock users with avatars and online status
- Real-time online/offline indicators (teal dot)
- Unread message badges on user items
- Current user differentiation

### 4. **Contact Info Panel**
- User profile with avatar, name, email
- Audio/Video call buttons
- Media gallery (8 sample images in grid layout)
- Links section with website URLs
- Docs section with file list

### 5. **Interactions**
- New Message modal with user search
- Chat context menu (Archive, Mute, Delete, etc.)
- Search within messages
- Responsive layout (contact panel collapses on mobile)

## State Management with Zustand

The `lib/store.ts` provides a centralized store with:

```typescript
// Store structure
{
  currentUser: User
  selectedChatId: string | null
  chatSessions: ChatSession[]
  onlineUsers: Set<string>
  messages: Record<string, Message[]>
  showContactPanel: boolean
  isLoading: boolean
  
  // Actions
  setSelectedChat()
  addMessage()
  toggleContactPanel()
  markUserOnline()
  // ... and more
}
```

Access the store in any component with:
```typescript
const store = useChatStore();
```

## Mock API Layer (`lib/api/chat.ts`)

All API functions are mocked with TODO comments for easy backend integration:

```typescript
// Examples with TODO comments for backend URLs
getChatSessions()          // TODO: GET /api/chats
sendMessage()              // TODO: POST /api/messages
getContactInfoForUser()    // TODO: GET /api/users/:userId/contact-info
archiveChat()              // TODO: PATCH /api/chats/:chatId/archive
deleteChat()               // TODO: DELETE /api/chats/:chatId
// ... etc
```

Each function includes a 300ms simulated network delay for realistic UX testing.

## Design Tokens

Custom CSS variables for consistent theming:

```css
/* Chat-specific colors */
--chat-sent-bg: oklch(0.527 0.209 178.8)        /* Teal */
--chat-sent-text: oklch(1 0 0)                  /* White */
--chat-received-bg: oklch(0.95 0 0)             /* Light gray */
--chat-received-text: oklch(0.145 0 0)          /* Dark gray */
--chat-bubble-radius: 1rem
--chat-time-color: oklch(0.556 0 0)             /* Muted gray */
--online-status: oklch(0.527 0.209 178.8)       /* Teal */
```

## Migration Guide: Backend Integration

### 1. Replace Mock API Calls

In `lib/api/chat.ts`, replace functions with real API calls:

```typescript
// Before (mock)
export async function getChatSessions(): Promise<ChatSession[]> {
  await delay(DELAY);
  return MOCK_USERS.map((_, index) => createChatSession(...));
}

// After (real API)
export async function getChatSessions(): Promise<ChatSession[]> {
  const response = await fetch('/api/chats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json();
}
```

### 2. Add WebSocket Connection

Create a `lib/websocket.ts` for real-time updates:

```typescript
export function connectWebSocket(userId: string) {
  const ws = new WebSocket(`wss://api.example.com/ws?userId=${userId}`);
  
  ws.onmessage = (event) => {
    const { type, data } = JSON.parse(event.data);
    
    if (type === 'NEW_MESSAGE') {
      store.addMessage(data.chatId, data.message);
    }
    if (type === 'USER_STATUS_CHANGED') {
      if (data.online) {
        store.markUserOnline(data.userId);
      } else {
        store.markUserOffline(data.userId);
      }
    }
  };
  
  return ws;
}
```

### 3. Update Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_WS_URL=wss://api.example.com
```

### 4. Update Main Chat Page

In `app/chat/page.tsx`, integrate WebSocket:

```typescript
useEffect(() => {
  const ws = connectWebSocket(CURRENT_USER.id);
  return () => ws.close();
}, []);
```

## Component Hierarchy

```
app/chat/page.tsx (Main Page)
├── ChatSidebar
│   └── UserListItem (repeated)
├── div (Chat Area)
│   ├── ChatHeader
│   ├── MessageList
│   │   └── MessageBubble (repeated)
│   └── ChatInput
├── ContactInfoPanel (conditionally rendered)
└── NewMessageModal
```

## Styling Guidelines

### Colors
- **Primary Actions**: `bg-[var(--primary)]` (teal)
- **Sent Messages**: `bg-[var(--chat-sent-bg)]`
- **Received Messages**: `bg-[var(--chat-received-bg)]`
- **Backgrounds**: `bg-background`
- **Text**: `text-foreground`
- **Muted**: `text-muted-foreground`

### Layout
- **Sidebar**: `w-80` (320px fixed)
- **Contact Panel**: `w-80` (320px fixed)
- **Chat Area**: `flex-1` (takes remaining space)
- **Responsive**: Contact panel hides on mobile (`hidden md:block`)

## Performance Optimizations

1. **Component Splitting**: Each feature is isolated (MessageBubble, UserListItem, etc.)
2. **Memoization**: useMemo for filtered lists and search results
3. **Lazy Loading**: ContactInfoPanel loads data on-demand
4. **Image Optimization**: Next.js Image component with proper sizing
5. **State Isolation**: Zustand prevents unnecessary re-renders

## Accessibility

- Semantic HTML (buttons for clickable items)
- ARIA labels for icons
- Keyboard navigation support (Enter to send messages)
- Screen reader support with sr-only class
- Proper heading hierarchy
- Color contrast compliance (WCAG AA)

## Testing the Application

1. **Start Dev Server**: `npm run dev`
2. **Access**: Open http://localhost:3000 (redirects to /chat)
3. **Select User**: Click any user in the sidebar to view their chat
4. **Send Message**: Type in the input and press Enter or click send
5. **New Message**: Click "New Message" button to start a new chat
6. **Contact Info**: Click user header or menu to view contact details
7. **Context Menu**: Right-click or use menu button for chat actions

## Future Enhancements

- [ ] Real WebSocket integration
- [ ] User authentication (Supabase, Auth.js)
- [ ] Database persistence (Neon, Supabase)
- [ ] Message search and filtering
- [ ] Voice/video call integration
- [ ] File upload and sharing
- [ ] Typing indicators
- [ ] Message reactions/emojis
- [ ] Chat groups/channels
- [ ] Message encryption
- [ ] Push notifications
- [ ] Mobile app (React Native)

## Dependencies

Key packages used:

- **next**: 16.2.0 - React framework
- **react**: 19.2.4 - UI library
- **zustand**: 4.4.7 - State management
- **@radix-ui/\***: UI primitives (dialogs, dropdowns, etc.)
- **lucide-react**: 0.564.0 - Icons
- **tailwindcss**: 4.2.0 - Styling
- **next-themes**: 0.4.6 - Theme management

## Support & Questions

For issues or questions:
1. Check the implementation structure above
2. Review the TODO comments in `lib/api/chat.ts`
3. Examine the component props in each file
4. Reference the design tokens in `app/globals.css`

---

**Built with v0** - A production-ready chat application ready for backend integration.
