# Accumen Pro - Enterprise Accounting & Bookkeeping System
**Modern, Automated Dual-Portal Financial Web Application**
Built with **HTML5, Vanilla CSS3, and Vanilla JavaScript (GAAP & IFRS Compliant)**.

---

## 🌟 Executive Overview
**Accumen Pro** is a multi-page financial management and double-entry accounting web application designed with an executive aesthetic. It features two interconnected portals:

1. **Bookkeeper Operations Portal (`bookkeeping.html`)**: For recording day-to-day transactions (sales invoices, vendor bills, customer receipts, vendor payments, petty cash, payroll, credit/debit notes, and reconciliations).
2. **Chief Accountant & Controller Suite (`accounting.html`)**: For reviewing entries, calculating accruals & depreciation, running statutory financial statements (Profit & Loss, Balance Sheet, Cash Flow), analyzing financial ratios, tracking budgets, preparing tax provisions, and managing external audit packs.
3. **Executive Hub (`index.html`)**: Central landing and navigation dashboard with live KPI metrics, double-entry status ticker, and real-time audit logs.

Everything is **100% automated**. When any transaction is recorded, the engine automatically:
- Formulates the standard double-entry journal vouchers ($Debit = Credit$).
- Updates the live General Ledger for all accounts.
- Re-calculates customer Accounts Receivable (A/R) and supplier Accounts Payable (A/P) aging schedules.
- Computes real-time balanced Trial Balances.
- Synchronizes the Profit & Loss statement, Balance Sheet, and Cash Flow statement immediately.
- Persists all data in `localStorage` with JSON export/import and demo data presets.

---

## 🚀 How to Run the Website Locally

