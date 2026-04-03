# Shipper Chat – Figma → Code Migration Plan

## Executive Summary

The goal is a **pixel-perfect 1:1 match** of the Figma design (as seen in `demo/page.tsx`) applied to the real working app components, while preserving all existing functionality. We'll work with **mocked API data** initially so we can move fast on visual parity, then swap in real API calls at the end.

**v2 additions:** Logo dropdown, context menu dropdown, and `ContactInfoPanel` are now **in scope** and fully planned below.

---

## Design System Extracted from demo/page.tsx

Before touching any component, these are the exact tokens the Figma uses:

| Token | Value |
|---|---|
| **App background** | `#F3F3EE` (warm off-white) |
| **Card / panel background** | `#FFFFFF` |
| **Active chat bubble (sent)** | `#F0FDF4` (very light green) |
| **Received bubble** | `#FFFFFF` |
| **Primary brand color** | `#1E9A80` (teal/green) |
| **Primary text** | `#111625` / `#1C1C1C` |
| **Secondary text / timestamps** | `#8B8B8B` |
| **Online status color** | `#38C793` |
| **Border color** | `#E8E5DF` |
| **Selected list item bg** | `#F3F3EE` |
| **Font** | Inter (all weights) |
| **Corner radius – outer shell** | `rounded-3xl` (24px) |
| **Corner radius – panels** | `rounded-3xl` for large panels, `rounded-2xl` for cards |
| **Corner radius – bubbles** | `rounded-xl` (12px) |
| **Corner radius – buttons** | `rounded-lg` (8px) |
| **Corner radius – input** | `rounded-[100px]` (pill) |
| **Dropdown container** | `rounded-2xl border border-[#E8E5DF] bg-white` + subtle shadow |
| **Dropdown item** | `py-1.5 px-2 rounded-lg gap-2.5` |
| **Dropdown item active** | `bg-[#F3F3EE]` |
| **Dropdown item text** | `text-sm font-medium text-[#111625] tracking-[-0.006em]` |
| **Dropdown icon box** | `p-1.5 rounded-md bg-[#F3F3EE]` (logo menu) or plain 16px icon (context menu) |
| **Dropdown destructive** | `text-[#DF1C41]` (NOT `text-destructive`) |
| **Left sidebar width** | `~68px` icon-only |
| **Chat list panel width** | `w-[400px]` fixed |
| **Message area** | `flex-1` (fills remaining) |
| **ContactInfoPanel width** | slide-in panel, `w-80` from right, but styled to match Figma |

---

## Layout Architecture (Current vs. Target)

### Current Layout Structure
```
GlobalSidebar   ← w-20, full height, bg-input
GlobalTopBar    ← h-20, spans full width, bg-input
  chat/layout
    [chat list panel]   ← flex-1, bg-white, rounded-2xl
    [chat view]         ← flex-2, bg-background, rounded-2xl
```

### Target Layout (from Figma)
```
Root: bg-[#F3F3EE], overflow-hidden, full screen

Left Icon Nav (~68px wide, full height)
  Logo (teal circle, white SVG icon)
  Nav icons: Home, Chat (active), Explore, Files, Analytics
  Bottom: AI Sparkle icon + user avatar

Main area (flex-col)
  Top Bar (white card, rounded-2xl, py-3 px-6)
    Left: chat icon + "Message" text
    Center: search input 300px wide, w-8 h-8 bell + settings btns
    Right: divider | user avatar + chevron
  
  Content row (flex, gap-3, p-3)
    Chat List Panel (w-[400px], white, rounded-3xl, p-6)
      "All Message" title + "New Message" teal button
      Search input (h-10, rounded-[10px]) + Filter icon button
      UserListItem list (scrollable)
    
    Chat View (flex-1, white, rounded-3xl)
      Chat Header: avatar + name/online + [search, call, video, dots] btnss
      Message Area (bg-[#F3F3EE], rounded-2xl, p-3, flex-col justify-end)
        "Today" date pill (white, rounded-[60px], centered)
        Received bubbles (left-aligned, bg-white)
        Sent bubbles (right-aligned, bg-[#F0FDF4])
      Input Bar (pill shape border, inside: mic/emoji/send)
```

---

## File-by-File Change Plan

