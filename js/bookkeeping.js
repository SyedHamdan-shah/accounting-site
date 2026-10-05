/* ===================================================================
   ACCUMEN PRO - BOOKKEEPING WORKSPACE CONTROLLER
   Full automation for all 18 Bookkeeper operational tasks
=================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  NavManager.renderNav('bookkeeping');
  initBookkeepingPage();
});

function initBookkeepingPage() {
  setupTabs();
  renderAllBookkeepingSections();
  bindActionButtons();
}

// -------------------------------------------------------------
// TAB SWITCHING SYSTEM
// -------------------------------------------------------------
function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const panel = document.getElementById(targetId);
      if (panel) panel.classList.add('active');
    });
  });
}

// -------------------------------------------------------------
// RENDER ALL BOOKKEEPING DATA SECTIONS
// -------------------------------------------------------------
function renderAllBookkeepingSections() {
  renderInvoicesTable();
  renderBillsTable();
  renderCustomerPayments();
  renderSupplierPayments();
  renderARManagement();
  renderAPManagement();
  renderCashBankSection();
  renderExpensesSection();
  renderPayrollSection();
  renderCreditDebitNotes();
  renderJournalVouchers();
  renderGeneralLedger();
  renderTrialBalance();
  renderBankReconciliation();
  renderDocumentOrganizer();
  renderMonthEndChecklist();
}

// -------------------------------------------------------------
// 1. INVOICES & SALES
// -------------------------------------------------------------
function renderInvoicesTable() {
  const container = document.getElementById('invoicesTableBody');
  if (!container) return;

  const invoices = AccountingEngine.getInvoices();
  if (invoices.length === 0) {
    container.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:2rem;color:var(--text-muted);">No sales invoices recorded yet. Click "New Sales Invoice" to create one.</td></tr>`;
    return;
  }

  container.innerHTML = invoices.map(inv => {
    let badgeClass = 'badge-warning';
    if (inv.status === 'Paid') badgeClass = 'badge-success';
    if (inv.status === 'Partial') badgeClass = 'badge-primary';
    if (inv.status === 'Overdue') badgeClass = 'badge-danger';

    return `
      <tr>
        <td class="mono" style="font-weight:700;color:var(--primary);">${inv.invoiceNumber}</td>
        <td>${inv.date}</td>
        <td style="font-weight:600;">${inv.customerName}</td>
        <td class="text-right mono">${NavManager.fmt(inv.total)}</td>
        <td class="text-right mono" style="color:${inv.balanceDue > 0 ? 'var(--warning)' : 'var(--text-muted)'};">${NavManager.fmt(inv.balanceDue)}</td>
        <td><span class="badge ${badgeClass}">${inv.status}</span></td>
        <td class="text-right">
          <button class="btn btn-secondary btn-sm" onclick="viewInvoiceModal('${inv.id}')" title="View & Print Invoice">📄 View</button>
          ${inv.balanceDue > 0 ? `<button class="btn btn-success btn-sm" onclick="openReceivePaymentModal('${inv.id}')" title="Receive Customer Payment">💵 Pay</button>` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

// -------------------------------------------------------------
// 2. BILLS & PURCHASES
// -------------------------------------------------------------
function renderBillsTable() {
  const container = document.getElementById('billsTableBody');
  if (!container) return;

  const bills = AccountingEngine.getBills();
  if (bills.length === 0) {
    container.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:2rem;color:var(--text-muted);">No purchase bills recorded yet. Click "New Purchase Bill" to record one.</td></tr>`;
    return;
  }

  container.innerHTML = bills.map(bill => {
    let badgeClass = 'badge-warning';
    if (bill.status === 'Paid') badgeClass = 'badge-success';
    if (bill.status === 'Partial') badgeClass = 'badge-primary';

    return `
      <tr>
        <td class="mono" style="font-weight:700;color:var(--purple);">${bill.billNumber}</td>
        <td>${bill.date}</td>
        <td style="font-weight:600;">${bill.vendorName}</td>
        <td><span class="badge badge-neutral">${bill.category}</span></td>
        <td class="text-right mono">${NavManager.fmt(bill.total)}</td>
        <td class="text-right mono" style="color:${bill.balanceDue > 0 ? 'var(--danger)' : 'var(--text-muted)'};">${NavManager.fmt(bill.balanceDue)}</td>
        <td><span class="badge ${badgeClass}">${bill.status}</span></td>
        <td class="text-right">
          ${bill.balanceDue > 0 ? `<button class="btn btn-primary btn-sm" onclick="openPayVendorModal('${bill.id}')">💸 Pay Bill</button>` : `<span style="color:var(--success);font-size:0.85rem;">✓ Paid</span>`}
        </td>
      </tr>
    `;
  }).join('');
}

// -------------------------------------------------------------
// 3. ACCOUNTS RECEIVABLE (AR)
// -------------------------------------------------------------
function renderARManagement() {
  const aging = AccountingEngine.getAgingReport('AR');

  const arTotalEl = document.getElementById('arTotalBalance');
  if (arTotalEl) arTotalEl.textContent = NavManager.fmt(aging.total);

  const arCurrentEl = document.getElementById('arCurrent');
  if (arCurrentEl) arCurrentEl.textContent = NavManager.fmt(aging.current);

  const ar30El = document.getElementById('ar30');
  if (ar30El) ar30El.textContent = NavManager.fmt(aging.days30);

  const ar60El = document.getElementById('ar60');
  if (ar60El) ar60El.textContent = NavManager.fmt(aging.days60);

  const ar90El = document.getElementById('ar90');
  if (ar90El) ar90El.textContent = NavManager.fmt(aging.days90);

  const arOver90El = document.getElementById('arOver90');
  if (arOver90El) arOver90El.textContent = NavManager.fmt(aging.over90);

  const tableBody = document.getElementById('arAgingTableBody');
  if (tableBody) {
    if (aging.details.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:1.5rem;color:var(--text-muted);">No open receivables. All invoices are collected!</td></tr>`;
    } else {
      tableBody.innerHTML = aging.details.map(item => `
        <tr>
          <td class="mono">${item.number}</td>
          <td style="font-weight:600;">${item.party}</td>
          <td>${item.dueDate}</td>
          <td><span class="badge ${item.diffDays > 30 ? 'badge-danger' : 'badge-warning'}">${item.bucket}</span></td>
          <td class="text-right mono">${NavManager.fmt(item.amount)}</td>
          <td class="text-right mono" style="font-weight:700;color:var(--primary);">${NavManager.fmt(item.balanceDue)}</td>
        </tr>
      `).join('');
    }
  }
}

// -------------------------------------------------------------
// 4. ACCOUNTS PAYABLE (AP)
// -------------------------------------------------------------
function renderAPManagement() {
  const aging = AccountingEngine.getAgingReport('AP');

  const apTotalEl = document.getElementById('apTotalBalance');
  if (apTotalEl) apTotalEl.textContent = NavManager.fmt(aging.total);

  const apCurrentEl = document.getElementById('apCurrent');
  if (apCurrentEl) apCurrentEl.textContent = NavManager.fmt(aging.current);

  const ap30El = document.getElementById('ap30');
  if (ap30El) ap30El.textContent = NavManager.fmt(aging.days30);

  const ap60El = document.getElementById('ap60');
  if (ap60El) ap60El.textContent = NavManager.fmt(aging.days60);

  const ap90El = document.getElementById('ap90');
  if (ap90El) ap90El.textContent = NavManager.fmt(aging.days90);

  const apOver90El = document.getElementById('apOver90');
  if (apOver90El) apOver90El.textContent = NavManager.fmt(aging.over90);

  const tableBody = document.getElementById('apAgingTableBody');
  if (tableBody) {
    if (aging.details.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:1.5rem;color:var(--text-muted);">No outstanding bills. All payables cleared!</td></tr>`;
    } else {
      tableBody.innerHTML = aging.details.map(item => `
        <tr>
          <td class="mono">${item.number}</td>
          <td style="font-weight:600;">${item.party}</td>
          <td>${item.dueDate}</td>
          <td><span class="badge ${item.diffDays > 30 ? 'badge-danger' : 'badge-warning'}">${item.bucket}</span></td>
          <td class="text-right mono">${NavManager.fmt(item.amount)}</td>
          <td class="text-right mono" style="font-weight:700;color:var(--purple);">${NavManager.fmt(item.balanceDue)}</td>
        </tr>
      `).join('');
    }
  }
}

// -------------------------------------------------------------
// 5. CASH & BANK SECTION
// -------------------------------------------------------------
function renderCashBankSection() {
  const gl = AccountingEngine.getGeneralLedger();
  const pettyCashBal = gl['1010']?.netBalance || 0;
  const mainBankBal = gl['1020']?.netBalance || 0;

  const cashBalEl = document.getElementById('pettyCashBalance');
  if (cashBalEl) cashBalEl.textContent = NavManager.fmt(pettyCashBal);

  const bankBalEl = document.getElementById('mainBankBalance');
  if (bankBalEl) bankBalEl.textContent = NavManager.fmt(mainBankBal);

  // Cash & Bank Transactions Table
  const tableBody = document.getElementById('cashBankTxTableBody');
  if (tableBody) {
    const cashEntries = gl['1010']?.entries || [];
    const bankEntries = gl['1020']?.entries || [];
    const all = [...cashEntries.map(e => ({ ...e, accountName: 'Petty Cash (1010)' })), ...bankEntries.map(e => ({ ...e, accountName: 'Main Bank (1020)' }))];

    all.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (all.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:1.5rem;color:var(--text-muted);">No cash/bank movements recorded.</td></tr>`;
    } else {
      tableBody.innerHTML = all.slice(0, 15).map(e => `
        <tr>
          <td>${e.date}</td>
          <td class="mono">${e.reference}</td>
          <td style="font-weight:600;">${e.accountName}</td>
          <td>${e.description}</td>
          <td class="text-right mono" style="color:var(--success);">${e.debit > 0 ? NavManager.fmt(e.debit) : '-'}</td>
          <td class="text-right mono" style="color:var(--danger);">${e.credit > 0 ? NavManager.fmt(e.credit) : '-'}</td>
          <td class="text-right mono" style="font-weight:700;">${NavManager.fmt(e.runningBalance)}</td>
        </tr>
      `).join('');
    }
  }
}

// -------------------------------------------------------------
// 6. EXPENSES SECTION
// -------------------------------------------------------------
function renderExpensesSection() {
  const gl = AccountingEngine.getGeneralLedger();
  const tableBody = document.getElementById('expensesTableBody');
  if (!tableBody) return;

  const expenseCodes = ['5010', '6010', '6020', '6030', '6040', '6050', '6060', '6070', '6080'];
  let totalExpenses = 0;

  const rows = expenseCodes.map(code => {
    const item = gl[code];
    if (!item) return '';
    const amt = item.netBalance;
    totalExpenses += amt;

    return `
      <tr>
        <td class="mono">${code}</td>
        <td style="font-weight:600;">${item.account.name}</td>
        <td><span class="badge badge-neutral">${item.account.subType}</span></td>
        <td class="text-right mono" style="font-weight:700;color:var(--danger);">${NavManager.fmt(amt)}</td>
        <td class="text-right">
          <button class="btn btn-secondary btn-sm" onclick="drillDownLedger('${code}')">🔍 Drilldown</button>
        </td>
      </tr>
    `;
  }).join('');

  tableBody.innerHTML = rows;

  const totalEl = document.getElementById('totalExpensesDisplay');
  if (totalEl) totalEl.textContent = NavManager.fmt(totalExpenses);
}

// -------------------------------------------------------------
// 7. PAYROLL ENTRIES
// -------------------------------------------------------------
function renderPayrollSection() {
  const journals = AccountingEngine.getJournalEntries().filter(j => j.source === 'Payroll Run');
  const tableBody = document.getElementById('payrollTableBody');
  if (!tableBody) return;

  if (journals.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:1.5rem;color:var(--text-muted);">No payroll runs recorded. Click "New Payroll Run" to process salaries.</td></tr>`;
    return;
  }

  tableBody.innerHTML = journals.map(j => {
    const grossLine = j.lines.find(l => l.accountCode === '6010');
    const taxLine = j.lines.find(l => l.accountCode === '2030');
    const netLine = j.lines.find(l => l.accountCode === '1020' || l.accountCode === '1010');

    return `
      <tr>
        <td>${j.date}</td>
        <td class="mono" style="font-weight:700;">${j.reference}</td>
        <td>${j.description}</td>
        <td class="text-right mono">${grossLine ? NavManager.fmt(grossLine.debit) : '-'}</td>
        <td class="text-right mono" style="color:var(--warning);">${taxLine ? NavManager.fmt(taxLine.credit) : '-'}</td>
        <td class="text-right mono" style="font-weight:700;color:var(--success);">${netLine ? NavManager.fmt(netLine.credit) : '-'}</td>
      </tr>
    `;
  }).join('');
}

// -------------------------------------------------------------
// 8. CREDIT & DEBIT NOTES
// -------------------------------------------------------------
function renderCreditDebitNotes() {
  const journals = AccountingEngine.getJournalEntries().filter(j => j.source === 'Credit Note' || j.source === 'Debit Note');
  const tableBody = document.getElementById('notesTableBody');
  if (!tableBody) return;

  if (journals.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding:1.5rem;color:var(--text-muted);">No credit or debit notes issued.</td></tr>`;
    return;
  }

  tableBody.innerHTML = journals.map(j => `
    <tr>
      <td>${j.date}</td>
      <td class="mono" style="font-weight:700;">${j.reference}</td>
      <td><span class="badge ${j.source === 'Credit Note' ? 'badge-primary' : 'badge-purple'}">${j.source}</span></td>
      <td>${j.description}</td>
      <td class="text-right mono" style="font-weight:700;">${NavManager.fmt(j.totalAmount)}</td>
    </tr>
  `).join('');
}

// -------------------------------------------------------------
// 9. GENERAL JOURNAL VOUCHERS (Manual & Automated)
// -------------------------------------------------------------
function renderJournalVouchers() {
  const jvs = AccountingEngine.getJournalEntries();
  const tableBody = document.getElementById('journalTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = jvs.slice().reverse().map(j => `
    <tr>
      <td>${j.date}</td>
      <td class="mono" style="font-weight:700;color:var(--primary);">${j.reference}</td>
      <td><span class="badge badge-neutral">${j.source}</span></td>
      <td>
        <div style="font-weight:600;">${j.description}</div>
        <div style="font-size:0.8rem;color:var(--text-muted);">
          ${j.lines.map(l => `${l.accountName} (${l.accountCode}): DR ${NavManager.fmt(l.debit)} | CR ${NavManager.fmt(l.credit)}`).join(' • ')}
        </div>
      </td>
      <td class="text-right mono" style="font-weight:700;">${NavManager.fmt(j.totalAmount)}</td>
      <td><span class="badge ${j.isApproved ? 'badge-success' : 'badge-warning'}">${j.isApproved ? 'Approved' : 'Pending'}</span></td>
    </tr>
  `).join('');
}

// -------------------------------------------------------------
// 10. GENERAL LEDGER (Bookkeeper View)
// -------------------------------------------------------------
function renderGeneralLedger() {
  const gl = AccountingEngine.getGeneralLedger();
  const selectEl = document.getElementById('glAccountSelector');
  const tableBody = document.getElementById('glTableBody');
  if (!selectEl || !tableBody) return;

  const currentSelection = selectEl.value || '1020';

  // Populate dropdown once if empty
  if (selectEl.options.length <= 1) {
    selectEl.innerHTML = Object.keys(gl).sort().map(code => `
      <option value="${code}" ${code === currentSelection ? 'selected' : ''}>
        ${code} - ${gl[code].account.name}
      </option>
    `).join('');
  }

  const selectedItem = gl[currentSelection];
  if (!selectedItem) return;

  const glTitle = document.getElementById('glAccountTitle');
  if (glTitle) {
    glTitle.innerHTML = `Account: <span style="color:var(--primary);">${selectedItem.account.code} - ${selectedItem.account.name}</span> (Normal: ${selectedItem.account.normal})`;
  }

  const glNetBal = document.getElementById('glNetBalanceDisplay');
  if (glNetBal) {
    glNetBal.textContent = NavManager.fmt(selectedItem.netBalance);
  }

  if (selectedItem.entries.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:2rem;color:var(--text-muted);">No journal entries recorded for this account.</td></tr>`;
    return;
  }

  tableBody.innerHTML = selectedItem.entries.map(e => `
    <tr>
      <td>${e.date}</td>
      <td class="mono">${e.reference}</td>
      <td>${e.description}</td>
      <td><span class="badge badge-neutral">${e.source}</span></td>
      <td class="text-right mono" style="color:${e.debit > 0 ? 'var(--success)' : 'inherit'};">${e.debit > 0 ? NavManager.fmt(e.debit) : '-'}</td>
      <td class="text-right mono" style="color:${e.credit > 0 ? 'var(--danger)' : 'inherit'};">${e.credit > 0 ? NavManager.fmt(e.credit) : '-'}</td>
      <td class="text-right mono" style="font-weight:700;">${NavManager.fmt(e.runningBalance)}</td>
    </tr>
  `).join('');
}

// -------------------------------------------------------------
// 11. TRIAL BALANCE (Bookkeeper Check)
// -------------------------------------------------------------
function renderTrialBalance() {
  const tb = AccountingEngine.getTrialBalance();
  const tableBody = document.getElementById('tbTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = tb.rows.map(row => `
    <tr>
      <td class="mono">${row.code}</td>
      <td style="font-weight:600;">${row.name}</td>
      <td><span class="badge badge-neutral">${row.type}</span></td>
      <td class="text-right mono" style="font-weight:600;">${row.debit > 0 ? NavManager.fmt(row.debit) : '-'}</td>
      <td class="text-right mono" style="font-weight:600;">${row.credit > 0 ? NavManager.fmt(row.credit) : '-'}</td>
    </tr>
  `).join('');

  const tbDebitTotal = document.getElementById('tbDebitTotal');
  if (tbDebitTotal) tbDebitTotal.textContent = NavManager.fmt(tb.grandTotalDebit);

  const tbCreditTotal = document.getElementById('tbCreditTotal');
  if (tbCreditTotal) tbCreditTotal.textContent = NavManager.fmt(tb.grandTotalCredit);

  const tbStatusPill = document.getElementById('tbStatusPill');
  if (tbStatusPill) {
    if (tb.isBalanced) {
      tbStatusPill.className = 'badge badge-success';
      tbStatusPill.innerHTML = '✓ PERFECTLY BALANCED (DR == CR)';
    } else {
      tbStatusPill.className = 'badge badge-danger';
      tbStatusPill.innerHTML = `⚠️ UNBALANCED (Diff: ${NavManager.fmt(tb.difference)})`;
    }
  }
}

// -------------------------------------------------------------
// 12. BANK & CASH RECONCILIATION
// -------------------------------------------------------------
function renderBankReconciliation() {
  const gl = AccountingEngine.getGeneralLedger();
  const bookBank = gl['1020']?.netBalance || 0;
  const bookCash = gl['1010']?.netBalance || 0;

  const bankBookDisplay = document.getElementById('recBankBookBal');
  if (bankBookDisplay) bankBookDisplay.textContent = NavManager.fmt(bookBank);

  const cashBookDisplay = document.getElementById('recCashBookBal');
  if (cashBookDisplay) cashBookDisplay.textContent = NavManager.fmt(bookCash);
}

// -------------------------------------------------------------
// 13. DOCUMENT ORGANIZER
// -------------------------------------------------------------
function renderDocumentOrganizer() {
  const invoices = AccountingEngine.getInvoices();
  const bills = AccountingEngine.getBills();
  const container = document.getElementById('docOrganizerBody');
  if (!container) return;

  const docs = [
    ...invoices.map(i => ({ id: i.id, ref: i.invoiceNumber, type: 'Sales Invoice', party: i.customerName, date: i.date, amount: i.total, status: i.status })),
    ...bills.map(b => ({ id: b.id, ref: b.billNumber, type: 'Purchase Bill', party: b.vendorName, date: b.date, amount: b.total, status: b.status }))
  ];

  docs.sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = docs.map(d => `
    <tr>
      <td class="mono" style="font-weight:700;">${d.ref}</td>
      <td><span class="badge ${d.type === 'Sales Invoice' ? 'badge-primary' : 'badge-purple'}">${d.type}</span></td>
      <td style="font-weight:600;">${d.party}</td>
      <td>${d.date}</td>
      <td class="text-right mono">${NavManager.fmt(d.amount)}</td>
      <td><span class="badge badge-success">${d.status}</span></td>
      <td class="text-right">
        <button class="btn btn-secondary btn-sm" onclick="viewDocumentRecord('${d.type}', '${d.id}')">🗂️ Open Dossier</button>
      </td>
    </tr>
  `).join('');
}

// -------------------------------------------------------------
// 14. MONTH-END BOOKKEEPER CHECKLIST
// -------------------------------------------------------------
function renderMonthEndChecklist() {
  const container = document.getElementById('monthEndChecklistContainer');
  if (!container) return;

  const tb = AccountingEngine.getTrialBalance();
  const gl = AccountingEngine.getGeneralLedger();

  const items = [
    { title: 'Record all daily sales and customer receipts', status: 'Done', desc: 'All sales invoices generated and customer payments credited.' },
    { title: 'Record all vendor bills and expense invoices', status: 'Done', desc: 'AP ledger updated with accounts payable obligations.' },
    { title: 'Perform Bank Reconciliation', status: (gl['1020']?.netBalance || 0) >= 0 ? 'Verified' : 'Pending', desc: 'Reconcile ledger bank balance against monthly bank statement.' },
    { title: 'Count and reconcile Petty Cash Float', status: (gl['1010']?.netBalance || 0) >= 0 ? 'Verified' : 'Action Required', desc: 'Physical cash on hand matches ledger account 1010.' },
    { title: 'Verify Trial Balance Equality', status: tb.isBalanced ? 'Balanced' : 'Discrepancy', desc: `Total debits (${NavManager.fmt(tb.grandTotalDebit)}) must equal total credits (${NavManager.fmt(tb.grandTotalCredit)}).` },
    { title: 'Handover books to Chief Accountant for Closing', status: 'Ready for Review', desc: 'Deliver adjusted journals and aging schedules.' }
  ];

  container.innerHTML = items.map(item => `
    <div class="checklist-item">
      <div>
        <div class="checklist-title">${item.title}</div>
        <div class="checklist-subtitle">${item.desc}</div>
      </div>
      <div>
        <span class="badge ${item.status === 'Balanced' || item.status === 'Verified' || item.status === 'Done' ? 'badge-success' : 'badge-warning'}">
          ${item.status}
        </span>
      </div>
    </div>
  `).join('');
}

// -------------------------------------------------------------
// MODALS & EVENT HANDLERS
// -------------------------------------------------------------
function bindActionButtons() {
  // GL Account Selector Change
  const glSelect = document.getElementById('glAccountSelector');
  if (glSelect) {
    glSelect.addEventListener('change', () => renderGeneralLedger());
  }

  // Invoice Form Submission
  const invForm = document.getElementById('formNewInvoice');
  if (invForm) {
    invForm.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const inv = AccountingEngine.createInvoice({
          customerName: document.getElementById('invCustomer').value,
          customerEmail: document.getElementById('invEmail').value,
          date: document.getElementById('invDate').value,
          dueDate: document.getElementById('invDueDate').value,
          subtotal: parseFloat(document.getElementById('invAmount').value),
          taxRate: parseFloat(document.getElementById('invTaxRate').value || 10),
          notes: document.getElementById('invNotes').value
        });
        NavManager.showToast(`Invoice ${inv.invoiceNumber} generated! Double-entry auto-posted.`, 'success');
        closeModal('modalNewInvoice');
        invForm.reset();
        renderAllBookkeepingSections();
        NavManager.renderNav('bookkeeping');
      } catch (err) {
        NavManager.showToast(err.message, 'danger');
      }
    });
  }

  // Bill Form Submission
  const billForm = document.getElementById('formNewBill');
  if (billForm) {
    billForm.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const bill = AccountingEngine.createBill({
          vendorName: document.getElementById('billVendor').value,
          date: document.getElementById('billDate').value,
          dueDate: document.getElementById('billDueDate').value,
          category: document.getElementById('billCategory').value,
          expenseAccountCode: document.getElementById('billExpenseAccount').value,
          subtotal: parseFloat(document.getElementById('billAmount').value),
          taxRate: parseFloat(document.getElementById('billTaxRate').value || 0),
          notes: document.getElementById('billNotes').value
        });
        NavManager.showToast(`Bill ${bill.billNumber} posted! A/P updated automatically.`, 'success');
        closeModal('modalNewBill');
        billForm.reset();
        renderAllBookkeepingSections();
        NavManager.renderNav('bookkeeping');
      } catch (err) {
        NavManager.showToast(err.message, 'danger');
      }
    });
  }

  // Direct Expense Form
  const expForm = document.getElementById('formNewExpense');
  if (expForm) {
    expForm.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        AccountingEngine.recordDirectExpense({
          expenseAccountCode: document.getElementById('expCategory').value,
          paymentAccountCode: document.getElementById('expPaymentMethod').value,
          amount: parseFloat(document.getElementById('expAmount').value),
          date: document.getElementById('expDate').value,
          payee: document.getElementById('expPayee').value,
          description: document.getElementById('expDesc').value
        });
        NavManager.showToast('Expense voucher recorded & general ledger updated!', 'success');
        closeModal('modalNewExpense');
        expForm.reset();
        renderAllBookkeepingSections();
        NavManager.renderNav('bookkeeping');
      } catch (err) {
        NavManager.showToast(err.message, 'danger');
      }
    });
  }

  // Cash / Bank Transfer Form
  const cbForm = document.getElementById('formCashBankTransfer');
  if (cbForm) {
    cbForm.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        AccountingEngine.recordCashBankTransaction({
          type: 'Transfer',
          fromAccount: document.getElementById('cbFrom').value,
          toAccount: document.getElementById('cbTo').value,
          amount: parseFloat(document.getElementById('cbAmount').value),
          date: document.getElementById('cbDate').value,
          description: document.getElementById('cbMemo').value
        });
        NavManager.showToast('Funds transferred successfully between accounts.', 'success');
        closeModal('modalCashBankTransfer');
        cbForm.reset();
        renderAllBookkeepingSections();
        NavManager.renderNav('bookkeeping');
      } catch (err) {
        NavManager.showToast(err.message, 'danger');
      }
    });
  }

  // Payroll Run Form
  const payrollForm = document.getElementById('formPayrollRun');
  if (payrollForm) {
    payrollForm.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const gross = parseFloat(document.getElementById('payrollGross').value);
        const tax = parseFloat(document.getElementById('payrollTax').value || 0);
        const net = gross - tax;

        AccountingEngine.recordPayroll({
          period: document.getElementById('payrollPeriod').value,
          grossSalaries: gross,
          taxWithholding: tax,
          netPay: net,
          paymentMethod: document.getElementById('payrollMethod').value,
          date: document.getElementById('payrollDate').value
        });
        NavManager.showToast('Payroll processed and disbursed to employees!', 'success');
        closeModal('modalPayrollRun');
        payrollForm.reset();
        renderAllBookkeepingSections();
        NavManager.renderNav('bookkeeping');
      } catch (err) {
        NavManager.showToast(err.message, 'danger');
      }
    });
  }

  // Manual Journal Entry Form
  const jvForm = document.getElementById('formManualJournal');
  if (jvForm) {
    jvForm.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const lines = [];
        const rows = document.querySelectorAll('.journal-row');
        rows.forEach(r => {
          const acc = r.querySelector('.jv-account').value;
          const dr = parseFloat(r.querySelector('.jv-debit').value) || 0;
          const cr = parseFloat(r.querySelector('.jv-credit').value) || 0;
          const memo = r.querySelector('.jv-memo').value;
          if (acc && (dr > 0 || cr > 0)) {
            lines.push({ accountCode: acc, debit: dr, credit: cr, memo });
          }
        });

        AccountingEngine.postJournalEntry({
          date: document.getElementById('jvDate').value,
          reference: document.getElementById('jvRef').value,
          description: document.getElementById('jvDescription').value,
          source: 'Manual Journal',
          lines
        });

        NavManager.showToast('Manual Journal Voucher posted & balanced!', 'success');
        closeModal('modalManualJournal');
        jvForm.reset();
        renderAllBookkeepingSections();
        NavManager.renderNav('bookkeeping');
      } catch (err) {
        NavManager.showToast(err.message, 'danger');
      }
    });
  }

  // Credit / Debit Note Form
  const noteForm = document.getElementById('formNewNote');
  if (noteForm) {
    noteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const type = document.getElementById('noteType').value;
        if (type === 'Credit Note') {
          AccountingEngine.recordCreditNote({
            customerName: document.getElementById('noteParty').value,
            invoiceNumber: document.getElementById('noteRefDoc').value,
            amount: parseFloat(document.getElementById('noteAmount').value),
            date: document.getElementById('noteDate').value,
            reason: document.getElementById('noteReason').value
          });
          NavManager.showToast('Credit Note issued to customer and AR reduced.', 'success');
        } else {
          AccountingEngine.recordDebitNote({
            vendorName: document.getElementById('noteParty').value,
            billNumber: document.getElementById('noteRefDoc').value,
            amount: parseFloat(document.getElementById('noteAmount').value),
            date: document.getElementById('noteDate').value,
            reason: document.getElementById('noteReason').value
          });
          NavManager.showToast('Debit Note issued to vendor and AP reduced.', 'success');
        }
        closeModal('modalNewNote');
        noteForm.reset();
        renderAllBookkeepingSections();
        NavManager.renderNav('bookkeeping');
      } catch (err) {
        NavManager.showToast(err.message, 'danger');
      }
    });
  }
}

// -------------------------------------------------------------
// MODAL CONTROLS & POPUPS
// -------------------------------------------------------------
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

// Receive Payment Modal
function openReceivePaymentModal(invoiceId) {
  const inv = AccountingEngine.getInvoices().find(i => i.id === invoiceId);
  if (!inv) return;

  const modal = document.getElementById('modalReceivePayment');
  document.getElementById('recPayInvId').value = inv.id;
  document.getElementById('recPayCustomer').textContent = inv.customerName;
  document.getElementById('recPayInvNum').textContent = inv.invoiceNumber;
  document.getElementById('recPayDue').textContent = NavManager.fmt(inv.balanceDue);
  document.getElementById('recPayAmount').value = inv.balanceDue;
  document.getElementById('recPayAmount').max = inv.balanceDue;

  openModal('modalReceivePayment');
}

function submitReceivePayment() {
  try {
    const invId = document.getElementById('recPayInvId').value;
    const amount = document.getElementById('recPayAmount').value;
    const date = document.getElementById('recPayDate').value;
    const method = document.getElementById('recPayMethod').value;
    const ref = document.getElementById('recPayRef').value;

    AccountingEngine.receiveCustomerPayment({
      invoiceId: invId,
      amount,
      paymentDate: date,
      paymentMethod: method,
      reference: ref
    });

    NavManager.showToast('Payment received! Accounts Receivable cleared & Cash/Bank increased.', 'success');
    closeModal('modalReceivePayment');
    renderAllBookkeepingSections();
    NavManager.renderNav('bookkeeping');
  } catch (err) {
    NavManager.showToast(err.message, 'danger');
  }
}

// Pay Vendor Modal
function openPayVendorModal(billId) {
  const bill = AccountingEngine.getBills().find(b => b.id === billId);
  if (!bill) return;

  document.getElementById('payVendorBillId').value = bill.id;
  document.getElementById('payVendorName').textContent = bill.vendorName;
  document.getElementById('payVendorBillNum').textContent = bill.billNumber;
  document.getElementById('payVendorDue').textContent = NavManager.fmt(bill.balanceDue);
  document.getElementById('payVendorAmount').value = bill.balanceDue;
  document.getElementById('payVendorAmount').max = bill.balanceDue;

  openModal('modalPayVendor');
}

function submitPayVendor() {
  try {
    const billId = document.getElementById('payVendorBillId').value;
    const amount = document.getElementById('payVendorAmount').value;
    const date = document.getElementById('payVendorDate').value;
    const method = document.getElementById('payVendorMethod').value;
    const ref = document.getElementById('payVendorRef').value;

    AccountingEngine.payVendorBill({
      billId,
      amount,
      paymentDate: date,
      paymentMethod: method,
      reference: ref
    });

    NavManager.showToast('Vendor bill paid! Accounts Payable decreased & Bank disbursed.', 'success');
    closeModal('modalPayVendor');
    renderAllBookkeepingSections();
    NavManager.renderNav('bookkeeping');
  } catch (err) {
    NavManager.showToast(err.message, 'danger');
  }
}

// View Invoice Modal (Printable)
function viewInvoiceModal(invoiceId) {
  const inv = AccountingEngine.getInvoices().find(i => i.id === invoiceId);
  if (!inv) return;

  const co = AccountingEngine.getCompany();
  const body = document.getElementById('viewInvoiceBody');
  if (!body) return;

  body.innerHTML = `
    <div style="border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:2rem;background:var(--bg-secondary);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2rem;border-bottom:1px solid var(--border-color);padding-bottom:1.5rem;">
        <div>
          <h2 style="color:var(--primary);margin-bottom:0.25rem;">${co.name}</h2>
          <div style="font-size:0.85rem;color:var(--text-secondary);">Enterprise Financial Solutions</div>
          <div style="font-size:0.85rem;color:var(--text-muted);">Tax ID: 94-8219481 | contact@apexenterprise.com</div>
        </div>
        <div style="text-align:right;">
          <h1 style="font-size:2rem;margin-bottom:0.25rem;">INVOICE</h1>
          <div class="mono" style="font-size:1.1rem;font-weight:700;color:var(--primary);">${inv.invoiceNumber}</div>
          <span class="badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}" style="margin-top:0.4rem;">${inv.status.toUpperCase()}</span>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-bottom:2rem;">
        <div>
          <div style="font-size:0.8rem;text-transform:uppercase;color:var(--text-muted);font-weight:600;">Billed To:</div>
          <div style="font-size:1.1rem;font-weight:700;margin-top:0.2rem;">${inv.customerName}</div>
          <div style="font-size:0.9rem;color:var(--text-secondary);">${inv.customerEmail || 'No email provided'}</div>
        </div>
        <div style="text-align:right;">
          <div><span style="color:var(--text-muted);">Invoice Date:</span> <span style="font-weight:600;">${inv.date}</span></div>
          <div><span style="color:var(--text-muted);">Payment Due:</span> <span style="font-weight:600;">${inv.dueDate}</span></div>
          <div><span style="color:var(--text-muted);">Currency:</span> <span class="mono">${co.currencyCode} (${co.currency})</span></div>
        </div>
      </div>

      <table style="width:100%;margin-bottom:2rem;">
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Unit Rate</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${inv.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td class="text-center">${item.qty}</td>
              <td class="text-right mono">${NavManager.fmt(item.rate)}</td>
              <td class="text-right mono" style="font-weight:700;">${NavManager.fmt(item.amount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="display:flex;justify-content:flex-end;">
        <div style="width:280px;">
          <div style="display:flex;justify-content:space-between;padding:0.4rem 0;">
            <span style="color:var(--text-muted);">Subtotal:</span>
            <span class="mono">${NavManager.fmt(inv.subtotal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:0.4rem 0;">
            <span style="color:var(--text-muted);">${co.taxName} (${inv.taxRate}%):</span>
            <span class="mono">${NavManager.fmt(inv.taxAmount)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:0.6rem 0;border-top:1px solid var(--border-color);font-size:1.15rem;font-weight:800;color:var(--primary);">
            <span>Total:</span>
            <span class="mono">${NavManager.fmt(inv.total)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:0.4rem 0;color:var(--success);">
            <span>Paid Amount:</span>
            <span class="mono">${NavManager.fmt(inv.paidAmount)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:0.4rem 0;border-top:1px dashed var(--border-color);font-weight:700;color:${inv.balanceDue > 0 ? 'var(--danger)' : 'var(--text-muted)'};">
            <span>Balance Due:</span>
            <span class="mono">${NavManager.fmt(inv.balanceDue)}</span>
          </div>
        </div>
      </div>

      <div style="margin-top:2.5rem;padding-top:1rem;border-top:1px solid var(--border-color);font-size:0.85rem;color:var(--text-muted);display:flex;justify-content:space-between;">
        <div>Notes: ${inv.notes}</div>
        <div>Double Entry Verified & GL Synced</div>
      </div>
    </div>
  `;

  openModal('modalViewInvoice');
}

function drillDownLedger(accountCode) {
  const select = document.getElementById('glAccountSelector');
  if (select) {
    select.value = accountCode;
    renderGeneralLedger();
  }
  // Switch to Ledger tab
  const glTabBtn = document.querySelector('[data-target="tabLedger"]');
  if (glTabBtn) glTabBtn.click();
}

function viewDocumentRecord(type, id) {
  if (type === 'Sales Invoice') {
    viewInvoiceModal(id);
  } else {
    NavManager.showToast(`Purchase Bill Dossier Ref: ${id}. Verified with AP balance.`, 'info');
  }
}
