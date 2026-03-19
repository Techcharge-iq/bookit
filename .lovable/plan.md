

# Implementation Plan

## 1. Stylish Collapsible Icon Sidebar

**Current state**: Fixed 224px sidebar with text labels, mobile hamburger toggle.

**Changes**:

### `src/components/layout/AppLayout.tsx` — Full rewrite of sidebar
- Add `collapsed` state (default: `true` on desktop, hidden on mobile as before)
- Collapsed mode: narrow sidebar (~56px) showing only icons
- Expanded mode: full width (~224px) with icons + labels
- Hamburger/toggle button at top to expand/collapse
- Add `Tooltip` on each icon when collapsed (shows menu label on hover)
- Smooth width transition via `transition-all duration-200`
- Active item: distinct background highlight (e.g. `bg-primary/10 text-primary border-l-2 border-primary`)
- Reports sub-menu: show as collapsible group when expanded, tooltip flyout when collapsed
- Update `lg:pl-56` to be dynamic based on collapsed state (`lg:pl-14` vs `lg:pl-56`)
- Mobile behavior unchanged (overlay sidebar)

### Visual design
- Collapsed: slim icon strip with subtle separator, logo shows only icon
- Expanded: current layout with smooth slide animation
- Icons get centered alignment in collapsed mode
- Settings link at bottom of sidebar (separated with spacer)

## 2. Account History/Statement Page

### `src/pages/AccountStatement.tsx` — New page
- Reads account ID from URL params (`/accounts/:id/statement`)
- Pulls account info from `accounts` array, journal entries from `journalEntries`
- **Header**: Account name, code, type badge, current balance
- **Date filter**: Preset buttons (Today, This Week, This Month, This Year) + custom date range picker
- **Transaction table**: Date, Reference, Description, Debit, Credit, Running Balance
  - Running balance calculated chronologically within filtered period
  - Sorted by date ascending
- **Summary cards**: Opening Balance, Total Debits, Total Credits, Closing Balance
- **Export**: PDF export using existing `documentUtils.ts` pattern, CSV export via blob download

### `src/pages/ChartOfAccounts.tsx` — Make accounts clickable
- Wrap each account row in a `Link` to `/accounts/${acc.id}/statement`
- Add a small arrow/eye icon to indicate clickability
- Cursor pointer styling

### `src/App.tsx` — Add route
- Add: `<Route path="/accounts/:id/statement" element={<AccountStatement />} />`

### Data flow
- Filter `journalEntries` where any `line.accountId === accountId`
- For each matching entry, extract the line for this account (debit/credit amounts)
- Calculate opening balance from entries before the filter start date
- Running balance = opening balance + cumulative (debits - credits) for the account type

**Files modified**: `AppLayout.tsx`, `ChartOfAccounts.tsx`, `App.tsx`
**Files created**: `AccountStatement.tsx`

