

# Voucher Dashboard & Forms Implementation Plan

## Overview
Create a Voucher Dashboard page with 6 gradient cards, and 4 new voucher form pages (Expenses, Contra, Loan Given, Loan Received). Payment and Receipt vouchers link to the existing `/payments` page.

## Architecture

### New Files
1. **`src/pages/VoucherDashboard.tsx`** — Dashboard with gradient cards, recent vouchers table, quick stats
2. **`src/pages/ExpensesVoucher.tsx`** — Multi-line expense entry form
3. **`src/pages/ContraVoucher.tsx`** — Cash/Bank transfer form
4. **`src/pages/LoanGivenVoucher.tsx`** — Loan disbursement form
5. **`src/pages/LoanReceivedVoucher.tsx`** — Loan receipt form

### Modified Files
6. **`src/types/index.ts`** — Add `Voucher` type, extend `JournalEntry.referenceType` to include new voucher types
7. **`src/contexts/AppContext.tsx`** — Add `vouchers` state array with CRUD operations, auto-number generators for each voucher type
8. **`src/App.tsx`** — Add routes: `/vouchers`, `/vouchers/expenses/new`, `/vouchers/contra/new`, `/vouchers/loan-given/new`, `/vouchers/loan-received/new`
9. **`src/components/layout/AppLayout.tsx`** — Add "Vouchers" nav item with `Wallet` icon between "Payments & Receipts" and "Parties"

---

## Detailed Design

### 1. Types (`src/types/index.ts`)

Add a `Voucher` interface:
```typescript
export type VoucherType = 'expense' | 'contra' | 'loan_given' | 'loan_received';

export interface Voucher {
  id: string;
  number: string;  // EXP-YYYY-MM-XXX, CTR-..., LGT-..., LNR-...
  type: VoucherType;
  date: string;
  partyName: string;       // vendor name, account name, or party
  amount: number;          // total amount
  narration: string;
  method: PaymentMethod;
  reference?: string;
  details: Record<string, any>;  // type-specific fields (expense lines, loan terms, etc.)
  createdAt: string;
}
```

Extend `JournalEntry.referenceType` union to include `'expense' | 'contra' | 'loan_given' | 'loan_received'`.

### 2. AppContext Updates

- Add `vouchers` localStorage state, `addVoucher` function
- Add number generators: `generateExpenseNumber()`, `generateContraNumber()`, `generateLoanGivenNumber()`, `generateLoanReceivedNumber()` — format `EXP-YYYY-MM-XXX`
- Add new system accounts to `DEFAULT_ACCOUNTS`:
  - `acc-1200` Loans & Advances (asset)
  - `acc-2100` Loans Payable (liability)

### 3. Voucher Dashboard (`/vouchers`)

- **6 gradient cards** in a responsive grid (2 cols mobile, 3 cols desktop):
  - Payment (coral #FF6B6B, `ArrowUpRight` icon) → links to `/payments` (sets payment tab)
  - Receipt (mint #4ECDC4, `ArrowDownLeft` icon) → links to `/payments` (sets receipt tab)
  - Expenses (lavender #9D7BFA, `Receipt` icon) → `/vouchers/expenses/new`
  - Contra (peach #FFB347, `ArrowLeftRight` icon) → `/vouchers/contra/new`
  - Loan Given (sky #59C7EB, `HandCoins` icon) → `/vouchers/loan-given/new`
  - Loan Received (amber #FFA726, `Landmark` icon) → `/vouchers/loan-received/new`
- Each card: icon, title, short description, hover lift (`hover:-translate-y-1 hover:shadow-lg`)
- **Recent Vouchers table**: Last 10 entries from `vouchers` + `payments` combined, showing number, date, party, amount with badge
- **Quick stats cards**: Today's total amount, pending count, total vouchers this month

### 4. Expenses Voucher Form

Matches existing Payment/Receipt voucher styling (`max-w-lg mx-auto`, same Card/Label/Input patterns):
- Auto-number `EXP-YYYY-MM-XXX`, date picker
- "Pay To" text input (vendor/cash)
- Dynamic expense lines table:
  - Each row: Expense Head (Select from expense-type accounts + "+ Add New" option that opens a Dialog to create a new account), Amount, Mode (Cash/Bank/Cheque/Card — if Bank/Cheque/Card show bank account selector), delete icon
  - Blue "+ Add Row" button
  - Running total display
- Reference, narration fields
- **Journal Preview** card: Shows each expense line as Dr [Expense Head] / Cr [Cash/Bank per mode]
- Save, Save & New, Cancel buttons

### 5. Contra Voucher Form

- Auto-number `CTR-YYYY-MM-XXX`, date picker
- Transfer type radio group: Cash→Bank, Bank→Cash, Bank→Bank
- From/To account dropdowns (filtered to cash/bank accounts only)
- Validation: From and To cannot be same account
- Amount, reference, narration
- **Journal Preview**: Dr [To Account] / Cr [From Account]
- Save, Save & New, Cancel buttons

### 6. Loan Given Voucher Form

- Auto-number `LGT-YYYY-MM-XXX`, date picker
- Party dropdown (from clients list)
- Loan type radio: Advance Salary / Loan to Customer / Loan to Vendor / Others
- Principal amount, interest rate (%), mode with bank selection
- Repayment date picker, narration
- **Journal Preview**: Dr Loans & Advances (acc-1200) / Cr Cash or Bank
- Save, Save & New, Cancel buttons

### 7. Loan Received Voucher Form

- Auto-number `LNR-YYYY-MM-XXX`, date picker
- "Received From" dropdown (clients)
- Loan type radio: Bank Loan / Personal Loan / Others
- Principal amount, interest rate (%), mode with bank selection
- Repayment terms text, first payment date, narration
- **Journal Preview**: Dr Cash/Bank / Cr Loans Payable (acc-2100)
- Save, Save & New, Cancel buttons

### 8. Common Form Patterns (all 4 forms)

- Validation: required fields, amount > 0, double-entry debit = credit check
- Toast on success
- "Save & New" resets form and stays on page; "Save" navigates to `/vouchers`; "Cancel" navigates back
- All journal entries created via `createJournalEntry` with appropriate `referenceType`
- All vouchers stored via `addVoucher`
- Button bar at bottom matching existing fixed-bottom pattern on mobile

### 9. Sidebar & Routes

**AppLayout.tsx**: Add `{ name: 'Vouchers', href: '/vouchers', icon: Wallet }` to navigation array after "Payments & Receipts".

**App.tsx**: Add 5 new routes:
```
/vouchers → VoucherDashboard
/vouchers/expenses/new → ExpensesVoucher
/vouchers/contra/new → ContraVoucher
/vouchers/loan-given/new → LoanGivenVoucher
/vouchers/loan-received/new → LoanReceivedVoucher
```

