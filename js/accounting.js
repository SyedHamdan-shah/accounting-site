/* ===================================================================
   ACCUMEN PRO - ACCOUNTANT & FINANCE SUITE CONTROLLER
   Full automation for all 22 Accountant & Financial Controller tasks
=================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  NavManager.renderNav('accounting');
  initAccountingPage();
});

function initAccountingPage() {
  setupAccountingTabs();
  renderAllAccountingSections();
  bindAccountingActions();
}

// -------------------------------------------------------------
// TAB SWITCHING SYSTEM
// -------------------------------------------------------------
function setupAccountingTabs() {
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
// RENDER ALL ACCOUNTING SECTIONS
// -------------------------------------------------------------
function renderAllAccountingSections() {
  renderProfitAndLossStatement();
  renderBalanceSheet();
  renderCashFlowStatement();
  renderFixedAssetsAndDepreciation();
  renderAccrualsAndPrepayments();
  renderBudgetVarianceAnalysis();
  renderFinancialRatios();
  renderTaxCompliance();
  renderInternalControlsAudit();
  renderAuditSchedulesAndQueries();
  renderPeriodClosingStatus();
  renderExecutiveReviewTable();
}

// -------------------------------------------------------------
// 1. PROFIT & LOSS STATEMENT (INCOME STATEMENT)
// -------------------------------------------------------------
function renderProfitAndLossStatement() {
  const pnl = AccountingEngine.getProfitAndLoss();

  const revTable = document.getElementById('pnlRevenueBody');
  if (revTable) {
    revTable.innerHTML = pnl.revenues.map(r => `
      <tr class="statement-row">
        <td>${r.code} - ${r.name}</td>
        <td class="text-right mono">${NavManager.fmt(r.amount)}</td>
      </tr>
    `).join('');
  }

  const cogsTable = document.getElementById('pnlCogsBody');
  if (cogsTable) {
    cogsTable.innerHTML = pnl.cogs.map(c => `
      <tr class="statement-row">
        <td>${c.code} - ${c.name}</td>
        <td class="text-right mono">${NavManager.fmt(c.amount)}</td>
      </tr>
    `).join('');
  }

  const expTable = document.getElementById('pnlExpensesBody');
  if (expTable) {
    expTable.innerHTML = pnl.operatingExpenses.map(e => `
      <tr class="statement-row">
        <td>${e.code} - ${e.name}</td>
        <td class="text-right mono">${NavManager.fmt(e.amount)}</td>
      </tr>
    `).join('');
  }

  const totalRevEl = document.getElementById('pnlTotalRevenue');
  if (totalRevEl) totalRevEl.textContent = NavManager.fmt(pnl.totalRevenue);

  const totalCogsEl = document.getElementById('pnlTotalCogs');
  if (totalCogsEl) totalCogsEl.textContent = NavManager.fmt(pnl.totalCOGS);

  const grossProfitEl = document.getElementById('pnlGrossProfit');
  if (grossProfitEl) grossProfitEl.textContent = NavManager.fmt(pnl.grossProfit);

  const totalExpEl = document.getElementById('pnlTotalOperatingExp');
  if (totalExpEl) totalExpEl.textContent = NavManager.fmt(pnl.totalOperatingExpenses);

  const opIncomeEl = document.getElementById('pnlOperatingIncome');
  if (opIncomeEl) opIncomeEl.textContent = NavManager.fmt(pnl.operatingIncome);

  const taxEl = document.getElementById('pnlTaxExpense');
  if (taxEl) taxEl.textContent = NavManager.fmt(pnl.taxExpense);

  const netIncomeEl = document.getElementById('pnlNetIncome');
  if (netIncomeEl) {
    netIncomeEl.textContent = NavManager.fmt(pnl.netIncome);
    netIncomeEl.style.color = pnl.netIncome >= 0 ? 'var(--primary)' : 'var(--danger)';
  }
}

// -------------------------------------------------------------
// 2. BALANCE SHEET (ASSETS = LIABILITIES + EQUITY)
// -------------------------------------------------------------
function renderBalanceSheet() {
  const bs = AccountingEngine.getBalanceSheet();

  const caTable = document.getElementById('bsCurrentAssetsBody');
  if (caTable) {
    caTable.innerHTML = bs.currentAssets.map(a => `
      <tr class="statement-row">
        <td>${a.code} - ${a.name}</td>
        <td class="text-right mono">${NavManager.fmt(a.amount)}</td>
      </tr>
    `).join('');
  }

  const faTable = document.getElementById('bsFixedAssetsBody');
  if (faTable) {
    faTable.innerHTML = bs.fixedAssets.map(a => `
      <tr class="statement-row">
        <td>${a.code} - ${a.name}</td>
        <td class="text-right mono" style="${a.amount < 0 ? 'color:var(--warning);' : ''}">${NavManager.fmt(a.amount)}</td>
      </tr>
    `).join('');
  }

  const clTable = document.getElementById('bsCurrentLiabilitiesBody');
  if (clTable) {
    clTable.innerHTML = bs.currentLiabilities.map(l => `
      <tr class="statement-row">
        <td>${l.code} - ${l.name}</td>
        <td class="text-right mono">${NavManager.fmt(l.amount)}</td>
      </tr>
    `).join('');
  }

  const eqTable = document.getElementById('bsEquityBody');
  if (eqTable) {
    eqTable.innerHTML = bs.equityItems.map(e => `
      <tr class="statement-row">
        <td>${e.code} - ${e.name}</td>
        <td class="text-right mono" style="${e.isCalculated ? 'font-weight:700;color:var(--primary);' : ''}">${NavManager.fmt(e.amount)}</td>
      </tr>
    `).join('');
  }

  const totalAssetsEl = document.getElementById('bsTotalAssets');
  if (totalAssetsEl) totalAssetsEl.textContent = NavManager.fmt(bs.totalAssets);

  const totalLiabEqEl = document.getElementById('bsTotalLiabilitiesAndEquity');
  if (totalLiabEqEl) totalLiabEqEl.textContent = NavManager.fmt(bs.totalLiabilitiesAndEquity);

  const balanceStatusBadge = document.getElementById('bsBalanceStatusBadge');
  if (balanceStatusBadge) {
    if (bs.isBalanced) {
      balanceStatusBadge.className = 'badge badge-success';
      balanceStatusBadge.innerHTML = '✓ PERFECTLY BALANCED (ASSETS == LIAB + EQUITY)';
    } else {
      balanceStatusBadge.className = 'badge badge-danger';
      balanceStatusBadge.innerHTML = `⚠️ VARIANCE DETECTED (${NavManager.fmt(bs.variance)})`;
    }
  }
}

// -------------------------------------------------------------
// 3. CASH FLOW STATEMENT (INDIRECT METHOD)
// -------------------------------------------------------------
function renderCashFlowStatement() {
  const cf = AccountingEngine.getCashFlowStatement();

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = NavManager.fmt(val);
  };

  setVal('cfNetIncome', cf.operating.netIncome);
  setVal('cfDepExpense', cf.operating.depExpense);
  setVal('cfArChange', cf.operating.arChange);
  setVal('cfApChange', cf.operating.apChange);
  setVal('cfInvChange', cf.operating.invChange);
  setVal('cfTaxPayChange', cf.operating.taxPayChange);
  setVal('cfNetOperating', cf.operating.netCashOperating);

  setVal('cfNetInvesting', cf.investing.netCashInvesting);
  setVal('cfNetFinancing', cf.financing.netCashFinancing);
  setVal('cfNetChange', cf.netChangeInCash);
  setVal('cfEndingCash', cf.endingCash);
}

// -------------------------------------------------------------
// 4. FIXED ASSETS & DEPRECIATION SCHEDULE
// -------------------------------------------------------------
function renderFixedAssetsAndDepreciation() {
  const assets = AccountingEngine.getFixedAssets();
  const tableBody = document.getElementById('fixedAssetsTableBody');
  if (!tableBody) return;

  if (assets.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding:1.5rem;color:var(--text-muted);">No fixed assets registered. Click "Register Fixed Asset" to add one.</td></tr>`;
    return;
  }

  tableBody.innerHTML = assets.map(a => {
    const nbv = Math.round((a.cost - a.accumulatedDepreciation) * 100) / 100;
    return `
      <tr>
        <td style="font-weight:700;">${a.name}</td>
        <td>${a.purchaseDate}</td>
        <td><span class="badge badge-neutral">${a.depreciationMethod} (${a.usefulLifeYears} yrs)</span></td>
        <td class="text-right mono">${NavManager.fmt(a.cost)}</td>
        <td class="text-right mono">${NavManager.fmt(a.salvageValue)}</td>
        <td class="text-right mono" style="color:var(--warning);">${NavManager.fmt(a.accumulatedDepreciation)}</td>
        <td class="text-right mono" style="font-weight:800;color:var(--primary);">${NavManager.fmt(nbv)}</td>
        <td>${a.lastDepreciationDate || 'Pending Calc'}</td>
      </tr>
    `;
  }).join('');
}

// -------------------------------------------------------------
// 5. ACCRUALS & PREPAYMENTS
// -------------------------------------------------------------
function renderAccrualsAndPrepayments() {
  const items = AccountingEngine.getAccrualsPrepayments();
  const tableBody = document.getElementById('accrualsTableBody');
  if (!tableBody) return;

  if (items.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:1.5rem;color:var(--text-muted);">No accruals or prepayments scheduled.</td></tr>`;
    return;
  }

  tableBody.innerHTML = items.map(item => {
    const remaining = item.totalAmount - item.amortizedAmount;
    return `
      <tr>
        <td style="font-weight:700;">${item.name}</td>
        <td><span class="badge ${item.type === 'Prepaid Expense' ? 'badge-primary' : 'badge-purple'}">${item.type}</span></td>
        <td>${item.startDate} to ${item.endDate}</td>
        <td class="text-right mono">${NavManager.fmt(item.totalAmount)}</td>
        <td class="text-right mono" style="color:var(--success);">${NavManager.fmt(item.amortizedAmount)}</td>
        <td class="text-right mono" style="font-weight:700;color:var(--warning);">${NavManager.fmt(remaining)}</td>
        <td><span class="badge ${remaining <= 0 ? 'badge-success' : 'badge-warning'}">${remaining <= 0 ? 'Fully Amortized' : 'Active'}</span></td>
      </tr>
    `;
  }).join('');
}

// -------------------------------------------------------------
// 6. BUDGET VS ACTUAL & VARIANCE ANALYSIS
// -------------------------------------------------------------
function renderBudgetVarianceAnalysis() {
  const variances = AccountingEngine.getBudgetVariance();
  const tableBody = document.getElementById('budgetVarianceTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = variances.map(v => `
    <tr>
      <td class="mono">${v.code}</td>
      <td style="font-weight:600;">${v.name}</td>
      <td><span class="badge badge-neutral">${v.type}</span></td>
      <td class="text-right mono">${NavManager.fmt(v.budget)}</td>
      <td class="text-right mono" style="font-weight:700;">${NavManager.fmt(v.actual)}</td>
      <td class="text-right mono" style="font-weight:700;color:${v.isFavorable ? 'var(--success)' : 'var(--danger)'};">
        ${v.variance >= 0 ? '+' : ''}${NavManager.fmt(v.variance)} (${v.percent}%)
      </td>
      <td>
        <span class="badge ${v.isFavorable ? 'badge-success' : 'badge-danger'}">
          ${v.isFavorable ? '✓ Favorable' : '⚠️ Unfavorable'}
        </span>
      </td>
    </tr>
  `).join('');
}

// -------------------------------------------------------------
// 7. FINANCIAL RATIOS & PERFORMANCE ANALYSIS
// -------------------------------------------------------------
function renderFinancialRatios() {
  const ratios = AccountingEngine.getFinancialRatios();

  const setRatio = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setRatio('ratioCurrent', ratios.currentRatio);
  setRatio('ratioQuick', ratios.quickRatio);
  setRatio('ratioDebtEquity', ratios.debtToEquity);
  setRatio('ratioGrossMargin', ratios.grossMargin);
  setRatio('ratioNetMargin', ratios.netProfitMargin);
  setRatio('ratioROA', ratios.roa);
}

// -------------------------------------------------------------
// 8. TAX COMPLIANCE & ESTIMATOR
// -------------------------------------------------------------
function renderTaxCompliance() {
  const gl = AccountingEngine.getGeneralLedger();
  const pnl = AccountingEngine.getProfitAndLoss();
  const company = AccountingEngine.getCompany();

  const vatPayable = gl['2030']?.netBalance || 0;
  const taxableOperatingIncome = Math.max(0, pnl.operatingIncome);
  const corporateTaxEstimate = Math.round((taxableOperatingIncome * 0.21) * 100) / 100; // 21% Corp Tax standard

  const vatEl = document.getElementById('taxVatPayable');
  if (vatEl) vatEl.textContent = NavManager.fmt(vatPayable);

  const corpTaxEl = document.getElementById('taxCorpEstimate');
  if (corpTaxEl) corpTaxEl.textContent = NavManager.fmt(corporateTaxEstimate);

  const taxableIncEl = document.getElementById('taxTaxableIncome');
  if (taxableIncEl) taxableIncEl.textContent = NavManager.fmt(taxableOperatingIncome);
}

// -------------------------------------------------------------
// 9. INTERNAL CONTROLS & ERROR DIAGNOSTICS
// -------------------------------------------------------------
function renderInternalControlsAudit() {
  const issues = AccountingEngine.runInternalControlsAudit();
  const container = document.getElementById('internalControlsList');
  if (!container) return;

  if (issues.length === 0) {
    container.innerHTML = `
      <div style="padding:1.5rem;background:var(--success-bg);border:1px solid var(--success-border);border-radius:var(--radius-md);color:var(--success);font-weight:600;display:flex;align-items:center;gap:0.75rem;">
        <span style="font-size:1.5rem;">🛡️</span>
        <div>
          <div>Zero Discrepancies Detected</div>
          <div style="font-size:0.85rem;color:var(--text-secondary);font-weight:400;">All double-entry validations, cash flows, and trial balance calculations pass rigorous internal controls.</div>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = issues.map(iss => `
    <div class="checklist-item" style="border-left:4px solid ${iss.severity === 'Critical' ? 'var(--danger)' : 'var(--warning)'};">
      <div>
        <div class="checklist-title">${iss.title}</div>
        <div class="checklist-subtitle">${iss.description}</div>
      </div>
      <div>
        <span class="badge ${iss.severity === 'Critical' ? 'badge-danger' : 'badge-warning'}">${iss.severity}</span>
      </div>
    </div>
  `).join('');
}

// -------------------------------------------------------------
// 10. AUDIT QUERIES & SCHEDULES
// -------------------------------------------------------------
function renderAuditSchedulesAndQueries() {
  const queries = AccountingEngine.getAuditQueries();
  const tableBody = document.getElementById('auditQueriesTableBody');
  if (!tableBody) return;

  if (queries.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:1.5rem;color:var(--text-muted);">No outstanding auditor queries logged.</td></tr>`;
    return;
  }

  tableBody.innerHTML = queries.map(q => `
    <tr>
      <td>${q.date}</td>
      <td style="font-weight:600;">${q.auditor}</td>
      <td style="font-weight:700;">${q.subject}</td>
      <td>${q.queryText}</td>
      <td style="color:var(--primary);font-size:0.85rem;">${q.response || 'Pending Response'}</td>
      <td><span class="badge ${q.status === 'Answered' ? 'badge-success' : 'badge-warning'}">${q.status}</span></td>
    </tr>
  `).join('');
}

// -------------------------------------------------------------
// 11. PERIOD CLOSING STATUS
// -------------------------------------------------------------
function renderPeriodClosingStatus() {
  const company = AccountingEngine.getCompany();
  const statusEl = document.getElementById('periodClosingStatus');
  if (statusEl) {
    statusEl.textContent = company.bookStatus === 'Closed' ? 'Books Locked & Closed' : 'Open for Posting';
  }
}

// -------------------------------------------------------------
// 12. EXECUTIVE REVIEW TABLE (Approve / Flag Bookkeeping Entries)
// -------------------------------------------------------------
function renderExecutiveReviewTable() {
  const journals = AccountingEngine.getJournalEntries();
  const tableBody = document.getElementById('executiveReviewTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = journals.slice().reverse().map(j => `
    <tr>
      <td>${j.date}</td>
      <td class="mono" style="font-weight:700;color:var(--primary);">${j.reference}</td>
      <td><span class="badge badge-neutral">${j.source}</span></td>
      <td>
        <div style="font-weight:600;">${j.description}</div>
      </td>
      <td class="text-right mono" style="font-weight:700;">${NavManager.fmt(j.totalAmount)}</td>
      <td><span class="badge ${j.isApproved ? 'badge-success' : 'badge-warning'}">${j.isApproved ? 'Approved by CA' : 'Draft / Unapproved'}</span></td>
      <td class="text-right">
        ${!j.isApproved ? `<button class="btn btn-success btn-sm" onclick="approveJournalEntry('${j.id}')">✓ Approve</button>` : `<span style="font-size:0.8rem;color:var(--text-muted);">Verified</span>`}
      </td>
    </tr>
  `).join('');
}

// -------------------------------------------------------------
// ACTIONS & EVENT BINDINGS
// -------------------------------------------------------------
function bindAccountingActions() {
  // Run Depreciation Button
  const btnRunDep = document.getElementById('btnRunDepreciation');
  if (btnRunDep) {
    btnRunDep.addEventListener('click', () => {
      const res = AccountingEngine.calculateAndPostDepreciation();
      if (res.count > 0) {
        NavManager.showToast(`Depreciation computed! Posted ${res.count} journals totaling ${NavManager.fmt(res.totalDepAmount)}.`, 'success');
      } else {
        NavManager.showToast('All fixed assets are up to date or fully depreciated.', 'info');
      }
      renderAllAccountingSections();
      NavManager.renderNav('accounting');
    });
  }

  // Run Amortization Button
  const btnAmort = document.getElementById('btnRunAmortization');
  if (btnAmort) {
    btnAmort.addEventListener('click', () => {
      const count = AccountingEngine.processAccrualsAmortization();
      if (count > 0) {
        NavManager.showToast(`Processed monthly amortization for ${count} prepayments/accruals.`, 'success');
      } else {
        NavManager.showToast('No pending amortizations for current period.', 'info');
      }
      renderAllAccountingSections();
      NavManager.renderNav('accounting');
    });
  }

  // Month-End Closing Button
  const btnCloseMonth = document.getElementById('btnCloseMonth');
  if (btnCloseMonth) {
    btnCloseMonth.addEventListener('click', () => {
      if (confirm('Execute Month-End Closing? This will review all trial balance accounts and lock the monthly period.')) {
        AccountingEngine.closeMonth('2026-02');
        NavManager.showToast('Month-End closing finalized successfully!', 'success');
        renderAllAccountingSections();
      }
    });
  }

  // Year-End Closing Button
  const btnCloseYear = document.getElementById('btnCloseYear');
  if (btnCloseYear) {
    btnCloseYear.addEventListener('click', () => {
      if (confirm('Execute Year-End Closing & Retained Earnings Rollup? This will transfer Net Profit to Retained Earnings (Equity) and close temporary nominal accounts.')) {
        AccountingEngine.closeYear('2026');
        NavManager.showToast('Year-End closing completed! Retained earnings rolled forward.', 'success');
        renderAllAccountingSections();
        NavManager.renderNav('accounting');
      }
    });
  }

  // Register Asset Form
  const assetForm = document.getElementById('formNewAsset');
  if (assetForm) {
    assetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const asset = AccountingEngine.addFixedAsset({
          name: document.getElementById('assetName').value,
          cost: parseFloat(document.getElementById('assetCost').value),
          salvageValue: parseFloat(document.getElementById('assetSalvage').value || 0),
          usefulLifeYears: parseFloat(document.getElementById('assetLife').value || 5),
          purchaseDate: document.getElementById('assetPurchaseDate').value,
          depreciationMethod: document.getElementById('assetMethod').value,
          assetAccountCode: document.getElementById('assetAccountCode').value,
          contraAccountCode: document.getElementById('assetContraAccountCode').value
        });
        NavManager.showToast(`Fixed Asset "${asset.name}" registered in ledger!`, 'success');
        closeModal('modalNewAsset');
        assetForm.reset();
        renderAllAccountingSections();
        NavManager.renderNav('accounting');
      } catch (err) {
        NavManager.showToast(err.message, 'danger');
      }
    });
  }

  // New Auditor Query Form
  const queryForm = document.getElementById('formNewQuery');
  if (queryForm) {
    queryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        AccountingEngine.getState().auditQueries.push({
          id: 'AQ-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          auditor: document.getElementById('queryAuditor').value,
          subject: document.getElementById('querySubject').value,
          queryText: document.getElementById('queryText').value,
          response: document.getElementById('queryResponse').value,
          status: document.getElementById('queryResponse').value ? 'Answered' : 'Pending'
        });
        AccountingEngine.updateCompany({}); // trigger save
        NavManager.showToast('Auditor query and schedule documented.', 'success');
        closeModal('modalNewQuery');
        queryForm.reset();
        renderAllAccountingSections();
      } catch (err) {
        NavManager.showToast(err.message, 'danger');
      }
    });
  }
}

function approveJournalEntry(id) {
  const j = AccountingEngine.getJournalEntries().find(entry => entry.id === id);
  if (j) {
    j.isApproved = true;
    j.reviewedBy = 'Chief Accountant';
    AccountingEngine.updateCompany({});
    NavManager.showToast(`Journal voucher ${j.reference} formally approved by Chief Accountant.`, 'success');
    renderAllAccountingSections();
  }
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}