You can open the website in any browser. You can either:
1. Double-click [index.html](file:///d:/ANTIGRAVITY%20ALL%20TOOLS/ACCOUNTING%20SITE/index.html) in your file explorer to open it in your browser.
2. Or use any local HTTP server (such as Python or Node.js):
   ```bash
   # In terminal:
   python -m http.server 8080
   ```
   Then open: **`http://localhost:8080/index.html`**

---

## 📑 1. Bookkeeping Portal Requirements Implemented

| Requirement | Implementation in Accumen Pro |
| :--- | :--- |
| **Sales / Invoices Record Karna** | Interactive invoice generator with customer info, line items, and tax rates. Automatically debits A/R (1030) and credits Sales Revenue (4010) & Tax Payable (2030). |
| **Purchase Bills Record Karna** | Records supplier bills with categories (COGS, Rent, Utilities, Admin). Automatically debits selected Expense and credits Accounts Payable (2010). |
| **Cash Transactions Enter Karna** | Records cash in/out, petty cash vouchers, and safe replenishment float. |
| **Bank Transactions Enter Karna** | Bank deposits, withdrawals, and bank-to-cash or cash-to-bank transfers. |
| **Customer Payments Record Karna** | "Pay" button on open invoices: receives payment, knocks off invoice balance, and debits Bank/Cash while crediting Accounts Receivable. |
| **Supplier / Vendor Payments Record Karna** | "Pay Bill" button: settles supplier bill, debits Accounts Payable, and credits Bank/Cash. |
| **Accounts Receivable (AR) Maintain Karna** | Live AR aging schedule categorized into *Current, 1-30 Days, 31-60 Days, 61-90 Days, 90+ Days*. |
| **Accounts Payable (AP) Maintain Karna** | Live AP aging schedule showing upcoming and overdue liabilities by vendor. |
| **Bank Reconciliation Karna** | Wizard comparing General Ledger book balance (Account 1020) against statement ending balance to identify discrepancies. |
| **Cash Reconciliation Karna** | Physical cash count comparison against Account 1010 to verify petty cash float integrity. |
| **Expenses Record & Categorize Karna** | Direct expense vouchers categorized across Chart of Accounts (COA) expense codes. |
| **Payroll Entries Record Karna** | Salary run processor: debits Salary Expense (6010), credits Tax Withholding (2030), and credits Bank/Cash (1020) for net pay. |
| **Credit / Debit Notes Record Karna** | Issues customer credit notes (reduces AR) and supplier debit notes (reduces AP). |
| **Journal Entries Pass Karna** | Manual multi-row journal voucher tool with real-time balance validation ($Debit = Credit$). |
| **General Ledger Maintain Karna** | Filterable interactive ledger explorer showing all entries, dates, references, debits, credits, and running balance. |
| **Trial Balance Prepare / Check Karna** | Real-time Trial Balance table verifying that Total Debits equal Total Credits with a balanced status indicator. |
| **Invoices & Receipts Organize Karna** | Document organizer repository with printable invoice dossier modal. |
| **Financial Documents Proper Record** | Chronological audit trail logging user actions, timestamps, and reference IDs. |
| **Month-End Books Close Helper** | Pre-closing checklist for the bookkeeper before handover to the Chief Accountant. |

---

## 📈 2. Accountant & Financial Controller Requirements Implemented

| Requirement | Implementation in Accumen Pro |
| :--- | :--- |
| **Bookkeeping Records Review Karna** | Executive approval queue to inspect, verify, and endorse bookkeeper postings. |
| **Journal Entries Prepare / Approve** | Chief Accountant sign-off with formal approval badges on journal vouchers. |
| **General Ledger Review** | Full drilldown by account code with running balances and source tracking. |
| **Trial Balance Check** | Adjusted Trial Balance verification with discrepancy alerts. |
| **Bank & Cash Rec Review** | Chief Accountant sign-off on bank statement matches. |
| **AR / AP Review & Aging** | Aging distribution analysis and bad debt risk identification. |
| **Accruals & Prepayments Calculate** | Schedule multi-month prepayments (e.g. annual insurance) and accrued liabilities with 1-click amortization. |
| **Depreciation Calculate** | Fixed Asset register supporting Straight-Line and Declining-Balance methods with 1-click depreciation run. |
| **Fixed Assets Accounting** | Capitalization of equipment, furniture, and vehicles with Net Book Value (NBV) calculation. |
| **Month-End Closing** | Period lock wizard to close monthly books and prevent unapproved retroactive edits. |
| **Year-End Closing** | Retained Earnings Rollup: transfers net profit/loss into Retained Earnings (Equity) and closes temporary nominal accounts. |
| **Profit & Loss Statement (P&L)** | Automated Income Statement showing Gross Revenue, COGS, Gross Profit, Operating Expenses, and Net Profit. |
| **Balance Sheet Prepare** | Automated Statement of Financial Position ($Assets = Liabilities + Equity$) linked directly to P&L Net Income. |
| **Cash Flow Statement Prepare** | Indirect cash flow statement broken down into Operating, Investing, and Financing activities. |
| **Financial Statements Analysis** | Key financial ratios: Current Ratio, Quick Ratio, Debt-to-Equity, Gross Margin %, Net Margin %, ROA. |
| **Budget Prepare & Actual vs Budget** | Line-by-line comparison of target budgets against actual GL figures with variance ($ and %). |
| **Variance Analysis Karna** | Favorable vs Unfavorable status flags and performance insights. |
| **Tax-Related Calculations** | Sales Tax (VAT/GST) liability summary and Corporate Income Tax estimation (21% statutory base). |
| **Audit Documents & Schedules** | Lead schedules and 1-click printable audit dossier. |
| **Auditors Queries Tracker** | Audit findings query log with resolution and response tracking. |
| **Internal Controls & Error Detection** | Diagnostic scanner that checks for unbalanced entries, negative cash balances, or unapproved records. |
| **Management Financial Reports** | Clean printable executive financial statements. |
| **Accounting Policies & GAAP/IFRS** | Reference guide for IFRS 15, IAS 16, IAS 1, and internal control policies. |

---

## 📁 File Structure
```
d:\ANTIGRAVITY ALL TOOLS\ACCOUNTING SITE/
├── index.html                  # Executive Hub & Central Dashboard
├── bookkeeping.html            # Complete Bookkeeper Operations Portal
├── accounting.html             # Complete Chief Accountant & Controller Suite
├── css/
│   └── styles.css              # Executive Design System (Dark/Light themes, responsive, print layouts)
├── js/
│   ├── accounting-engine.js    # Core Double-Entry Engine, COA, Calculations & Demo Data
│   ├── nav.js                  # Shared Navigation Bar, Live Status Ticker & Alerts
│   ├── bookkeeping.js          # Controller for Bookkeeping workflows & modals
│   └── accounting.js           # Controller for Accountant reports, statements & closing
└── README.md                   # Complete Documentation & Usage Guide
```

---

## 💡 Quick Tips
- **Demo Data**: Click **"⚡ Demo Data"** in the top navigation bar at any time to reload a comprehensive corporate dataset (Apex Global Solutions Ltd.) with sample sales, bills, payroll, fixed assets, and balanced books.
- **Theme Switcher**: Click the **🌓 icon** in the top right to switch between Executive Dark Mode and Crisp Light Mode.
- **Print & PDF**: Click any **"🖨️ Print"** button on the invoices, P&L, Balance Sheet, or Audit tabs to view a clean print-ready document.
- **Data Persistence**: All entries are stored in your browser's `localStorage` and shared instantly across all tabs and pages. Use the **"💾 Export"** button to download a backup JSON file whenever needed.
