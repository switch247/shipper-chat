# Shipper Chat – Figma Migration Checkpoints

> Update this file after every completed step. On resume: read this file first to know exactly where to continue.

## Overall Progress
- [x] Plan created (v1 + v2)
- [x] Phase 1 — App shell & tokens ✅ COMPLETE
- [ ] Phase 2 — Chat list panel ← **NEXT**
- [ ] Phase 3 — Chat view
- [ ] Phase 4 — Polish
- [ ] Phase 5 — Real API

---

## Phase 1 — Design Tokens + App Shell

### Step 1.1 – `globals.css` — Design tokens + Inter font
**Status:** ✅ DONE

**What was done:**
- Added Figma design tokens as CSS custom properties under `:root`:
  - `--figma-bg: #F3F3EE` — app-wide warm off-white background
  - `--figma-brand: #1E9A80` — primary teal/green
  - `--figma-card: #FFFFFF`
  - `--figma-sent-bubble: #F0FDF4` — light green sent message bg
  - `--figma-border: #E8E5DF`
  - `--figma-text-primary: #111625`
  - `--figma-text-secondary: #1C1C1C`
  - `--figma-text-muted: #8B8B8B`
  - `--figma-text-placeholder: #8796AF`
  - `--figma-online: #38C793`
  - `--figma-destructive: #DF1C41`
  - `--figma-dropdown-active: #F3F3EE`
  - `--figma-dropdown-icon-bg: #F3F3EE`
  - `--figma-credits-card: #F8F8F5`
- Updated `--input` to `#F3F3EE` (was `oklch(0.96 0 0)`)
- Updated `--primary` to `oklch(0.595 0.163 162.7)` which resolves to approx `#1E9A80`
- Updated `--online-status` to `#38C793`
- Updated `--chat-sent-bg` to `#F0FDF4`, `--chat-sent-text` to `#111625`
- Updated `--chat-received-text` to `#1C1C1C`
- Updated `--chat-time-color` to `#8B8B8B`
- Switched `--font-sans` to `'Inter', sans-serif` in `@theme inline`
- Added `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap')` at top

**Key decision:** We keep existing shadcn CSS vars and add Figma-specific ones prefixed with `--figma-` to avoid breaking existing component styles during migration. Components are updated to use hard-coded hex values (matching demo/page.tsx practice) rather than vars, for exact Figma parity.

---

### Step 1.2 – `app/(authenticated)/layout.tsx` — Shell wrapper bg
**Status:** ✅ DONE

**What was done:**
- Changed outer `div` bg from `bg-input` → `bg-[#F3F3EE]`
- Changed `p-2` → `p-3` (Figma uses 12px padding around the shell)
- Changed right section `bg-gray-50/50` → `bg-[#F3F3EE]`
- Changed `main` bg from `bg-gray-50/50` → `bg-[#F3F3EE]`
- Removed `overflow-auto` from main, kept `overflow-hidden` to prevent double scroll

---

### Step 1.3 – `GlobalSidebar.tsx` — Full overhaul
**Status:** ✅ DONE

**What was done:**
- Removed `bg-input` → sidebar is now transparent/`bg-transparent` (inherits `#F3F3EE` from parent)
- Width: `w-20` → `w-fit py-6 px-4` (natural 68px from icons)
- **Logo:** Replaced dropdown trigger style with teal circle `p-[11px] rounded-[915px] bg-[#1E9A80]` containing exact SVG from demo lines 10–31
- **Logo dropdown:** Rebuilt to match demo lines 874–1119:
  - Width: `w-[307px]` (was `w-64`)
  - Items: icon in `bg-[#F3F3EE] p-1.5 rounded-md` box + text
  - Credits section: `bg-[#F8F8F5] rounded-lg` card with progress bar
  - Dividers: SVG `<path d="M10 0.5H297" stroke="#E8E5DF" />` (not DropdownMenuSeparator)
  - Item text: `text-[#09090B] text-sm font-medium font-inter tracking-[-0.01em]`
- **Nav items:** 
  - Container: `flex flex-col items-start gap-2`
  - Each item: `flex min-w-[44px] max-w-[44px] py-2 px-3 items-center gap-2 rounded-lg h-11`
  - Active item: `border border-[#1E9A80] bg-[#F0FDF4]`
  - SVG icons: copied exactly from demo (fill `#151515`, 20×20)
- **Bottom section:**
  - Gap: `gap-6`
  - Sparkle icon: exact SVG from demo lines 114–127 (fill `#151515`, 20×20)
  - Avatar: `w-11 h-11 rounded-[44px]`

**Gotchas:**
- Sidebar logo SVG uses `clipPath` with a unique ID — added suffix to avoid ID collision if multiple rendered
- Logo dropdown dividers: replaced all `<DropdownMenuSeparator />` with inline SVG lines

