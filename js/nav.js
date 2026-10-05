/* ===================================================================
   ACCUMEN PRO - SHARED NAVIGATION & REAL-TIME STATUS CONTROLLER
=================================================================== */

const NavManager = (() => {
  // Format currency
  const fmt = (num) => {
    const val = parseFloat(num) || 0;
    return (val < 0 ? '-' : '') + '$' + Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Toast Notification Helper
  const showToast = (message, type = 'info') => {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'danger') icon = '⚠️';
    if (type === 'warning') icon = '🔔';

    toast.innerHTML = `
      <span style="font-size:1.1rem;">${icon}</span>
      <div style="flex:1;">
        <div style="font-weight:600;font-size:0.85rem;">${type.toUpperCase()}</div>
        <div>${message}</div>
      </div>
      <button style="background:none;border:none;color:inherit;cursor:pointer;opacity:0.6;font-size:1rem;" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 4500);
  };

  // Render Universal Navigation Header
  const renderNav = (activePage = 'hub') => {
    const navPlaceholder = document.getElementById('navPlaceholder');
    if (!navPlaceholder) return;

    const company = AccountingEngine.getCompany();
    const tb = AccountingEngine.getTrialBalance();
    const pnl = AccountingEngine.getProfitAndLoss();
    const gl = AccountingEngine.getGeneralLedger();
    const agingAR = AccountingEngine.getAgingReport('AR');
    const agingAP = AccountingEngine.getAgingReport('AP');

    const totalCashBank = (gl['1010']?.netBalance || 0) + (gl['1020']?.netBalance || 0);

    const html = `
      <header class="navbar">
        <div class="nav-container">
          <div class="brand">
            <div class="brand-icon">⚡</div>
            <span>ACCUMEN <span style="color:var(--primary);font-weight:400;">PRO</span></span>
            <span class="brand-badge">Automated ERP</span>
          </div>

          <nav class="nav-links">
            <a href="index.html" class="nav-btn ${activePage === 'hub' ? 'active' : ''}">
              <span>📊</span> Executive Hub
            </a>
            <a href="bookkeeping.html" class="nav-btn ${activePage === 'bookkeeping' ? 'active' : ''}">
              <span>📑</span> Bookkeeper Portal
            </a>
            <a href="accounting.html" class="nav-btn ${activePage === 'accounting' ? 'active' : ''}">
              <span>📈</span> Accountant Portal
            </a>
          </nav>

          <div class="nav-actions">
            <div class="status-pill" title="Double Entry Verification Status">
              <span class="status-dot ${tb.isBalanced ? '' : 'danger'}"></span>
              <span>Books: ${tb.isBalanced ? 'Balanced' : 'Discrepancy'}</span>
            </div>

            <button class="btn btn-secondary btn-sm" id="btnThemeToggle" title="Toggle Light/Dark Theme">
              <span id="themeIcon">🌓</span>
            </button>

            <button class="btn btn-secondary btn-sm" id="btnExportData" title="Export Backup JSON">
              💾 Export
            </button>

            <button class="btn btn-primary btn-sm" id="btnLoadDemo" title="Populate Realistic Demo Enterprise Data">
              ⚡ Demo Data
            </button>
          </div>
        </div>
      </header>

      <!-- Live Real-Time Financial Metric Strip -->
      <div class="metrics-strip">
        <div class="metrics-strip-container">
          <div class="metric-item">
            <span class="metric-label">Entity:</span>
            <span class="metric-val" style="color:var(--primary);">${company.name}</span>
          </div>

          <div class="metric-item">
            <span class="metric-label">Cash & Bank:</span>
            <span class="metric-val" style="color:${totalCashBank >= 0 ? 'var(--success)' : 'var(--danger)'};">${fmt(totalCashBank)}</span>
          </div>

          <div class="metric-item">
            <span class="metric-label">A/R (Receivables):</span>
            <span class="metric-val">${fmt(agingAR.total)}</span>
          </div>

          <div class="metric-item">
            <span class="metric-label">A/P (Payables):</span>
            <span class="metric-val">${fmt(agingAP.total)}</span>
          </div>

          <div class="metric-item">
            <span class="metric-label">Net Profit (YTD):</span>
            <span class="metric-val" style="color:${pnl.netIncome >= 0 ? 'var(--success)' : 'var(--danger)'};">${fmt(pnl.netIncome)}</span>
          </div>

          <div class="metric-item">
            <span class="metric-label">Trial Balance:</span>
            <span class="metric-val" style="color:${tb.isBalanced ? 'var(--success)' : 'var(--danger)'};">
              ${tb.isBalanced ? 'DEBIT == CREDIT' : `Diff: ${fmt(tb.difference)}`}
            </span>
          </div>
        </div>
      </div>
    `;

    navPlaceholder.innerHTML = html;
    bindNavEvents();
  };

  const bindNavEvents = () => {
    // Theme toggle
    const themeBtn = document.getElementById('btnThemeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const cur = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', cur);
        localStorage.setItem('accumen_theme', cur);
        document.getElementById('themeIcon').textContent = cur === 'light' ? '☀️' : '🌓';
      });
    }

    // Load Demo Data
    const demoBtn = document.getElementById('btnLoadDemo');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        if (confirm('Load demo enterprise dataset? This will populate realistic sales invoices, supplier bills, payroll, fixed assets, bank movements, and balanced ledgers.')) {
          AccountingEngine.loadDemoData();
          showToast('Demo enterprise dataset loaded successfully! All books and ledgers updated.', 'success');
          setTimeout(() => location.reload(), 600);
        }
      });
    }

    // Export Backup
    const exportBtn = document.getElementById('btnExportData');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const json = AccountingEngine.exportBackupJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `accumen_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Backup JSON exported successfully.', 'success');
      });
    }
  };

  // Listen for data update event across tabs / actions
  window.addEventListener('accumen_data_updated', () => {
    // Update metric strip if present
    const gl = AccountingEngine.getGeneralLedger();
    const pnl = AccountingEngine.getProfitAndLoss();
    const tb = AccountingEngine.getTrialBalance();
    const agingAR = AccountingEngine.getAgingReport('AR');
    const agingAP = AccountingEngine.getAgingReport('AP');
    const totalCashBank = (gl['1010']?.netBalance || 0) + (gl['1020']?.netBalance || 0);

    // Re-render or notify
    console.log('Automated engine recalculation broadcast received.');
  });

  // Restore saved theme on startup
  const savedTheme = localStorage.getItem('accumen_theme');
  if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
  }

  return {
    renderNav,
    showToast,
    fmt
  };
})();

if (typeof window !== 'undefined') window.NavManager = NavManager;
if (typeof global !== 'undefined') global.NavManager = NavManager;

