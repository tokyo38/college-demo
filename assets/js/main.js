/**
 * Uttara Management College - Interactive Smart Campus System JS
 * Powers the interactive demos for Student Portal & Admin ERP
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initStudentLedgerDemo();
  initAdminDashboardDemo();
  initReceiptModal();
});

// Mobile Drawer & Navigation Handler
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('mobileDrawerOverlay');
  const closeBtn = document.getElementById('closeDrawerBtn');

  if (!drawer || !overlay) return;

  const openDrawer = () => {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  // Close when tapping any drawer link
  const drawerLinks = drawer.querySelectorAll('a');
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

// Student Portal Fee Payment Simulator
function initStudentLedgerDemo() {
  const payBtn = document.getElementById('btnOpenPayModal');
  const modal = document.getElementById('payModal');
  const closeBtn = document.getElementById('closePayModal');
  const cancelBtn = document.getElementById('cancelPayModal');
  const confirmPayBtn = document.getElementById('btnConfirmPayment');
  const gatewayOptions = document.querySelectorAll('.gateway-option');
  
  if (payBtn && modal) {
    payBtn.addEventListener('click', () => {
      modal.classList.add('active');
    });
  }

  const closeModal = () => {
    if (modal) modal.classList.remove('active');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Gateway Selection
  let selectedGateway = 'bkash';
  gatewayOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      gatewayOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedGateway = opt.getAttribute('data-gateway') || 'bkash';
    });
  });

  // Confirm Payment
  if (confirmPayBtn) {
    confirmPayBtn.addEventListener('click', () => {
      const phoneInput = document.getElementById('payMobileNumber');
      const amountInput = document.getElementById('payAmount');
      
      const phone = phoneInput ? phoneInput.value : '01880882700';
      const amount = amountInput ? amountInput.value : '2,500';

      confirmPayBtn.disabled = true;
      confirmPayBtn.innerHTML = `
        <span class="spinner" style="display:inline-block; width:16px; height:16px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite;"></span>
        পেমেন্ট প্রসেসিং হচ্ছে...
      `;

      setTimeout(() => {
        confirmPayBtn.disabled = false;
        confirmPayBtn.innerHTML = 'নিশ্চিত করুন';
        closeModal();

        // Update Student ledger state
        const dueRow = document.getElementById('pendingFeeRow');
        if (dueRow) {
          dueRow.querySelector('.fee-status').innerHTML = '<span class="status-badge status-paid">পরিশোধিত (Paid)</span>';
          dueRow.querySelector('.fee-action').innerHTML = `
            <button class="btn btn-sm btn-secondary" onclick="viewReceipt('TRX-UMC-98421', 'মাসিক বেতন (নভেম্বর ২০২৬)', '৳ ২,৫০০')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v8H6z"></path></svg>
              রসিদ
            </button>
          `;
        }

        // Update metric summaries
        const dueMetric = document.getElementById('studentTotalDue');
        if (dueMetric) dueMetric.textContent = '৳ ০.০০';
        const paidMetric = document.getElementById('studentTotalPaid');
        if (paidMetric) paidMetric.textContent = '৳ ১৭,৫০০';

        showToast('পেমেন্ট সফল হয়েছে! ৳ ' + amount + ' জমা হয়েছে। একটি ডিজিটাল রসিদ তৈরি হয়েছে।');
      }, 1200);
    });
  }
}

// Admin Dashboard Live Ledger & Search
function initAdminDashboardDemo() {
  const searchInput = document.getElementById('adminStudentSearch');
  const deptFilter = document.getElementById('adminDeptFilter');
  const statusFilter = document.getElementById('adminStatusFilter');
  const tableBody = document.getElementById('adminStudentTableBody');

  if (!tableBody) return;

  function filterTable() {
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const dept = deptFilter ? deptFilter.value : 'all';
    const status = statusFilter ? statusFilter.value : 'all';

    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
      const name = row.getAttribute('data-name')?.toLowerCase() || '';
      const roll = row.getAttribute('data-roll')?.toLowerCase() || '';
      const phone = row.getAttribute('data-phone')?.toLowerCase() || '';
      const rowDept = row.getAttribute('data-dept') || '';
      const rowStatus = row.getAttribute('data-status') || '';

      const matchQuery = !query || name.includes(query) || roll.includes(query) || phone.includes(query);
      const matchDept = dept === 'all' || rowDept === dept;
      const matchStatus = status === 'all' || rowStatus === status;

      if (matchQuery && matchDept && matchStatus) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  if (searchInput) searchInput.addEventListener('input', filterTable);
  if (deptFilter) deptFilter.addEventListener('change', filterTable);
  if (statusFilter) statusFilter.addEventListener('change', filterTable);
}

// Admin Action: Collect Fee
window.collectFeeAdmin = function(roll, name, amount) {
  const modal = document.getElementById('adminCollectFeeModal');
  if (!modal) {
    if (confirm(`শিক্ষার্থী ${name} (রোল: ${roll})-এর বকেয়া ৳ ${amount} গ্রহণ করবেন?`)) {
      applyAdminFeeCollection(roll, amount);
    }
    return;
  }
  
  // Fill modal
  document.getElementById('adminFeeRoll').value = roll;
  document.getElementById('adminFeeName').value = name;
  document.getElementById('adminFeeAmount').value = amount;
  modal.classList.add('active');
};

window.applyAdminFeeCollection = function(roll, amount) {
  const row = document.querySelector(`tr[data-roll="${roll}"]`);
  if (row) {
    row.setAttribute('data-status', 'paid');
    const badge = row.querySelector('.status-col');
    if (badge) {
      badge.innerHTML = '<span class="status-badge status-paid">পরিশোধিত</span>';
    }
    const dueCell = row.querySelector('.due-amount-col');
    if (dueCell) {
      dueCell.textContent = '৳ ০.০০';
      dueCell.style.color = '#10b981';
    }
    const actionCell = row.querySelector('.action-col');
    if (actionCell) {
      actionCell.innerHTML = `
        <button class="btn btn-sm btn-secondary" onclick="viewReceipt('TRX-ADM-${roll}', 'বকেয়া ফি সংগৃহীত', '${amount}')">
          রসিদ প্রিন্ট
        </button>
      `;
    }
  }

  // Update Top Stats
  const statCollected = document.getElementById('adminStatCollected');
  if (statCollected) {
    statCollected.textContent = '৳ ৫১,০০০';
  }
  const statDue = document.getElementById('adminStatDue');
  if (statDue) {
    statDue.textContent = '৳ ১,৮২,৫০০';
  }

  showToast(`সফলভাবে রোল ${roll}-এর বেতন গ্রহণ সম্পন্ন হয়েছে! অভিভাবককে এসএমএস রসিদ পাঠানো হয়েছে।`);
};

// Admin Action: Send SMS reminder
window.sendSmsReminder = function(roll, name, phone) {
  showToast(`রোল ${roll} (${name}) এর অভিভাবকের মোবাইল (${phone}) এ বকেয়া বেতনের নোটিশ এসএমএস পাঠানো হয়েছে।`);
};

// Receipt View Modal
function initReceiptModal() {
  window.viewReceipt = function(trxId, feeType, amount) {
    const modal = document.getElementById('receiptModal');
    if (!modal) return;

    document.getElementById('receiptTrxId').textContent = trxId || 'TRX-UMC-77492';
    document.getElementById('receiptDate').textContent = new Date().toLocaleDateString('bn-BD', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    document.getElementById('receiptFeeType').textContent = feeType || 'মাসিক টিউশন ফি';
    document.getElementById('receiptAmount').textContent = amount || '৳ ২,৫০০';

    modal.classList.add('active');
  };

  const closeBtn = document.getElementById('closeReceiptModal');
  const printBtn = document.getElementById('btnPrintReceipt');
  const modal = document.getElementById('receiptModal');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

// Toast notification helper
function showToast(message) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0f172a;
      color: #ffffff;
      padding: 14px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      border-left: 4px solid #10b981;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s ease;
      transform: translateY(100px);
      opacity: 0;
    `;
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    <span>${message}</span>
  `;

  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
  }, 4000);
}
