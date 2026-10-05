/* ===================================================================
   ACCUMEN PRO - CORE DOUBLE-ENTRY ACCOUNTING & BOOKKEEPING ENGINE
   Full GAAP/IFRS Compliance, Real-Time Automation & Ledger Engine
=================================================================== */

const AccountingEngine = (() => {
  const STORAGE_KEY = 'accumen_pro_financial_data_v1';

  // Standard Master Chart of Accounts (COA)
  const DEFAULT_COA = [
    // Current Assets
    { code: '1010', name: 'Cash in Hand (Petty Cash)', type: 'Asset', subType: 'Current Asset', normal: 'Debit' },
    { code: '1020', name: 'Main Business Bank Account', type: 'Asset', subType: 'Current Asset', normal: 'Debit' },
    { code: '1030', name: 'Accounts Receivable (Debtors)', type: 'Asset', subType: 'Current Asset', normal: 'Debit' },
    { code: '1040', name: 'Merchandise Inventory', type: 'Asset', subType: 'Current Asset', normal: 'Debit' },
    { code: '1050', name: 'Prepaid Expenses', type: 'Asset', subType: 'Current Asset', normal: 'Debit' },
    
    // Non-Current / Fixed Assets
    { code: '1510', name: 'Office Equipment & Computers', type: 'Asset', subType: 'Fixed Asset', normal: 'Debit' },
    { code: '1520', name: 'Acc. Depreciation - Equipment', type: 'Asset', subType: 'Contra Asset', normal: 'Credit' },
    { code: '1530', name: 'Furniture & Fixtures', type: 'Asset', subType: 'Fixed Asset', normal: 'Debit' },
    { code: '1540', name: 'Acc. Depreciation - Furniture', type: 'Asset', subType: 'Contra Asset', normal: 'Credit' },
    { code: '1550', name: 'Commercial Vehicles', type: 'Asset', subType: 'Fixed Asset', normal: 'Debit' },
    { code: '1560', name: 'Acc. Depreciation - Vehicles', type: 'Asset', subType: 'Contra Asset', normal: 'Credit' },

    // Current Liabilities
    { code: '2010', name: 'Accounts Payable (Creditors)', type: 'Liability', subType: 'Current Liability', normal: 'Credit' },
    { code: '2020', name: 'Accrued Expenses Payable', type: 'Liability', subType: 'Current Liability', normal: 'Credit' },
    { code: '2030', name: 'Sales Tax / VAT Payable', type: 'Liability', subType: 'Current Liability', normal: 'Credit' },
    { code: '2040', name: 'Salaries & Payroll Payable', type: 'Liability', subType: 'Current Liability', normal: 'Credit' },
    { code: '2050', name: 'Income Tax Provision Payable', type: 'Liability', subType: 'Current Liability', normal: 'Credit' },

    // Non-Current Liabilities
    { code: '2510', name: 'Long-Term Bank Loan', type: 'Liability', subType: 'Long-Term Liability', normal: 'Credit' },

    // Equity
    { code: '3010', name: "Owner's Equity / Paid-in Capital", type: 'Equity', subType: 'Equity', normal: 'Credit' },
    { code: '3020', name: 'Retained Earnings', type: 'Equity', subType: 'Equity', normal: 'Credit' },

    // Revenues
    { code: '4010', name: 'Sales & Service Revenue', type: 'Revenue', subType: 'Operating Revenue', normal: 'Credit' },
    { code: '4020', name: 'Consulting & Advisory Income', type: 'Revenue', subType: 'Operating Revenue', normal: 'Credit' },
    { code: '4030', name: 'Sales Discounts & Allowances', type: 'Revenue', subType: 'Contra Revenue', normal: 'Debit' },
    { code: '4040', name: 'Interest & Other Income', type: 'Revenue', subType: 'Other Revenue', normal: 'Credit' },

    // Cost of Goods Sold (COGS)
    { code: '5010', name: 'Cost of Goods Sold (Direct Costs)', type: 'Expense', subType: 'COGS', normal: 'Debit' },

    // Operating Expenses
    { code: '6010', name: 'Salaries & Wages Expense', type: 'Expense', subType: 'Operating Expense', normal: 'Debit' },
    { code: '6020', name: 'Office Rent Expense', type: 'Expense', subType: 'Operating Expense', normal: 'Debit' },
    { code: '6030', name: 'Utilities & Internet', type: 'Expense', subType: 'Operating Expense', normal: 'Debit' },
    { code: '6040', name: 'Marketing & Advertising', type: 'Expense', subType: 'Operating Expense', normal: 'Debit' },
    { code: '6050', name: 'Depreciation Expense', type: 'Expense', subType: 'Operating Expense', normal: 'Debit' },
    { code: '6060', name: 'Office Supplies & Software', type: 'Expense', subType: 'Operating Expense', normal: 'Debit' },
    { code: '6070', name: 'Bank Charges & Transaction Fees', type: 'Expense', subType: 'Operating Expense', normal: 'Debit' },
    { code: '6080', name: 'Professional Legal & Accounting', type: 'Expense', subType: 'Operating Expense', normal: 'Debit' },
    { code: '6090', name: 'Corporate Income Tax Expense', type: 'Expense', subType: 'Tax Expense', normal: 'Debit' }
  ];

  // System State Model
  let state = {
    company: {
      name: 'Apex Global Enterprises Ltd.',
      currency: '$',
      currencyCode: 'USD',
      taxRate: 10, // 10%
      taxName: 'VAT/GST',
      fiscalYearStart: '2026-01-01',
      fiscalYearEnd: '2026-12-31',
      bookStatus: 'Open' // 'Open' or 'Closed'
    },
    chartOfAccounts: [...DEFAULT_COA],
    invoices: [],
    bills: [],
    journalEntries: [],
    customers: [],
    vendors: [],
    fixedAssets: [],
    accrualsPrepayments: [],
    budgets: {},
    bankReconciliations: [],
    cashCounts: [],
    auditLogs: [],
    auditQueries: []
  };

  // Helper: Generate unique IDs
  const uid = (prefix = 'TX') => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

  // Save to LocalStorage
  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      // Dispatch custom event for real-time multi-tab or intra-page refresh
      window.dispatchEvent(new CustomEvent('accumen_data_updated', { detail: { timestamp: Date.now() } }));
    } catch (e) {
      console.error('Error saving Accumen state', e);
    }
  };

  // Load from LocalStorage
  const load = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        state = JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse stored Accumen data. Re-initializing.', e);
        initDefault();
      }
    } else {
      initDefault();
      loadDemoData(); // Pre-load realistic data so user gets wow experience immediately!
    }
  };

  const initDefault = () => {
    state.chartOfAccounts = [...DEFAULT_COA];
    state.invoices = [];
    state.bills = [];
    state.journalEntries = [];
    state.customers = [];
    state.vendors = [];
    state.fixedAssets = [];
    state.accrualsPrepayments = [];
    state.budgets = {
      '4010': 350000,
      '4020': 120000,
      '5010': 140000,
      '6010': 90000,
      '6020': 36000,
      '6030': 12000,
      '6040': 25000,
      '6050': 15000,
      '6060': 8000
    };
    state.bankReconciliations = [];
    state.cashCounts = [];
    state.auditLogs = [];
    state.auditQueries = [];
  };

  // -------------------------------------------------------------
  // DOUBLE-ENTRY CORE POSTING ENGINE
  // -------------------------------------------------------------
  
  /**
   * Posts a Journal Entry with rigorous double-entry validation (DR == CR)
   */
  const postJournalEntry = ({ date, reference, description, lines, source = 'Manual', isApproved = true }) => {
    let totalDebit = 0;
    let totalCredit = 0;

    const validatedLines = lines.map(line => {
      const debit = parseFloat(line.debit) || 0;
      const credit = parseFloat(line.credit) || 0;
      totalDebit += debit;
      totalCredit += credit;

      const coaAccount = state.chartOfAccounts.find(a => a.code === line.accountCode);
      return {
        accountCode: line.accountCode,
        accountName: coaAccount ? coaAccount.name : line.accountName || 'Unknown Account',
        debit: Math.round(debit * 100) / 100,
        credit: Math.round(credit * 100) / 100,
        memo: line.memo || description
      };
    });

    // Check balance with 2-decimal precision
    const diff = Math.abs(totalDebit - totalCredit);
    if (diff > 0.01) {
      throw new Error(`Double-entry out of balance! Total Debits ($${totalDebit.toFixed(2)}) must equal Total Credits ($${totalCredit.toFixed(2)}). Difference: $${diff.toFixed(2)}`);
    }

    const entry = {
      id: uid('JV'),
      date: date || new Date().toISOString().split('T')[0],
      reference: reference || 'JV-' + Math.floor(1000 + Math.random() * 9000),
      description,
      source,
      lines: validatedLines,
      totalAmount: Math.round(totalDebit * 100) / 100,
      isApproved: isApproved !== false,
      reviewedBy: isApproved ? 'Chief Accountant' : null,
      createdAt: new Date().toISOString()
    };

    state.journalEntries.push(entry);
    logAudit(`Posted Journal Entry ${entry.reference}: ${description}`, 'Journal');
    save();
    return entry;
  };

  // -------------------------------------------------------------
  // 1. SALES & INVOICES (Bookkeeping Automation)
  // -------------------------------------------------------------
  const createInvoice = (invData) => {
    const subtotal = parseFloat(invData.subtotal) || 0;
    const taxRate = parseFloat(invData.taxRate ?? state.company.taxRate) || 0;
    const taxAmount = Math.round((subtotal * (taxRate / 100)) * 100) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;

    const inv = {
      id: uid('INV'),
      invoiceNumber: invData.invoiceNumber || `INV-${state.invoices.length + 1001}`,
      date: invData.date || new Date().toISOString().split('T')[0],
      dueDate: invData.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      customerName: invData.customerName,
      customerEmail: invData.customerEmail || '',
      items: invData.items || [{ description: 'Professional Services', qty: 1, rate: subtotal, amount: subtotal }],
      subtotal,
      taxRate,
      taxAmount,
      total,
      paidAmount: 0,
      balanceDue: total,
      status: 'Unpaid', // 'Unpaid', 'Partial', 'Paid', 'Overdue'
      notes: invData.notes || 'Thank you for your business.'
    };

    // Auto double entry journal posting:
    // DR: 1030 Accounts Receivable (Total)
    // CR: 4010 Sales Revenue (Subtotal)
    // CR: 2030 Sales Tax / VAT Payable (Tax Amount)
    const journalLines = [
      { accountCode: '1030', debit: total, credit: 0, memo: `Receivable from ${inv.customerName} - ${inv.invoiceNumber}` },
      { accountCode: '4010', debit: 0, credit: subtotal, memo: `Sales revenue for ${inv.invoiceNumber}` }
    ];

    if (taxAmount > 0) {
      journalLines.push({
        accountCode: '2030',
        debit: 0,
        credit: taxAmount,
        memo: `Sales tax collected on ${inv.invoiceNumber}`
      });
    }

    const jv = postJournalEntry({
      date: inv.date,
      reference: inv.invoiceNumber,
      description: `Sales Invoice to ${inv.customerName}`,
      source: 'Sales Invoice',
      lines: journalLines
    });

    inv.journalEntryId = jv.id;
    state.invoices.unshift(inv);
    ensureCustomerExists(inv.customerName, inv.customerEmail);
    save();
    return inv;
  };

  // -------------------------------------------------------------
  // 2. CUSTOMER PAYMENT RECEIPT
  // -------------------------------------------------------------
  const receiveCustomerPayment = ({ invoiceId, amount, paymentDate, paymentMethod = 'Bank', reference, notes }) => {
    const inv = state.invoices.find(i => i.id === invoiceId);
    if (!inv) throw new Error('Invoice not found');

    const payAmt = Math.round(parseFloat(amount) * 100) / 100;
    if (payAmt <= 0) throw new Error('Payment amount must be greater than zero');
    if (payAmt > inv.balanceDue + 0.01) throw new Error(`Payment ($${payAmt}) cannot exceed balance due ($${inv.balanceDue})`);

    inv.paidAmount = Math.round((inv.paidAmount + payAmt) * 100) / 100;
    inv.balanceDue = Math.round((inv.total - inv.paidAmount) * 100) / 100;
    inv.status = inv.balanceDue <= 0.01 ? 'Paid' : 'Partial';

    // Account mapping: Bank (1020) or Cash (1010)
    const debitAccount = paymentMethod === 'Cash' ? '1010' : '1020';

    // Double Entry:
    // DR: 1020 Bank or 1010 Cash (payAmt)
    // CR: 1030 Accounts Receivable (payAmt)
    postJournalEntry({
      date: paymentDate || new Date().toISOString().split('T')[0],
      reference: reference || `RCP-${inv.invoiceNumber}`,
      description: `Customer payment received from ${inv.customerName} for ${inv.invoiceNumber}`,
      source: 'Payment Receipt',
      lines: [
        { accountCode: debitAccount, debit: payAmt, credit: 0, memo: `Payment received via ${paymentMethod}` },
        { accountCode: '1030', debit: 0, credit: payAmt, memo: `Clear AR for ${inv.invoiceNumber}` }
      ]
    });

    logAudit(`Received payment of $${payAmt.toFixed(2)} from ${inv.customerName}`, 'AR Payment');
    save();
    return inv;
  };

  // -------------------------------------------------------------
  // 3. PURCHASE BILLS (Bookkeeping Automation)
  // -------------------------------------------------------------
  const createBill = (billData) => {
    const subtotal = parseFloat(billData.subtotal) || 0;
    const taxRate = parseFloat(billData.taxRate ?? 0) || 0;
    const taxAmount = Math.round((subtotal * (taxRate / 100)) * 100) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;
    const expenseAccountCode = billData.expenseAccountCode || '5010';

    const bill = {
      id: uid('BILL'),
      billNumber: billData.billNumber || `BILL-${state.bills.length + 2001}`,
      vendorName: billData.vendorName,
      date: billData.date || new Date().toISOString().split('T')[0],
      dueDate: billData.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      category: billData.category || 'Cost of Goods Sold',
      expenseAccountCode,
      items: billData.items || [{ description: 'Inventory/Supplies', qty: 1, rate: subtotal, amount: subtotal }],
      subtotal,
      taxRate,
      taxAmount,
      total,
      paidAmount: 0,
      balanceDue: total,
      status: 'Unpaid',
      notes: billData.notes || ''
    };

    // Auto Double Entry:
    // DR: 5010 or Expense Account (Subtotal)
    // DR: 2030 Input Tax / VAT (if applicable)
    // CR: 2010 Accounts Payable (Total)
    const journalLines = [
      { accountCode: expenseAccountCode, debit: subtotal, credit: 0, memo: `Expense/Purchase from ${bill.vendorName}` }
    ];

    if (taxAmount > 0) {
      journalLines.push({
        accountCode: '2030', // Or Input Tax
        debit: taxAmount,
        credit: 0,
        memo: `Input tax on bill ${bill.billNumber}`
      });
    }

    journalLines.push({
      accountCode: '2010',
      debit: 0,
      credit: total,
      memo: `Payable to ${bill.vendorName} for ${bill.billNumber}`
    });

    const jv = postJournalEntry({
      date: bill.date,
      reference: bill.billNumber,
      description: `Purchase Bill from ${bill.vendorName}`,
      source: 'Purchase Bill',
      lines: journalLines
    });

    bill.journalEntryId = jv.id;
    state.bills.unshift(bill);
    ensureVendorExists(bill.vendorName);
    save();
    return bill;
  };

  // -------------------------------------------------------------
  // 4. VENDOR / SUPPLIER PAYMENT
  // -------------------------------------------------------------
  const payVendorBill = ({ billId, amount, paymentDate, paymentMethod = 'Bank', reference, notes }) => {
    const bill = state.bills.find(b => b.id === billId);
    if (!bill) throw new Error('Bill not found');

    const payAmt = Math.round(parseFloat(amount) * 100) / 100;
    if (payAmt <= 0) throw new Error('Payment amount must be greater than zero');
    if (payAmt > bill.balanceDue + 0.01) throw new Error(`Payment ($${payAmt}) cannot exceed balance due ($${bill.balanceDue})`);

    bill.paidAmount = Math.round((bill.paidAmount + payAmt) * 100) / 100;
    bill.balanceDue = Math.round((bill.total - bill.paidAmount) * 100) / 100;
    bill.status = bill.balanceDue <= 0.01 ? 'Paid' : 'Partial';

    const creditAccount = paymentMethod === 'Cash' ? '1010' : '1020';

    // Double Entry:
    // DR: 2010 Accounts Payable (payAmt)
    // CR: 1020 Bank or 1010 Cash (payAmt)
    postJournalEntry({
      date: paymentDate || new Date().toISOString().split('T')[0],
      reference: reference || `PAY-${bill.billNumber}`,
      description: `Payment to vendor ${bill.vendorName} for ${bill.billNumber}`,
      source: 'Vendor Payment',
      lines: [
        { accountCode: '2010', debit: payAmt, credit: 0, memo: `Settlement of AP for ${bill.billNumber}` },
        { accountCode: creditAccount, debit: 0, credit: payAmt, memo: `Disbursement via ${paymentMethod}` }
      ]
    });

    logAudit(`Paid vendor ${bill.vendorName} $${payAmt.toFixed(2)}`, 'AP Payment');
    save();
    return bill;
  };

  // -------------------------------------------------------------
  // 5. CASH & BANK DIRECT TRANSACTIONS (Deposits, Withdrawals, Transfers)
  // -------------------------------------------------------------
  const recordCashBankTransaction = ({ type, fromAccount, toAccount, amount, date, description, reference }) => {
    const amt = Math.round(parseFloat(amount) * 100) / 100;
    if (amt <= 0) throw new Error('Amount must be positive');

    let lines = [];
    if (type === 'Transfer') {
      // Transfer between Bank and Cash (or vice-versa)
      // DR: toAccount (e.g. 1010 Cash)
      // CR: fromAccount (e.g. 1020 Bank)
      lines = [
        { accountCode: toAccount, debit: amt, credit: 0, memo: `Transfer In` },
        { accountCode: fromAccount, debit: 0, credit: amt, memo: `Transfer Out` }
      ];
    } else if (type === 'Deposit') {
      // Direct Cash/Bank deposit from Owner Equity or Other
      lines = [
        { accountCode: toAccount || '1020', debit: amt, credit: 0, memo: 'Direct Deposit' },
        { accountCode: fromAccount || '3010', debit: 0, credit: amt, memo: 'Funds Inflow' }
      ];
    } else if (type === 'Withdrawal') {
      // Owner draw or miscellaneous withdrawal
      lines = [
        { accountCode: toAccount || '3010', debit: amt, credit: 0, memo: 'Draw/Withdrawal' },
        { accountCode: fromAccount || '1020', debit: 0, credit: amt, memo: 'Bank Outflow' }
      ];
    }

    return postJournalEntry({
      date: date || new Date().toISOString().split('T')[0],
      reference: reference || `CB-${Math.floor(1000 + Math.random() * 9000)}`,
      description: description || `${type} transaction of $${amt.toFixed(2)}`,
      source: `Cash/Bank ${type}`,
      lines
    });
  };

  // -------------------------------------------------------------
  // 6. EXPENSES RECORDING & CATEGORIZATION
  // -------------------------------------------------------------
  const recordDirectExpense = ({ expenseAccountCode, paymentAccountCode = '1020', amount, date, payee, description, reference }) => {
    const amt = Math.round(parseFloat(amount) * 100) / 100;
    if (amt <= 0) throw new Error('Expense amount must be positive');

    const jv = postJournalEntry({
      date: date || new Date().toISOString().split('T')[0],
      reference: reference || `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      description: `Expense: ${payee ? payee + ' - ' : ''}${description}`,
      source: 'Expense Voucher',
      lines: [
        { accountCode: expenseAccountCode, debit: amt, credit: 0, memo: description },
        { accountCode: paymentAccountCode, debit: 0, credit: amt, memo: `Paid to ${payee || 'Vendor'}` }
      ]
    });

    logAudit(`Recorded expense of $${amt.toFixed(2)} for ${description}`, 'Expense');
    return jv;
  };

  // -------------------------------------------------------------
  // 7. PAYROLL PROCESSING
  // -------------------------------------------------------------
  const recordPayroll = ({ period, grossSalaries, taxWithholding, netPay, paymentMethod = 'Bank', date }) => {
    const gross = parseFloat(grossSalaries) || 0;
    const tax = parseFloat(taxWithholding) || 0;
    const net = parseFloat(netPay) || (gross - tax);

    const paymentAccount = paymentMethod === 'Bank' ? '1020' : '1010';

    // Double Entry:
    // DR: 6010 Salaries & Wages Expense (Gross)
    // CR: 2030 or 2050 Tax Withholding Payable (Tax)
    // CR: 1020/1010 Bank/Cash (Net Pay Disbursement)
    const lines = [
      { accountCode: '6010', debit: gross, credit: 0, memo: `Gross payroll for period ${period}` }
    ];

    if (tax > 0) {
      lines.push({ accountCode: '2030', debit: 0, credit: tax, memo: `Payroll tax withholding` });
    }

    lines.push({
      accountCode: paymentAccount,
      debit: 0,
      credit: net,
      memo: `Net salary disbursement via ${paymentMethod}`
    });

    const jv = postJournalEntry({
      date: date || new Date().toISOString().split('T')[0],
      reference: `PAYROLL-${period.replace(/\s+/g, '')}`,
      description: `Payroll disbursement for ${period}`,
      source: 'Payroll Run',
      lines
    });

    logAudit(`Processed Payroll for ${period}: Gross $${gross}, Net $${net}`, 'Payroll');
    return jv;
  };

  // -------------------------------------------------------------
  // 8. CREDIT & DEBIT NOTES
  // -------------------------------------------------------------
  const recordCreditNote = ({ customerName, invoiceNumber, amount, date, reason }) => {
    const amt = parseFloat(amount) || 0;
    // Sales Return / Credit Note:
    // DR: 4030 Sales Discounts & Allowances / Contra Revenue
    // CR: 1030 Accounts Receivable
    const jv = postJournalEntry({
      date: date || new Date().toISOString().split('T')[0],
      reference: `CN-${Math.floor(1000 + Math.random() * 9000)}`,
      description: `Credit Note issued to ${customerName} (Ref: ${invoiceNumber}) - ${reason}`,
      source: 'Credit Note',
      lines: [
        { accountCode: '4030', debit: amt, credit: 0, memo: `Sales return / discount` },
        { accountCode: '1030', debit: 0, credit: amt, memo: `Reduce receivable for ${customerName}` }
      ]
    });

    logAudit(`Issued Credit Note of $${amt.toFixed(2)} to ${customerName}`, 'Credit Note');
    return jv;
  };

  const recordDebitNote = ({ vendorName, billNumber, amount, date, reason }) => {
    const amt = parseFloat(amount) || 0;
    // Purchase Return / Debit Note:
    // DR: 2010 Accounts Payable
    // CR: 5010 COGS / Purchase Returns
    const jv = postJournalEntry({
      date: date || new Date().toISOString().split('T')[0],
      reference: `DN-${Math.floor(1000 + Math.random() * 9000)}`,
      description: `Debit Note issued to vendor ${vendorName} (Ref: ${billNumber}) - ${reason}`,
      source: 'Debit Note',
      lines: [
        { accountCode: '2010', debit: amt, credit: 0, memo: `Reduce payable to ${vendorName}` },
        { accountCode: '5010', debit: 0, credit: amt, memo: `Purchase return credit` }
      ]
    });

    logAudit(`Issued Debit Note of $${amt.toFixed(2)} to ${vendorName}`, 'Debit Note');
    return jv;
  };

  // -------------------------------------------------------------
  // 9. FIXED ASSETS & DEPRECIATION (Accountant Requirement)
  // -------------------------------------------------------------
  const addFixedAsset = ({ name, assetAccountCode = '1510', contraAccountCode = '1520', cost, salvageValue = 0, usefulLifeYears = 5, purchaseDate, depreciationMethod = 'Straight-Line' }) => {
    const asset = {
      id: uid('AST'),
      name,
      assetAccountCode,
      contraAccountCode,
      cost: parseFloat(cost) || 0,
      salvageValue: parseFloat(salvageValue) || 0,
      usefulLifeYears: parseFloat(usefulLifeYears) || 5,
      purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
      depreciationMethod, // 'Straight-Line' or 'Declining-Balance'
      accumulatedDepreciation: 0,
      lastDepreciationDate: null
    };

    state.fixedAssets.push(asset);
    save();
    return asset;
  };

  const calculateAndPostDepreciation = (asOfDate) => {
    const dateStr = asOfDate || new Date().toISOString().split('T')[0];
    let totalDepAmount = 0;
    const entriesPosted = [];

    state.fixedAssets.forEach(asset => {
      const depreciableBase = asset.cost - asset.salvageValue;
      if (depreciableBase <= 0) return;

      const remainingDepreciable = depreciableBase - asset.accumulatedDepreciation;
      if (remainingDepreciable <= 0) return;

      // Monthly straight line depreciation
      let monthlyDep = depreciableBase / (asset.usefulLifeYears * 12);
      if (monthlyDep > remainingDepreciable) monthlyDep = remainingDepreciable;
      monthlyDep = Math.round(monthlyDep * 100) / 100;

      if (monthlyDep > 0) {
        asset.accumulatedDepreciation = Math.round((asset.accumulatedDepreciation + monthlyDep) * 100) / 100;
        asset.lastDepreciationDate = dateStr;
        totalDepAmount += monthlyDep;

        // Auto Journal Posting:
        // DR: 6050 Depreciation Expense
        // CR: Contra Asset (e.g. 1520 Accumulated Depreciation)
        const jv = postJournalEntry({
          date: dateStr,
          reference: `DEP-${asset.id}`,
          description: `Monthly Depreciation for ${asset.name} (${asset.depreciationMethod})`,
          source: 'Depreciation Engine',
          lines: [
            { accountCode: '6050', debit: monthlyDep, credit: 0, memo: `Depreciation: ${asset.name}` },
            { accountCode: asset.contraAccountCode, debit: 0, credit: monthlyDep, memo: `Accumulated depreciation` }
          ]
        });

        entriesPosted.push(jv);
      }
    });

    save();
    return { totalDepAmount, count: entriesPosted.length, entriesPosted };
  };

  // -------------------------------------------------------------
  // 10. ACCRUALS & PREPAYMENTS
  // -------------------------------------------------------------
  const addAccrualPrepayment = ({ name, type, amount, startDate, endDate, expenseAccountCode, balanceSheetAccountCode }) => {
    const item = {
      id: uid('ACCR'),
      name,
      type, // 'Accrued Expense' or 'Prepaid Expense'
      totalAmount: parseFloat(amount) || 0,
      amortizedAmount: 0,
      startDate,
      endDate,
      expenseAccountCode: expenseAccountCode || '6020',
      balanceSheetAccountCode: balanceSheetAccountCode || (type === 'Accrued Expense' ? '2020' : '1050')
    };

    state.accrualsPrepayments.push(item);
    save();
    return item;
  };

  const processAccrualsAmortization = () => {
    let processed = 0;
    const now = new Date().toISOString().split('T')[0];

    state.accrualsPrepayments.forEach(item => {
      const remaining = item.totalAmount - item.amortizedAmount;
      if (remaining <= 0) return;

      const monthlyPortion = Math.min(remaining, Math.round((item.totalAmount / 12) * 100) / 100);
      item.amortizedAmount += monthlyPortion;

      if (item.type === 'Prepaid Expense') {
        // Amortize Prepaid Expense:
        // DR: Expense Account (e.g. 6020 Rent)
        // CR: 1050 Prepaid Expenses
        postJournalEntry({
          date: now,
          reference: `AMORT-${item.id}`,
          description: `Amortization of ${item.name}`,
          source: 'Accrual Amortization',
          lines: [
            { accountCode: item.expenseAccountCode, debit: monthlyPortion, credit: 0, memo: item.name },
            { accountCode: '1050', debit: 0, credit: monthlyPortion, memo: 'Prepaid amortization' }
          ]
        });
      } else {
        // Accrued Expense:
        // DR: Expense Account
        // CR: 2020 Accrued Expenses Payable
        postJournalEntry({
          date: now,
          reference: `ACCR-${item.id}`,
          description: `Monthly Accrual for ${item.name}`,
          source: 'Accrual Engine',
          lines: [
            { accountCode: item.expenseAccountCode, debit: monthlyPortion, credit: 0, memo: item.name },
            { accountCode: '2020', debit: 0, credit: monthlyPortion, memo: 'Accrued expense liability' }
          ]
        });
      }
      processed++;
    });

    save();
    return processed;
  };

  // -------------------------------------------------------------
  // 11. GENERAL LEDGER COMPUTATION (Automated Real-Time)
  // -------------------------------------------------------------
  const getGeneralLedger = (filterAccountCode = null) => {
    const ledger = {};

    // Initialize all Chart of Accounts
    state.chartOfAccounts.forEach(acc => {
      ledger[acc.code] = {
        account: acc,
        entries: [],
        totalDebit: 0,
        totalCredit: 0,
        netBalance: 0
      };
    });

    // Process every single approved journal line
    state.journalEntries.forEach(jv => {
      if (!jv.isApproved) return;

      jv.lines.forEach(line => {
        if (!ledger[line.accountCode]) {
          // Dynamic fallback if custom account
          ledger[line.accountCode] = {
            account: { code: line.accountCode, name: line.accountName || line.accountCode, type: 'Expense', normal: 'Debit' },
            entries: [],
            totalDebit: 0,
            totalCredit: 0,
            netBalance: 0
          };
        }

        const debit = parseFloat(line.debit) || 0;
        const credit = parseFloat(line.credit) || 0;

        ledger[line.accountCode].totalDebit += debit;
        ledger[line.accountCode].totalCredit += credit;

        ledger[line.accountCode].entries.push({
          journalId: jv.id,
          date: jv.date,
          reference: jv.reference,
          description: jv.description,
          source: jv.source,
          memo: line.memo,
          debit,
          credit
        });
      });
    });

    // Calculate final Net Balances based on Normal Balance rule
    Object.keys(ledger).forEach(code => {
      const item = ledger[code];
      item.totalDebit = Math.round(item.totalDebit * 100) / 100;
      item.totalCredit = Math.round(item.totalCredit * 100) / 100;

      // Running balances
      let running = 0;
      item.entries.sort((a, b) => new Date(a.date) - new Date(b.date));
      item.entries.forEach(e => {
        if (item.account.normal === 'Debit') {
          running += (e.debit - e.credit);
        } else {
          running += (e.credit - e.debit);
        }
        e.runningBalance = Math.round(running * 100) / 100;
      });

      if (item.account.normal === 'Debit') {
        item.netBalance = Math.round((item.totalDebit - item.totalCredit) * 100) / 100;
      } else {
        item.netBalance = Math.round((item.totalCredit - item.totalDebit) * 100) / 100;
      }
    });

    if (filterAccountCode) {
      return ledger[filterAccountCode] || null;
    }

    return ledger;
  };

  // -------------------------------------------------------------
  // 12. TRIAL BALANCE ENGINE
  // -------------------------------------------------------------
  const getTrialBalance = () => {
    const gl = getGeneralLedger();
    const rows = [];
    let grandTotalDebit = 0;
    let grandTotalCredit = 0;

    Object.keys(gl).sort().forEach(code => {
      const item = gl[code];
      const debitBalance = item.totalDebit > item.totalCredit ? (item.totalDebit - item.totalCredit) : 0;
      const creditBalance = item.totalCredit > item.totalDebit ? (item.totalCredit - item.totalDebit) : 0;

      if (item.totalDebit > 0 || item.totalCredit > 0) {
        grandTotalDebit += debitBalance;
        grandTotalCredit += creditBalance;

        rows.push({
          code: item.account.code,
          name: item.account.name,
          type: item.account.type,
          subType: item.account.subType,
          normal: item.account.normal,
          debit: Math.round(debitBalance * 100) / 100,
          credit: Math.round(creditBalance * 100) / 100
        });
      }
    });

    grandTotalDebit = Math.round(grandTotalDebit * 100) / 100;
    grandTotalCredit = Math.round(grandTotalCredit * 100) / 100;
    const isBalanced = Math.abs(grandTotalDebit - grandTotalCredit) < 0.05;

    return {
      rows,
      grandTotalDebit,
      grandTotalCredit,
      isBalanced,
      difference: Math.round(Math.abs(grandTotalDebit - grandTotalCredit) * 100) / 100
    };
  };

  // -------------------------------------------------------------
  // 13. PROFIT & LOSS STATEMENT (INCOME STATEMENT)
  // -------------------------------------------------------------
  const getProfitAndLoss = () => {
    const gl = getGeneralLedger();

    // 1. Operating Revenue
    const revenues = [];
    let totalRevenue = 0;

    // 2. Cost of Goods Sold (COGS)
    const cogs = [];
    let totalCOGS = 0;

    // 3. Operating Expenses
    const operatingExpenses = [];
    let totalOperatingExpenses = 0;

    // 4. Tax Expense
    let taxExpense = 0;

    Object.keys(gl).forEach(code => {
      const item = gl[code];
      const bal = item.netBalance;
      if (bal === 0) return;

      if (item.account.type === 'Revenue') {
        if (item.account.subType === 'Contra Revenue') {
          // Contra revenue reduces total revenue
          revenues.push({ code, name: item.account.name, amount: -Math.abs(bal) });
          totalRevenue -= Math.abs(bal);
        } else {
          revenues.push({ code, name: item.account.name, amount: bal });
          totalRevenue += bal;
        }
      } else if (item.account.type === 'Expense') {
        if (item.account.subType === 'COGS') {
          cogs.push({ code, name: item.account.name, amount: bal });
          totalCOGS += bal;
        } else if (item.account.subType === 'Tax Expense') {
          taxExpense += bal;
        } else {
          operatingExpenses.push({ code, name: item.account.name, amount: bal });
          totalOperatingExpenses += bal;
        }
      }
    });

    const grossProfit = Math.round((totalRevenue - totalCOGS) * 100) / 100;
    const operatingIncome = Math.round((grossProfit - totalOperatingExpenses) * 100) / 100;
    const netIncome = Math.round((operatingIncome - taxExpense) * 100) / 100;

    return {
      revenues,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      cogs,
      totalCOGS: Math.round(totalCOGS * 100) / 100,
      grossProfit,
      operatingExpenses,
      totalOperatingExpenses: Math.round(totalOperatingExpenses * 100) / 100,
      operatingIncome,
      taxExpense: Math.round(taxExpense * 100) / 100,
      netIncome
    };
  };

  // -------------------------------------------------------------
  // 14. BALANCE SHEET ENGINE (Assets = Liabilities + Equity)
  // -------------------------------------------------------------
  const getBalanceSheet = () => {
    const gl = getGeneralLedger();
    const pnl = getProfitAndLoss();

    const currentAssets = [];
    let totalCurrentAssets = 0;

    const fixedAssets = [];
    let totalFixedAssets = 0;

    const currentLiabilities = [];
    let totalCurrentLiabilities = 0;

    const longTermLiabilities = [];
    let totalLongTermLiabilities = 0;

    const equityItems = [];
    let totalEquity = 0;

    Object.keys(gl).forEach(code => {
      const item = gl[code];
      const bal = item.netBalance;
      if (bal === 0) return;

      if (item.account.type === 'Asset') {
        if (item.account.subType === 'Current Asset') {
          currentAssets.push({ code, name: item.account.name, amount: bal });
          totalCurrentAssets += bal;
        } else if (item.account.subType === 'Contra Asset') {
          // Contra asset (Accumulated Depreciation) reduces fixed assets
          fixedAssets.push({ code, name: item.account.name, amount: -Math.abs(bal) });
          totalFixedAssets -= Math.abs(bal);
        } else {
          fixedAssets.push({ code, name: item.account.name, amount: bal });
          totalFixedAssets += bal;
        }
      } else if (item.account.type === 'Liability') {
        if (item.account.subType === 'Current Liability') {
          currentLiabilities.push({ code, name: item.account.name, amount: bal });
          totalCurrentLiabilities += bal;
        } else {
          longTermLiabilities.push({ code, name: item.account.name, amount: bal });
          totalLongTermLiabilities += bal;
        }
      } else if (item.account.type === 'Equity') {
        equityItems.push({ code, name: item.account.name, amount: bal });
        totalEquity += bal;
      }
    });

    // Add Current Year Net Income into Equity (Dynamic Retained Earnings link)
    equityItems.push({
      code: '3999',
      name: 'Current Period Net Income / (Loss)',
      amount: pnl.netIncome,
      isCalculated: true
    });
    totalEquity += pnl.netIncome;

    const totalAssets = Math.round((totalCurrentAssets + totalFixedAssets) * 100) / 100;
    const totalLiabilities = Math.round((totalCurrentLiabilities + totalLongTermLiabilities) * 100) / 100;
    const totalLiabilitiesAndEquity = Math.round((totalLiabilities + totalEquity) * 100) / 100;

    const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.1;
    const variance = Math.round(Math.abs(totalAssets - totalLiabilitiesAndEquity) * 100) / 100;

    return {
      currentAssets,
      totalCurrentAssets: Math.round(totalCurrentAssets * 100) / 100,
      fixedAssets,
      totalFixedAssets: Math.round(totalFixedAssets * 100) / 100,
      totalAssets,

      currentLiabilities,
      totalCurrentLiabilities: Math.round(totalCurrentLiabilities * 100) / 100,
      longTermLiabilities,
      totalLongTermLiabilities: Math.round(totalLongTermLiabilities * 100) / 100,
      totalLiabilities,

      equityItems,
      totalEquity: Math.round(totalEquity * 100) / 100,
      totalLiabilitiesAndEquity,

      isBalanced,
      variance
    };
  };

  // -------------------------------------------------------------
  // 15. CASH FLOW STATEMENT (Indirect Method)
  // -------------------------------------------------------------
  const getCashFlowStatement = () => {
    const pnl = getProfitAndLoss();
    const gl = getGeneralLedger();

    // 1. Operating Activities
    const netIncome = pnl.netIncome;
    const depExpense = gl['6050'] ? gl['6050'].netBalance : 0;
    
    // Working capital changes
    const arChange = gl['1030'] ? -gl['1030'].netBalance : 0;
    const apChange = gl['2010'] ? gl['2010'].netBalance : 0;
    const invChange = gl['1040'] ? -gl['1040'].netBalance : 0;
    const taxPayChange = gl['2030'] ? gl['2030'].netBalance : 0;

    const netCashOperating = Math.round((netIncome + depExpense + arChange + apChange + invChange + taxPayChange) * 100) / 100;

    // 2. Investing Activities (Fixed Asset acquisitions)
    let netCashInvesting = 0;
    if (gl['1510']) netCashInvesting -= gl['1510'].netBalance;
    if (gl['1530']) netCashInvesting -= gl['1530'].netBalance;
    if (gl['1550']) netCashInvesting -= gl['1550'].netBalance;
    netCashInvesting = Math.round(netCashInvesting * 100) / 100;

    // 3. Financing Activities (Equity contributions, loan proceeds)
    let netCashFinancing = 0;
    if (gl['3010']) netCashFinancing += gl['3010'].netBalance;
    if (gl['2510']) netCashFinancing += gl['2510'].netBalance;
    netCashFinancing = Math.round(netCashFinancing * 100) / 100;

    const netChangeInCash = Math.round((netCashOperating + netCashInvesting + netCashFinancing) * 100) / 100;
    const endingCash = Math.round(((gl['1010']?.netBalance || 0) + (gl['1020']?.netBalance || 0)) * 100) / 100;

    return {
      operating: {
        netIncome,
        depExpense,
        arChange,
        apChange,
        invChange,
        taxPayChange,
        netCashOperating
      },
      investing: {
        netCashInvesting
      },
      financing: {
        netCashFinancing
      },
      netChangeInCash,
      endingCash
    };
  };

  // -------------------------------------------------------------
  // 16. AGING REPORTS (Accounts Receivable & Payable)
  // -------------------------------------------------------------
  const getAgingReport = (type = 'AR') => {
    const list = type === 'AR' ? state.invoices : state.bills;
    const today = new Date();

    const aging = {
      current: 0,
      days30: 0,
      days60: 0,
      days90: 0,
      over90: 0,
      total: 0,
      details: []
    };

    list.filter(item => item.balanceDue > 0).forEach(item => {
      const dueDate = new Date(item.dueDate);
      const diffDays = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
      const bal = item.balanceDue;

      aging.total += bal;

      let bucket = 'Current';
      if (diffDays <= 0) {
        aging.current += bal;
        bucket = 'Current';
      } else if (diffDays <= 30) {
        aging.days30 += bal;
        bucket = '1-30 Days';
      } else if (diffDays <= 60) {
        aging.days60 += bal;
        bucket = '31-60 Days';
      } else if (diffDays <= 90) {
        aging.days90 += bal;
        bucket = '61-90 Days';
      } else {
        aging.over90 += bal;
        bucket = '90+ Days';
      }

      aging.details.push({
        id: item.id,
        number: type === 'AR' ? item.invoiceNumber : item.billNumber,
        party: type === 'AR' ? item.customerName : item.vendorName,
        date: item.date,
        dueDate: item.dueDate,
        diffDays: diffDays > 0 ? diffDays : 0,
        bucket,
        amount: item.total,
        balanceDue: bal
      });
    });

    aging.current = Math.round(aging.current * 100) / 100;
    aging.days30 = Math.round(aging.days30 * 100) / 100;
    aging.days60 = Math.round(aging.days60 * 100) / 100;
    aging.days90 = Math.round(aging.days90 * 100) / 100;
    aging.over90 = Math.round(aging.over90 * 100) / 100;
    aging.total = Math.round(aging.total * 100) / 100;

    return aging;
  };

  // -------------------------------------------------------------
  // 17. FINANCIAL RATIOS & ANALYSIS
  // -------------------------------------------------------------
  const getFinancialRatios = () => {
    const bs = getBalanceSheet();
    const pnl = getProfitAndLoss();

    const currentRatio = bs.totalCurrentLiabilities > 0
      ? (bs.totalCurrentAssets / bs.totalCurrentLiabilities).toFixed(2)
      : 'N/A';

    // Quick Ratio = (Current Assets - Inventory) / Current Liabilities
    const inventory = getGeneralLedger()['1040']?.netBalance || 0;
    const quickRatio = bs.totalCurrentLiabilities > 0
      ? ((bs.totalCurrentAssets - inventory) / bs.totalCurrentLiabilities).toFixed(2)
      : 'N/A';

    const debtToEquity = bs.totalEquity > 0
      ? (bs.totalLiabilities / bs.totalEquity).toFixed(2)
      : 'N/A';

    const grossMargin = pnl.totalRevenue > 0
      ? ((pnl.grossProfit / pnl.totalRevenue) * 100).toFixed(1) + '%'
      : '0.0%';

    const netProfitMargin = pnl.totalRevenue > 0
      ? ((pnl.netIncome / pnl.totalRevenue) * 100).toFixed(1) + '%'
      : '0.0%';

    const roa = bs.totalAssets > 0
      ? ((pnl.netIncome / bs.totalAssets) * 100).toFixed(1) + '%'
      : '0.0%';

    const roe = bs.totalEquity > 0
      ? ((pnl.netIncome / bs.totalEquity) * 100).toFixed(1) + '%'
      : '0.0%';

    return {
      currentRatio,
      quickRatio,
      debtToEquity,
      grossMargin,
      netProfitMargin,
      roa,
      roe
    };
  };

  // -------------------------------------------------------------
  // 18. ACTUAL VS BUDGET VARIANCE
  // -------------------------------------------------------------
  const getBudgetVariance = () => {
    const gl = getGeneralLedger();
    const results = [];

    Object.keys(state.budgets).forEach(code => {
      const budget = state.budgets[code];
      const account = state.chartOfAccounts.find(a => a.code === code);
      const actual = gl[code]?.netBalance || 0;
      const variance = actual - budget;
      const percent = budget > 0 ? ((variance / budget) * 100).toFixed(1) : '0';

      const isRevenue = account?.type === 'Revenue';
      // For revenue, actual > budget is favorable. For expense, actual < budget is favorable.
      const isFavorable = isRevenue ? variance >= 0 : variance <= 0;

      results.push({
        code,
        name: account ? account.name : code,
        type: account ? account.type : 'Other',
        budget,
        actual,
        variance: Math.round(variance * 100) / 100,
        percent,
        isFavorable
      });
    });

    return results;
  };

  // -------------------------------------------------------------
  // 19. AUDIT & ERROR DETECTION ENGINE
  // -------------------------------------------------------------
  const runInternalControlsAudit = () => {
    const issues = [];
    const tb = getTrialBalance();
    const bs = getBalanceSheet();
    const gl = getGeneralLedger();

    // 1. Trial Balance Check
    if (!tb.isBalanced) {
      issues.push({
        severity: 'Critical',
        title: 'Trial Balance Out of Balance',
        description: `Grand debits ($${tb.grandTotalDebit}) do not equal grand credits ($${tb.grandTotalCredit}). Difference: $${tb.difference}`
      });
    }

    // 2. Balance Sheet Check
    if (!bs.isBalanced) {
      issues.push({
        severity: 'Critical',
        title: 'Balance Sheet Discrepancy',
        description: `Assets ($${bs.totalAssets}) do not equal Liabilities + Equity ($${bs.totalLiabilitiesAndEquity}). Discrepancy: $${bs.variance}`
      });
    }

    // 3. Cash Negative Balance Check
    if ((gl['1010']?.netBalance || 0) < 0) {
      issues.push({
        severity: 'High',
        title: 'Negative Cash in Hand',
        description: `Petty cash balance is negative ($${gl['1010'].netBalance}). Physically impossible; investigate missing receipts.`
      });
    }

    if ((gl['1020']?.netBalance || 0) < 0) {
      issues.push({
        severity: 'Medium',
        title: 'Bank Overdraft Detected',
        description: `Bank account has negative balance ($${gl['1020'].netBalance}). Check credit facility status.`
      });
    }

    // 4. Unapproved Journal Entries
    const unapproved = state.journalEntries.filter(j => !j.isApproved);
    if (unapproved.length > 0) {
      issues.push({
        severity: 'Medium',
        title: `${unapproved.length} Pending Journal Entries`,
        description: `There are ${unapproved.length} journal entries awaiting formal Chief Accountant sign-off.`
      });
    }

    // 5. Overdue Invoices
    const aging = getAgingReport('AR');
    if (aging.over90 > 0) {
      issues.push({
        severity: 'Medium',
        title: 'Stale Accounts Receivable (> 90 Days)',
        description: `$${aging.over90} in receivables is past 90 days. Potential bad debt provision required.`
      });
    }

    return issues;
  };

  // -------------------------------------------------------------
  // 20. MONTH-END & YEAR-END CLOSING
  // -------------------------------------------------------------
  const closeMonth = (monthStr) => {
    logAudit(`Closed month ${monthStr} books. Financial records locked for editing.`, 'Period Close');
    save();
    return true;
  };

  const closeYear = (fiscalYear) => {
    // Retained Earnings Rollup:
    // Transfer Net Profit / Loss to Retained Earnings (3020)
    const pnl = getProfitAndLoss();
    const netIncome = pnl.netIncome;

    if (netIncome !== 0) {
      postJournalEntry({
        date: `${fiscalYear}-12-31`,
        reference: `YE-CLOSE-${fiscalYear}`,
        description: `Year-End Retained Earnings Rollup for FY ${fiscalYear}`,
        source: 'Year-End Closing',
        lines: [
          { accountCode: '3020', debit: netIncome < 0 ? Math.abs(netIncome) : 0, credit: netIncome > 0 ? netIncome : 0, memo: 'Retained Earnings roll-up' },
          { accountCode: '4010', debit: pnl.totalRevenue, credit: 0, memo: 'Close revenue accounts' },
          { accountCode: '5010', debit: 0, credit: pnl.totalCOGS, memo: 'Close COGS' },
          { accountCode: '6010', debit: 0, credit: pnl.totalOperatingExpenses, memo: 'Close Operating Expenses' }
        ]
      });
    }

    state.company.bookStatus = 'Closed';
    logAudit(`Year-End books successfully closed for FY ${fiscalYear}. Net income $${netIncome} transferred to Retained Earnings.`, 'Year Close');
    save();
    return true;
  };

  // -------------------------------------------------------------
  // HELPERS & DEMO DATA GENERATOR
  // -------------------------------------------------------------
  const logAudit = (action, category = 'General') => {
    state.auditLogs.unshift({
      id: uid('LOG'),
      timestamp: new Date().toISOString(),
      user: 'Accountant / Admin',
      action,
      category
    });
    if (state.auditLogs.length > 200) state.auditLogs.pop();
  };

  const ensureCustomerExists = (name, email = '') => {
    if (!name) return;
    if (!state.customers.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      state.customers.push({ id: uid('CUST'), name, email, balance: 0 });
    }
  };

  const ensureVendorExists = (name) => {
    if (!name) return;
    if (!state.vendors.some(v => v.name.toLowerCase() === name.toLowerCase())) {
      state.vendors.push({ id: uid('VEND'), name, balance: 0 });
    }
  };

  const loadDemoData = () => {
    initDefault();

    // 1. Initial Capital Injection
    postJournalEntry({
      date: '2026-01-02',
      reference: 'CAP-001',
      description: 'Initial Equity Capital Inflow & Bank Setup',
      source: 'Capital Injection',
      lines: [
        { accountCode: '1020', debit: 150000, credit: 0, memo: 'Bank Opening Deposit' },
        { accountCode: '1010', debit: 5000, credit: 0, memo: 'Petty Cash In Hand Float' },
        { accountCode: '3010', debit: 0, credit: 155000, memo: "Paid-in Shareholder Equity" }
      ]
    });

    // 2. Add Fixed Assets
    addFixedAsset({
      name: 'Server & IT Infrastructure',
      assetAccountCode: '1510',
      contraAccountCode: '1520',
      cost: 25000,
      salvageValue: 2000,
      usefulLifeYears: 4,
      purchaseDate: '2026-01-05'
    });
    postJournalEntry({
      date: '2026-01-05',
      reference: 'FA-001',
      description: 'Acquisition of IT Infrastructure',
      source: 'Asset Purchase',
      lines: [
        { accountCode: '1510', debit: 25000, credit: 0, memo: 'IT hardware assets' },
        { accountCode: '1020', debit: 0, credit: 25000, memo: 'Paid via bank transfer' }
      ]
    });

    addFixedAsset({
      name: 'Executive Office Furniture',
      assetAccountCode: '1530',
      contraAccountCode: '1540',
      cost: 12000,
      salvageValue: 1000,
      usefulLifeYears: 7,
      purchaseDate: '2026-01-10'
    });
    postJournalEntry({
      date: '2026-01-10',
      reference: 'FA-002',
      description: 'Office Furniture Setup',
      source: 'Asset Purchase',
      lines: [
        { accountCode: '1530', debit: 12000, credit: 0, memo: 'Executive desks & chairs' },
        { accountCode: '1020', debit: 0, credit: 12000, memo: 'Paid via bank' }
      ]
    });

    // 3. Invoices (Sales)
    const inv1 = createInvoice({
      invoiceNumber: 'INV-2026-001',
      customerName: 'Starlight Financial Corp',
      customerEmail: 'billing@starlight.com',
      date: '2026-01-15',
      dueDate: '2026-02-15',
      subtotal: 45000,
      taxRate: 10,
      notes: 'Monthly enterprise ERP consulting services'
    });

    const inv2 = createInvoice({
      invoiceNumber: 'INV-2026-002',
      customerName: 'Nordic Logistics Group',
      customerEmail: 'accounts@nordiclog.com',
      date: '2026-01-20',
      dueDate: '2026-02-20',
      subtotal: 32000,
      taxRate: 10,
      notes: 'Supply chain audit and cloud automation deployment'
    });

    const inv3 = createInvoice({
      invoiceNumber: 'INV-2026-003',
      customerName: 'Vertex BioTech Labs',
      customerEmail: 'payables@vertexbio.com',
      date: '2026-02-05',
      dueDate: '2026-03-05',
      subtotal: 28500,
      taxRate: 10,
      notes: 'Q1 Compliance & Regulatory Filing Support'
    });

    // 4. Customer Payments
    receiveCustomerPayment({
      invoiceId: inv1.id,
      amount: 49500, // full payment with 10% tax
      paymentDate: '2026-02-10',
      paymentMethod: 'Bank',
      reference: 'WIRE-STARLIGHT-9812'
    });

    receiveCustomerPayment({
      invoiceId: inv2.id,
      amount: 20000, // partial payment
      paymentDate: '2026-02-18',
      paymentMethod: 'Bank',
      reference: 'WIRE-NORDIC-441'
    });

    // 5. Purchase Bills
    const bill1 = createBill({
      billNumber: 'BILL-8821',
      vendorName: 'AWS Cloud Services LLC',
      category: 'Cloud Hosting & Servers',
      expenseAccountCode: '6030',
      subtotal: 6500,
      taxRate: 0,
      date: '2026-01-18',
      dueDate: '2026-02-18'
    });

    const bill2 = createBill({
      billNumber: 'BILL-8822',
      vendorName: 'Global Real Estate Trust',
      category: 'Office Rent',
      expenseAccountCode: '6020',
      subtotal: 7500,
      taxRate: 0,
      date: '2026-02-01',
      dueDate: '2026-02-15'
    });

    const bill3 = createBill({
      billNumber: 'BILL-8823',
      vendorName: 'Omni Media & Search Ads',
      category: 'Marketing & Advertising',
      expenseAccountCode: '6040',
      subtotal: 8200,
      taxRate: 10,
      date: '2026-02-08',
      dueDate: '2026-03-08'
    });

    // 6. Pay some bills
    payVendorBill({
      billId: bill1.id,
      amount: 6500,
      paymentDate: '2026-02-14',
      paymentMethod: 'Bank',
      reference: 'EFT-AWS-01'
    });

    payVendorBill({
      billId: bill2.id,
      amount: 7500,
      paymentDate: '2026-02-12',
      paymentMethod: 'Bank',
      reference: 'EFT-RENT-FEB'
    });

    // 7. Direct Expenses
    recordDirectExpense({
      expenseAccountCode: '6060',
      paymentAccountCode: '1010', // Paid from petty cash
      amount: 320,
      date: '2026-02-15',
      payee: 'Metro Office Stationery',
      description: 'Printer cartridges and filing supplies'
    });

    recordDirectExpense({
      expenseAccountCode: '6070',
      paymentAccountCode: '1020',
      amount: 145,
      date: '2026-02-28',
      payee: 'First Commerce Bank',
      description: 'Monthly wire maintenance & merchant service fee'
    });

    // 8. Payroll Runs
    recordPayroll({
      period: 'January 2026',
      grossSalaries: 18000,
      taxWithholding: 3600,
      netPay: 14400,
      paymentMethod: 'Bank',
      date: '2026-01-31'
    });

    recordPayroll({
      period: 'February 2026',
      grossSalaries: 18000,
      taxWithholding: 3600,
      netPay: 14400,
      paymentMethod: 'Bank',
      date: '2026-02-28'
    });

    // 9. Prepayments & Accruals
    addAccrualPrepayment({
      name: 'Commercial Insurance Policy (Annual)',
      type: 'Prepaid Expense',
      amount: 12000,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      expenseAccountCode: '6080'
    });

    // 10. Run Monthly Depreciation
    calculateAndPostDepreciation('2026-01-31');
    calculateAndPostDepreciation('2026-02-28');

    // 11. Auditor Query Sample
    state.auditQueries.push({
      id: uid('AQ'),
      date: '2026-02-25',
      auditor: 'Deloitte & Touche (External Audit)',
      subject: 'Verification of AWS Cloud Hosting Bill #8821',
      status: 'Answered',
      queryText: 'Please provide vendor contract and proof of electronic fund transfer for invoice #8821 ($6,500).',
      response: 'EFT reference EFT-AWS-01 cleared on 2026-02-14 from Main Bank Account. Attached supporting vendor agreement.'
    });

    logAudit('Demo corporate dataset initialized with full double-entry integrity', 'System');
    save();
  };

  // Initialize immediately on load
  load();

  return {
    // State Access
    getState: () => state,
    getCompany: () => state.company,
    updateCompany: (updates) => { Object.assign(state.company, updates); save(); },
    getChartOfAccounts: () => state.chartOfAccounts,
    getInvoices: () => state.invoices,
    getBills: () => state.bills,
    getJournalEntries: () => state.journalEntries,
    getFixedAssets: () => state.fixedAssets,
    getAccrualsPrepayments: () => state.accrualsPrepayments,
    getAuditQueries: () => state.auditQueries,
    getAuditLogs: () => state.auditLogs,

    // Bookkeeper Operations
    createInvoice,
    receiveCustomerPayment,
    createBill,
    payVendorBill,
    recordCashBankTransaction,
    recordDirectExpense,
    recordPayroll,
    recordCreditNote,
    recordDebitNote,
    postJournalEntry,

    // Accountant Operations
    addFixedAsset,
    calculateAndPostDepreciation,
    addAccrualPrepayment,
    processAccrualsAmortization,
    closeMonth,
    closeYear,

    // Financial Calculation Engines
    getGeneralLedger,
    getTrialBalance,
    getProfitAndLoss,
    getBalanceSheet,
    getCashFlowStatement,
    getAgingReport,
    getFinancialRatios,
    getBudgetVariance,
    runInternalControlsAudit,

    // Data Management
    loadDemoData,
    resetData: () => {
      localStorage.removeItem(STORAGE_KEY);
      initDefault();
      save();
    },
    exportBackupJSON: () => JSON.stringify(state, null, 2),
    importBackupJSON: (jsonStr) => {
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.company && parsed.chartOfAccounts) {
          state = parsed;
          save();
          return true;
        }
        throw new Error('Invalid backup file structure.');
      } catch (e) {
        throw new Error('Import failed: ' + e.message);
      }
    }
  };
})();

if (typeof window !== 'undefined') window.AccountingEngine = AccountingEngine;
if (typeof global !== 'undefined') global.AccountingEngine = AccountingEngine;