### 1. `components/layout/GlobalSidebar.tsx` — **Full Overhaul**

| What | Current | Target |
|---|---|---|
| Background | `bg-input` | transparent — sits in `bg-[#F3F3EE]` shell |
| Width | `w-20` (80px) | `w-fit py-6 px-4` (~68px) |
| Logo | Custom SVG plain button | Teal circle `bg-[#1E9A80] rounded-[915px]` + white package SVG from demo |
| Nav item active | `bg-primary text-primary-foreground` | `border border-[#1E9A80] bg-[#F0FDF4]` |
| Nav item size | `w-10 h-10` | `min-w-[44px] max-w-[44px] py-2 px-3 h-11` |
| Nav item inactive | `text-muted-foreground hover:bg-muted` | no bg, icon `fill-[#151515]` |
| Bottom section gap | `gap-4` | `gap-6` |
| Bottom AI icon | `Sparkles` Lucide | Use exact SVG from demo (star/sparkle path) |
| Avatar size | `w-12 h-12` | `w-11 h-11 rounded-[44px]` |

**SVG icons to copy from demo/page.tsx:**
- Logo icon: lines 10–31
- Home icon: lines 45–49
- Chat icon (active): lines 52–64
- Explore/compass icon: lines 66–79
- Files/folder icon: lines 81–95
- Analytics icon: lines 96–110
- AI sparkle icon: lines 114–127

---

### 2. `components/layout/GlobalTopBar.tsx` — **Full Overhaul**

| What | Current | Target |
|---|---|---|
| Outer bg | `bg-input h-20` | `bg-[#F3F3EE]` no fixed height |
| Inner card | `bg-white rounded-xl p-4` | `bg-white rounded-2xl py-3 px-6` |
| Search | `max-w-md` Lucide Search icon | `w-[300px] h-8 rounded-[10px] border border-[#E8E5DF]` with `⌘+K` badge inside |
| Bell button | `Button variant=ghost relative` | `w-8 h-8 rounded-lg border border-[#E8E5DF] bg-white` |
| Settings button | `Button variant=ghost` | same as bell |
| Divider | None | `<svg width="1" height="20">` vertical line `#E8E5DF` |
| User trigger | Ghost button w/ avatar | `flex items-center gap-2` → round `w-8 h-8` avatar + `ChevronDown` |

**Search bar inner structure (from demo lines 162–188):**
```
border container
  search icon (14px)
  "Search" placeholder text
  ⌘+K badge: py-[5px] px-1.5 rounded-md bg-[#F3F3EE]
```

---

### 3. `app/(authenticated)/chat/layout.tsx` — **Significant rework**

| What | Current | Target |
|---|---|---|
| Root container | `w-full h-full flex bg-input gap-3 p-4` | keep similar but adjust |
| Chat list panel width | `flex-1` | `w-[400px]` fixed, `shrink-0` |
| List panel padding | `p-4` | `p-6` |
| List panel radius | `rounded-2xl` | same (sits inside content area) |
| "All Messages" title | `text-lg font-semibold` | `text-xl font-semibold text-[#111625]` font-inter |
| "New Message" button | Generic `bg-primary` | `bg-[#1E9A80] rounded-lg h-8 px-3 gap-1.5` + pen+ SVG from demo line 279–293 |
| Search input | shadcn `<Input>` generic | `h-10 rounded-[10px] border border-[#E8E5DF]` + custom placeholder |
| Filter button | `<Button variant=outline size=icon>` | `w-10 h-10 rounded-[10px] border border-[#E8E5DF] bg-white` |
| Chat view wrapper | `flex-2 flex flex-col bg-background rounded-2xl` | `flex-1 flex flex-col min-w-0 bg-white rounded-3xl overflow-hidden` |

---

### 4. `components/chat/UserListItem.tsx` — **Styling update**

