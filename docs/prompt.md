Here's the **updated, refined frontend prompt** tailored to your new requirements:

```prompt
You are an expert senior frontend engineer. Build a pixel-perfect, production-grade frontend for a chat MVP using Next.js 15 (App Router) + TypeScript.

Figma link: https://www.figma.com/design/DbiZ2quclHjjtsfCcw09AH/Test-File?node-id=0-1&t=Wlx1JosmfEIKFBpb-0
Focus especially on frames around node-id 0-1833 and the main chat interface.

### Strict Requirements

**Tech Stack**
- Next.js 15 App Router with TypeScript (strict mode, no `any`)
- Tailwind CSS v3.4+
- shadcn/ui + Radix UI primitives (use them heavily for consistency)
- Lucide React for icons
- TanStack Query v5 for data fetching & caching
- Zustand for global state (online users, current chat, etc.)
- Native WebSocket (or socket.io-client) for real-time

**Code Quality & Architecture Rules (Strict)**
- Write clean, maintainable, readable code. Follow SOLID principles where applicable.
- Heavy reuse: Create reusable components for UserListItem, MessageBubble, ChatInput, AvatarWithStatus, etc.
- Central styling system:
  - Define a single source of truth for the design system in `lib/design-system.ts` or `styles/globals.css` + Tailwind config.
  - Extract and hard-code the exact color palette from Figma (primary, background, sidebar, chat area, message bubbles, accents, online status green, text colors, etc.).
  - Define reusable font styles: Create constants or Tailwind classes for headings, body text, captions with exact font weights, sizes, and line heights from Figma.
  - All colors, spacing, border-radius, shadows must come from central design tokens — no random Tailwind values scattered around.
- Folder structure must be clean:
  ```
  app/
    (auth)/
    chat/
      page.tsx
  components/
    ui/           ← shadcn components
    chat/         ← ChatSidebar, MessageList, ChatHeader, ChatInput, etc.
    layout/
  lib/
    api/          ← mock pi layer services
    design-system.ts
    utils.ts
    websocket.ts
  hooks/
  types/
  mocks/
  ```
- All components must be well-typed, properly commented, and use proper React patterns (memo, callback, etc. where performance matters).
- No prop drilling hell — use Zustand or context wisely.
- Error boundaries, loading skeletons, and good empty states required.

**UI Matching Rules (1:1 from Figma)**
- The main focus is the **chat page** — match it pixel-perfect (layout, spacing, colors, hover states, active states, message bubble styles, timestamps, read indicators).
- Sidebar / user list, navbar, and any slide-in panels must match Figma colors, spacing, and behavior exactly.
- For other pages (login/signup): Use clean, modern placeholder designs that are conversion-focused. Make the Google OAuth button prominent and beautiful. Do not spend excessive time here — keep them simple but professional.
- Extract exact hex colors from Figma for:
  - Sidebar background
  - Main chat background
  - Message bubbles (sent vs received)
  - Text colors, accents, online indicator
  - Any hover/active states
- Typography: Match font family, sizes, weights, and line heights precisely. Centralize them.
- All interactions (hover on users, message sending, online dots) must feel exactly like Figma.

**Data Layer – Mock Pi Layer (Critical)**
- Create a clean `lib/api/` folder with service objects that look and feel like real backend calls.
- Example:
  ```ts
  export const chatApi = {
    getUsers: async (): Promise<User[]> => { /* mock + TODO: replace */ },
    getChatMessages: async (chatId: string): Promise<Message[]> => { /* mock */ },
    sendMessage: async (chatId: string, content: string): Promise<Message> => { /* mock + TODO */ },
    // etc.
  };
  ```
- Start with rich, realistic mock data so the app feels alive immediately.
- Add clear `// TODO: Replace with real fetch to Express backend` comments on every function.
- Make swapping the mock layer for real API calls (Express + Neon) as easy as possible later.

**Core Features (Priority on Chat)**
- Sidebar with searchable list of users (online/offline with status indicator).
- Clicking a user opens the chat in the main area.
- Real-time messaging simulation via WebSocket (mock incoming messages and online status changes initially).
- Message bubbles with proper alignment (mine on right, theirs on left), timestamps, and read status.
- Chat header showing selected user info.
- Clean message input at bottom.
- Use WebSocket for fast message delivery and online tracking (mock connection first).

**Auth Strategy**
- Use `@react-oauth/google` for "Sign in with Google".
- On success, send Google credential (ID token) to backend `/auth/google` endpoint.
- Expect JWT back (or httpOnly cookie). Use the JWT for all protected API calls and WebSocket authentication.
- Design a nice, conversion-focused auth page with prominent Google button + placeholder fallback login form.

**Additional Rules**
- Fully responsive where possible, but prioritize desktop chat experience as per Figma.
- Excellent loading, error, and empty states.
- Define clear TypeScript interfaces first (User, Message, ChatSession, etc.) in `types/index.ts`.
- Keep the code clean, modular, and easy to review/hand off.

Start by:
1. Defining the central design system (colors, typography tokens).
2. Creating core types and mock data.
3. Building the main chat layout with sidebar + chat area.
4. Implementing the mock API layer.
5. Adding WebSocket simulation.

After finishing, provide:
- A short "How to Replace Mocks" guide (how to swap api/ functions with real Express calls).
- Instructions for connecting real WebSocket.

Begin implementation now. Focus on clean code, maximum reuse, and perfect visual match to Figma on the chat page.
```

This prompt enforces:
- Strict code quality and reuse
- Centralized design system for colors/fonts
- Heavy focus on the chat page + navbar/sidebar/slide-ins
- Placeholder approach for non-important pages
- Clean architecture with easy-to-replace mock layer

Copy-paste this directly into your AI coding tool (Cursor/Claude/etc.).

Would you like me to also give you:
- The initial `design-system.ts` template?
- Core TypeScript types?
- Or the backend auth route snippet to match the frontend?

Just tell me what to prepare next so you can move fast.