---

### Step 1.4 – `GlobalTopBar.tsx` — Full overhaul
**Status:** ✅ DONE

**What was done:**
- Outer header: `bg-[#F3F3EE]` no fixed height, just `px-4 py-3 shrink-0`
- Inner white card: `bg-white rounded-2xl py-3 px-6 flex items-center justify-between`
- **Left breadcrumb:**
  - Chat SVG icon (20×20, stroke `#596881`) + `text-sm font-medium text-[#111625] tracking-[-0.006em]`
- **Center → right cluster** (flex row, `gap-4`):
  - Search bar: `w-[300px] h-8 rounded-[10px] border border-[#E8E5DF]` with:
    - 14×14 search SVG (stroke `#8796AF`)
    - "Search" text `text-xs text-[#8796AF]`
    - `⌘+K` badge: `py-[5px] px-1.5 rounded-md bg-[#F3F3EE] text-xs text-[#404040]`
  - Bell button: `w-8 h-8 rounded-lg border border-[#E8E5DF] bg-white` + 16×16 bell SVG
  - Settings button: same style + 16×16 settings SVG
  - Divider: `<svg width="1" height="20">` with `stroke="#E8E5DF"`
  - User trigger: `flex items-center gap-2` with `w-8 h-8 rounded-[32px]` avatar + ChevronDown SVG

**Kept:** Search query binding to `useChatStore` — functional search still works.
**Kept:** Breadcrumb logic (pathname-based icon/title selection)
**Kept:** User dropdown with logout/profile links (just restyled container)

---

## Phase 2 — Chat List Panel
**Status:** 🔲 NOT STARTED

### Step 2.1 – `chat/layout.tsx`
### Step 2.2 – `UserListItem.tsx` (+ context menu)
### Step 2.3 – `ChatSidebar.tsx` (skeleton fix)
### Step 2.4 – Verify `onContactInfo` prop chain

---

## Phase 3 — Chat View
**Status:** 🔲 NOT STARTED

### Step 3.1 – `ChatHeader.tsx` (+ action dropdown)
### Step 3.2 – `MessageList.tsx`
### Step 3.3 – `MessageBubble.tsx`
### Step 3.4 – `ChatInput.tsx`
### Step 3.5 – `ContactInfoPanel.tsx`

---

## Phase 4 — Polish
**Status:** 🔲 NOT STARTED

### Step 4.1 – Empty state in `chat/page.tsx`
### Step 4.2 – Loading skeletons in `ChatSidebar.tsx`
### Step 4.3 – Edge cases (long names, missing avatars, unread badges)

---

## Phase 5 — Real API
**Status:** 🔲 NOT STARTED (separate session)

---

## Key SVG Reference (copy from demo/page.tsx)

| Icon | Used in | Demo lines |
|---|---|---|
| Logo (package/box) | GlobalSidebar logo btn | 10–31 |
| Home | Sidebar nav | 45–49 |
| Chat/Message | Sidebar nav (active) | 52–64 |
| Explore/Compass | Sidebar nav | 66–79 |
| Files/Folder | Sidebar nav | 81–95 |
| Analytics/Gallery | Sidebar nav | 96–110 |
| AI Sparkle/Star | Sidebar bottom | 114–127 |
| Message bubble | TopBar breadcrumb | 140–155 |
| Search (14px) | TopBar search bar | 163–177 |
| Bell | TopBar notification | 191–206 |
| Settings/Gear | TopBar settings | 208–231 |
| ChevronDown | TopBar user | 252–266 |
| New Message pen+ | Chat list header btn | 279–293 |
| Filter/Funnel | Chat list filter btn | 324–340 |
| Send (paper plane) | ChatInput | 851–867 |
| Mic | ChatInput | 797–812 |
| Emoji | ChatInput | 814–831 |
| Attach/Paperclip | ChatInput | 832–849 |
| Mark as unread | Context menu | 3146–3161 |
| Archive | Context menu | 3241–3259 |
| Mute | Context menu | 3261–3297 |
| Contact info | Context menu | 3299–3317 |
| Export chat | Context menu | 3319–3338 |
| Clear chat | Context menu | 3340–3359 |
| Delete chat (red) | Context menu | 3361–3380 |

---

## Design Token Quick Reference

```
App bg:          #F3F3EE
Brand/Primary:   #1E9A80
Card bg:         #FFFFFF
Sent bubble bg:  #F0FDF4
Border:          #E8E5DF
Text primary:    #111625
Text secondary:  #1C1C1C
Text muted:      #8B8B8B
Text placeholder:#8796AF
Online dot:      #38C793
Destructive:     #DF1C41
Dropdown active: #F3F3EE
Icon box (logo): #F3F3EE
Credits card:    #F8F8F5
```