| What | Current | Target |
|---|---|---|
| Selected bg | `bg-input` | `bg-[#F3F3EE]` |
| Unselected hover | `hover:bg-gray-100` | `hover:bg-[#F8F8F5]` subtle |
| Container padding | `p-4` | `p-3` |
| Avatar size | `w-12 h-12` | `w-10 h-10` |
| Avatar shape | `rounded-full` | `rounded-[40px]` |
| Gap between avatar/text | `gap-4` | `gap-3` |
| Name style | `font-semibold text-sm` | `text-sm font-medium text-[#1C1C1C] tracking-[-0.006em] font-inter` |
| Timestamp | `text-xs text-muted-foreground` | `text-xs text-[#8B8B8B] font-inter` |
| Preview text | `text-xs text-muted-foreground` | `text-xs text-[#8B8B8B] font-inter line-clamp-1` |
| Read icon stroke | `text-[var(--chat-sent-bg)]` | `stroke-[#8B8B8B]` |
| Item radius | `rounded-2xl` | `rounded-xl` |

---

### 5. `components/chat/ChatHeader.tsx` — **Styling update**

| What | Current | Target |
|---|---|---|
| Container | `px-6 py-4 bg-background` | `pt-1 pr-3 pb-4 pl-3` (no bg, sits on white panel) |
| Avatar | `w-10 h-10 rounded-full` | `w-10 h-10 rounded-[1000px]` |
| Online status | `text-xs text-muted-foreground` | `text-xs font-medium text-[#38C793]` (GREEN!) |
| Name | `font-semibold text-foreground` | `text-sm font-medium text-[#111625] tracking-[-0.006em] font-inter` |
| Action buttons | `h-9 w-9 bg-gray-50` | `w-8 h-8 rounded-lg border border-[#E8E5DF] bg-white` |
| Action icon size | `w-5 h-5 text-foreground` | `w-4 h-4` (16px), stroke-[#262626] |
| Actions shown | Search, Phone, Video, MoreVertical | Search, Phone, Video, MoreVertical (same, different style) |

---

### 6. `components/chat/MessageList.tsx` — **Structural change**

| What | Current | Target |
|---|---|---|
| Area wrapper bg | inherits white from parent | `bg-[#F3F3EE] rounded-2xl p-3` |
| Flex direction | `flex-col` | `flex-col justify-end` (messages anchor to bottom) |
| Date separator | None | `"Today"` pill: `py-1 px-3 rounded-[60px] bg-white text-sm font-medium text-[#596881]`, centered self |
| Overflow | `overflow-y-auto` | Same ✓ |
| Item grouping | Individual bubbles | Group consecutive same-sender bubbles |

---

### 7. `components/chat/MessageBubble.tsx` — **Visual overhaul**

| What | Current | Target |
|---|---|---|
| Sent bubble bg | `bg-[var(--chat-sent-bg)]` | `bg-[#F0FDF4]` |
| Received bubble bg | `bg-white` | `bg-white` ✓ |
| Sent text color | `text-[var(--chat-sent-text)]` | `text-[#111625]` |
| Received text color | `text-[var(--chat-received-text)]` | `text-[#1C1C1C]` |
| Text size | `text-sm` | `text-xs` (12px) |
| Bubble padding | `px-4 py-2` | `p-3` |
| Bubble radius | `rounded-2xl` | `rounded-xl` |
| Max width | `max-w-xs` | `w-fit` (auto sizing) |
| Timestamp color | `text-[var(--chat-time-color)]` | `text-[#8B8B8B]` |
| Read checkmark | `text-[var(--chat-sent-bg)]` | `stroke-[#1E9A80]` |
| Timestamp row (sent) | just time | time + checkcheck icon in `#1E9A80` |
| Reaction badge | None | White pill `rounded-[100px] absolute -bottom-3 left-2` |

---

### 8. `components/chat/ChatInput.tsx` — **Styling update**

| What | Current | Target |
|---|---|---|
| Wrapper | `px-1 py-2 bg-white rounded-lg` | `flex pt-2 items-center gap-3 w-full` (no bg) |
| Input shape | `rounded-full h-10 pr-32` | `rounded-[100px] border border-[#E8E5DF] h-10 pl-4 pr-1 py-3` |
| Placeholder | `text-muted-foreground text-sm` | `text-xs text-[#8796AF] font-inter` |
| Icon buttons | `h-6 w-6 text-muted-foreground` | `w-6 h-6 rounded-[100px] text-[#262626]` |
| Send button | `h-6 w-6 bg-primary rounded-full` | `rounded-[100px] bg-[#1E9A80] w-8` with exact send SVG from demo line 851–867 |
| Icons inside | Paperclip, Mic, Smile, Send | Mic, Smile, Attach, **Send (different order)** |

---

### 9. `GlobalSidebar.tsx` — **Logo Dropdown Restyle** *(currently wrong)*

The logo dropdown in `GlobalSidebar.tsx` currently uses generic shadcn `DropdownMenuContent`. The Figma (demo lines 874–1119) shows a fully custom styled popup.

**Figma logo dropdown structure:**
```
w-[307px] rounded-2xl bg-white shadow
  Section: "Go back to dashboard" + "Rename file" (icon items)
  ─── divider: SVG #E8E5DF ───
  Section: user name + email (text only, no icon)
  Section: credits card (bg-[#F8F8F5] rounded-lg)
    "Credits" / "20 left"  |  "Renews in" / "6h 24m"
    progress bar: bg-[#E8E5DF] → fill bg-[#1E9A80]
    "5 of 25 used today"  /  "+25 tomorrow" (teal)
  ─── divider ───
  Section: "Win free credits" + "Theme Style" (icon items)
  ─── divider ───
  Section: "Log out" (icon item)
```

**Icon item row pattern (apply to ALL logo menu items):**
```
flex p-1.5 items-center gap-2 rounded-lg w-full
  icon box: flex p-1.5 rounded-md bg-[#F3F3EE]  → 16×16 SVG inside
  text: text-sm font-medium text-[#09090B] tracking-[-0.01em]
```

**Active/selected item** gets `bg-[#F8F8F5]` on the outer row (not just icon box).

| What | Current | Target |
|---|---|---|
| Dropdown width | `w-64` | `w-[307px]` |
| Item layout | Lucide icon + plain `<span>` | Icon box `bg-[#F3F3EE] rounded-md` + text |
| Credits section | Simple text | Card `bg-[#F8F8F5] rounded-lg` with progress bar |
| Dividers | `<DropdownMenuSeparator />` | Custom SVG line `stroke #E8E5DF` with `px-2.5` inset |
| Item text color | `text-sm` generic | `text-[#09090B] text-sm font-medium tracking-[-0.01em]` |
| "Log out" color | generic | same as other items (NOT red) |

**Demo reference:** lines 874–1119

---

### 10. `UserListItem.tsx` — **Context Menu (3-dot) Restyle** *(currently wrong)*

The context menu that opens from the `MoreVertical` button in `UserListItem` uses generic shadcn dropdown. The Figma (demo lines 3143–3383) shows a fully custom styled popup.

**Figma context menu structure:**
```
w-[200px] rounded-2xl border border-[#E8E5DF] bg-white p-2
  Items (flex py-1.5 px-2 items-center gap-2.5 rounded-lg w-full):
    Mark as unread   ← active item gets bg-[#F3F3EE] + has sub-indicator
    Archive
    Mute             ← has chevron-right SVG on right side
    Contact info
    Export chat
    Clear chat
    Delete chat      ← text-[#DF1C41] red, icon stroke-[#DF1C41]
```

**Item row pattern:**
```
flex py-1.5 px-2 items-center gap-2.5 rounded-lg w-full
  16×16 custom SVG icon (stroke #111625)
  text-[#111625] text-sm font-medium font-inter tracking-[-0.006em]
```

**Active item** (e.g., "Mark as unread"): `bg-[#F3F3EE]` on the whole row.

**"Mute" item** has a chevron-right `>` SVG pushed to the right (`w-full` on text, then chevron).

**"Delete chat"** breaks the pattern: icon stroke `#DF1C41`, text `text-[#DF1C41]`.

| What | Current | Target |
|---|---|---|
| Container | `w-48` shadcn `DropdownMenuContent` | `w-[200px] rounded-2xl border border-[#E8E5DF] bg-white p-2` |
| Items | `DropdownMenuItem` generic | `flex py-1.5 px-2 items-center gap-2.5 rounded-lg` |
| Icons | Lucide imports (Archive, MessageCircleX, etc.) | Custom SVGs from demo lines 3146–3381 |
| Icon sizes | `w-4 h-4 mr-2` | `w-4 h-4` (no margin, gap handles spacing) |
| Item text | `<span>Archive</span>` | `text-[#111625] text-sm font-medium tracking-[-0.006em]` |
| Delete row | `text-destructive` | `text-[#DF1C41]` explicitly |
| Active row | none | `bg-[#F3F3EE]` on active item |
| Separators | `<DropdownMenuSeparator />` | **None** — Figma uses NO separators in context menu |

**⚠️ IMPORTANT:** The Figma context menu has **no dividers** between items. Remove all `<DropdownMenuSeparator />` that currently exist in UserListItem and ChatHeader.

**Demo reference:** lines 3143–3383

---

### 11. `ChatHeader.tsx` — **Action Dropdown Restyle** *(same style as context menu)*

The `MoreVertical` dropdown in `ChatHeader.tsx` should use the **exact same styling** as the UserListItem context menu (section 10 above). Same `w-[200px]`, same item padding, same custom SVGs from demo.

Items in ChatHeader dropdown: Contact Info, Archive, Mute, Export chat, Clear chat, Delete chat (red).

---

### 12. `ContactInfoPanel.tsx` — **Bring Into Scope + Minor Restyle**

**Why it's now in scope:** The Figma shows Contact Info accessible from:
1. The `MoreVertical` menu in `UserListItem` → "Contact info"
2. The `MoreVertical` menu in `ChatHeader` → "Contact Info"

Both currently call the same `ContactInfoPanel` component — this is correct architecture. The component just needs visual polish to match the design system.

**Extraction requirement:** Currently, `ContactInfoPanel` is only imported in `chat/page.tsx`. The `UserListItem` doesn't actually open it — it only has an `onContactInfo` prop that calls back up. This chain must be verified and possibly consolidated:

```
UserListItem (onContactInfo prop)
  → ChatSidebar (passes through)
    → chat/layout.tsx (handles callback)
      → triggers store.setContactPanelVisible(true)
        → chat/page.tsx renders <ContactInfoPanel />
```

This is actually fine. **No refactor needed for the data flow.** Just restyling.

**Current vs Target:**

| What | Current | Target |
|---|---|---|
| Panel bg | `bg-background border-l` | `bg-white` (same concept but using Figma token) |
| Header | `px-6 py-4 border-b` | Keep but use `border-[#E8E5DF]` |
| Title | `font-semibold text-foreground` | `text-[#111625] font-inter` |
| Close button | `Button variant=ghost h-8 w-8` | `w-8 h-8 rounded-lg border border-[#E8E5DF] bg-white` |
| Avatar | `w-20 h-20 rounded-full mx-auto` | Keep ✓ just ensure bg fallback |
| Name | `text-lg font-semibold` | `text-[#111625] font-inter font-semibold` |
| Email | `text-sm text-muted-foreground` | `text-[#8B8B8B] text-xs font-inter` |
| Audio/Video buttons | `flex-1 gap-2 bg-[var(--primary)]` | `bg-[#1E9A80] text-white rounded-lg` |
| Tab active | `bg-[var(--primary)] text-primary-foreground` | `bg-[#1E9A80] text-white rounded-lg` |
| Tab inactive | `text-muted-foreground` | `text-[#8B8B8B]` |
| Media grid | `gap-2 grid-cols-4` | Keep ✓ |
| Links/Docs items | `bg-muted` | `bg-[#F3F3EE]` |

**Note:** The Figma's Section 4+ likely shows a contact info slide-in panel. The current slide-in animation (`slide-in-from-right-full`) is good — keep it.

**Demo reference:** Scan demo section 4+ for contact info panel visual reference (likely ~line 4000+).

---

## Implementation Phases

### Phase 1 — Design Tokens + App Shell ← Start Here
1. Update `globals.css`: add CSS vars + ensure Inter font loaded
2. Rewrite `GlobalSidebar.tsx`: icon sidebar + **logo dropdown** exact match
3. Rewrite `GlobalTopBar.tsx`: top bar + **user dropdown** exact match

### Phase 2 — Chat List Panel *(careful — lots of moving parts)*
1. Rework `chat/layout.tsx`: panel sizing, header, search row
2. Update `UserListItem.tsx`: selected states, sizes, text styles, **context menu complete restyle**
3. Fix `ChatSidebar.tsx`: loading skeleton height matches new item
4. Verify the `onContactInfo` prop chain: `UserListItem → layout → chat/page.tsx → ContactInfoPanel`

### Phase 3 — Chat View
1. Update `ChatHeader.tsx`: green online, icon buttons, sizes, **action dropdown restyle**
2. Rework `MessageList.tsx`: bg, date pill, justify-end
3. Overhaul `MessageBubble.tsx`: bubble colors, text-xs, read ticks
4. Rework `ChatInput.tsx`: pill input, teal send
5. Restyle `ContactInfoPanel.tsx`: match Figma token colors, tab styling, close button

### Phase 4 — Polish
1. Empty state styling in `chat/page.tsx`
2. Loading skeleton in `ChatSidebar.tsx` matches new sizes
3. Edge cases: long names, missing avatars, unread count badges

### Phase 5 — Real API (Separate Session)
1. Swap mock data for real API endpoints
2. Remove `CURRENT_USER` import
3. Wire `useAuth` into chat store
4. Socket.io validation
5. E2E smoke test

---

## Mock Data Strategy (Phases 1–4)

**No changes to mock files during visual work.** Leave these completely untouched:
- `lib/mocks/` — mock data
- `lib/store/chat-store.ts` — state logic  
- `lib/api/chat.ts` — API layer
- `NewMessageModal.tsx`, `NewMessageDropdown.tsx` — still out of scope for now

**Now IN scope (visual restyle only, no logic changes):**
- `ContactInfoPanel.tsx` — Phase 3, step 5
- `ChatContextMenu.tsx` — absorbed into UserListItem + ChatHeader dropdown restyling

---

## Dropdown Styling Summary (shared reference)

All dropdowns in the app share the same base container but have different item structures:

| Dropdown | Width | Item icon style | Reference lines |
|---|---|---|---|
| Logo menu (sidebar) | `w-[307px]` | Icon in `bg-[#F3F3EE]` rounded-md box | 874–1119 |
| Context menu (list item + chat header) | `w-[200px]` | Plain 16px SVG, no box | 3143–3383 |

**Shared container:**
```
rounded-2xl border border-[#E8E5DF] bg-white p-2
```

**Context menu item (no icon box):**
```
flex py-1.5 px-2 items-center gap-2.5 rounded-lg w-full
  [16px SVG] text-[#111625] font-inter text-sm font-medium tracking-[-0.006em]
```

**Logo menu item (with icon box):**
```
flex p-1.5 items-center gap-2 rounded-lg w-full
  [icon box: p-1.5 rounded-md bg-[#F3F3EE]] text-[#09090B] font-inter text-sm font-medium tracking-[-0.01em]
```

**Key difference:** Context menus have NO `<DropdownMenuSeparator />`. Logo menu uses SVG horizontal rule dividers.

---

## Complete Updated Work Order

```
Phase 1:  globals.css  →  GlobalSidebar (sidebar + logo dropdown)  →  GlobalTopBar
Phase 2:  chat/layout  →  UserListItem (list item + context menu)  →  ChatSidebar skeleton
Phase 3:  ChatHeader (+ action dropdown)  →  MessageList  →  MessageBubble  →  ChatInput  →  ContactInfoPanel
Phase 4:  Empty states  →  Loading states  →  Edge cases  →  Final review
Phase 5:  Real API swap (separate session)
```

---

> [!IMPORTANT]
> The `demo/page.tsx` (8730 lines) contains multiple Figma sections at different `left-[Npx]` offsets:
> - **Section 1** (`left-[100px]`): Main chat view — lines 1–873
> - **Section 2** (`left-[1721px]`): Alternate chat state — lines 1195–2200
> - **Section 3** (`left-[3242px]` approx): Context menu open state — lines 2200–3385
> - **Section 4+**: Logo dropdown + contact info panel

> [!WARNING]
> Phase 2 is the most complex. The `UserListItem` context menu has NO dividers in the Figma but the current code has 3 `<DropdownMenuSeparator />` elements. Remove them all. Also: context menu icons are **all custom SVGs** — none map cleanly to Lucide.

> [!TIP]
> Copy SVG icons **directly from `demo/page.tsx`** rather than using Lucide substitutes. Critical custom icons: logo, nav items, send button, all context menu icons, logo dropdown icons.
