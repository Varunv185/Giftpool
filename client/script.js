// =========================================
// GIFTPOOL - MERN FRONTEND SCRIPT
// =========================================

const API_URL = "https://giftpool-backend.onrender.com/api";

let currentPoolId = "Team-Gift-Pool";
let payments = {};
let currentBudget = 5000;
let currentUserName = "Organizer";
let currentUserId = localStorage.getItem('giftpool_userid') || null;

// Initialize App State on Load
document.addEventListener("DOMContentLoaded", () => {
    const savedName = localStorage.getItem('giftpool_username');
    if (savedName) {
        currentUserName = savedName;
        document.getElementById('userNameDisplay').innerText = currentUserName;
        document.getElementById('heroWelcomeText').innerText = `Hi ${currentUserName}! 👋`;
        document.getElementById('welcomeModal').style.display = 'none';
    }

    if (currentUserId) {
        document.getElementById('openAuthModalBtn').style.display = 'none';
        document.getElementById('userProfilePill').style.display = 'flex';
        document.getElementById('userEmailDisplay').innerText = localStorage.getItem('giftpool_email') || "User";
        loadPool();
    } else {
        document.getElementById('openAuthModalBtn').style.display = 'flex';
        document.getElementById('userProfilePill').style.display = 'none';
        clearDashboardToFreshState();
    }
});

// =========================================
// 1. AUTHENTICATION (MERN API)
// =========================================

window.openAuthModal = () => { document.getElementById('authModal').style.display = 'flex'; };
window.closeAuthModal = () => { document.getElementById('authModal').style.display = 'none'; };

window.handleEmailSignIn = async function() {
    const emailInput = document.getElementById('authEmailInput');
    const passwordInput = document.getElementById('authPasswordInput');
    
    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Login failed");

        loginUserSession(data.userId, data.name, data.email);
        window.closeAuthModal();
    } catch (error) {
        alert("Sign-in error: " + error.message);
    }
};

window.handleEmailSignUp = async function() {
    const email = document.getElementById('authEmailInput').value.trim();
    const password = document.getElementById('authPasswordInput').value;
    if (!email || !password) return alert("Please enter email and password.");

    const name = email.split('@')[0];
    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Registration failed");

        loginUserSession(data.userId, data.name, email);
        window.closeAuthModal();
        alert("Account created and logged in successfully!");
    } catch (error) {
        alert("Registration error: " + error.message);
    }
};

function loginUserSession(userId, name, email) {
    currentUserId = userId;
    currentUserName = name;
    localStorage.setItem('giftpool_userid', userId);
    localStorage.setItem('giftpool_username', name);
    localStorage.setItem('giftpool_email', email);

    document.getElementById('openAuthModalBtn').style.display = 'none';
    document.getElementById('userProfilePill').style.display = 'flex';
    document.getElementById('userNameDisplay').innerText = name;
    document.getElementById('userEmailDisplay').innerText = email;
    document.getElementById('heroWelcomeText').innerText = `Hi ${name}! 👋`;

    loadPool();
}

window.signOutUser = function() {
    localStorage.clear();
    currentUserId = null;
    document.getElementById('openAuthModalBtn').style.display = 'flex';
    document.getElementById('userProfilePill').style.display = 'none';
    clearDashboardToFreshState();
};

window.saveWelcomeName = function() {
    const nameInput = document.getElementById('welcomeNameInput').value.trim();
    if (!nameInput) return alert("Please enter your name to continue.");
    currentUserName = nameInput;
    localStorage.setItem('giftpool_username', currentUserName);
    document.getElementById('userNameDisplay').innerText = currentUserName;
    document.getElementById('heroWelcomeText').innerText = `Hi ${currentUserName}! 👋`;
    document.getElementById('welcomeModal').style.display = 'none';
};

// =========================================
// 2. POOL DATA SYNC (MERN API)
// =========================================

window.loadPool = async function() {
    if (!currentUserId) {
        clearDashboardToFreshState();
        return;
    }

    const inputId = document.getElementById('poolIdInput').value.trim() || "Team-Gift-Pool";
    currentPoolId = inputId;
    document.getElementById('heroPoolTitle').innerText = currentPoolId;

    try {
        const response = await fetch(`${API_URL}/pools/${currentUserId}/${currentPoolId}`);
        const data = await response.json();

        if (data && data.payments && Object.keys(data.payments).length > 0) {
            payments = data.payments;
            currentBudget = data.budget || 5000;
            document.getElementById('newPoolSetupCard').style.display = 'none';
        } else {
            payments = {};
            currentBudget = 5000;
            document.getElementById('setupPoolTitleDisplay').innerText = currentPoolId;
            document.getElementById('setupBudgetInput').value = 5000;
            document.getElementById('setupFirstMemberInput').value = currentUserName;
            document.getElementById('setupFirstMemberAmountInput').value = 0;
            document.getElementById('newPoolSetupCard').style.display = 'block';
        }
        document.getElementById('budgetInput').value = currentBudget;
        updateDashboardUI();
    } catch (e) {
        console.error("Error loading pool from backend:", e);
    }
};

async function saveToBackend() {
    if (!currentUserId) return;
    try {
        await fetch(`${API_URL}/pools/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUserId,
                poolId: currentPoolId,
                budget: currentBudget,
                payments: payments
            })
        });
    } catch (e) {
        console.error("Error saving to backend:", e);
    }
}

window.deleteCurrentPool = async function() {
    if (!currentUserId) return;
    if (confirm(`Mark "${currentPoolId}" as completed and clear its data?`)) {
        payments = {};
        currentBudget = 5000;
        await saveToBackend();
        document.getElementById('poolIdInput').value = "Team-Gift-Pool";
        loadPool();
    }
};

window.initializeNewPoolFromCard = function() {
    if (!currentUserId) return alert("Please sign in first.");
    currentBudget = parseFloat(document.getElementById('setupBudgetInput').value) || 5000;
    const memberName = document.getElementById('setupFirstMemberInput').value.trim() || currentUserName;
    const memberAmount = parseFloat(document.getElementById('setupFirstMemberAmountInput').value) || 0;
    
    payments = {};
    if (memberName) payments[memberName] = memberAmount;

    saveToBackend();
    document.getElementById('newPoolSetupCard').style.display = 'none';
    updateDashboardUI();
};

window.promptChangeBudget = function() {
    const newB = prompt("Enter new target budget limit for this pool (₹):", currentBudget);
    if (newB !== null && !isNaN(newB)) {
        currentBudget = parseFloat(newB);
        document.getElementById('budgetInput').value = currentBudget;
        saveToBackend();
    }
};

window.updateBudget = function() {
    currentBudget = parseFloat(document.getElementById('budgetInput').value) || 5000;
    saveToBackend();
};

// =========================================
// 3. UI, MODALS & CALCULATIONS
// =========================================

window.toggleDarkMode = function() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('themeIcon');
    if (html.getAttribute('data-theme') === 'dark') {
        html.setAttribute('data-theme', 'light');
        if (themeIcon) themeIcon.className = "fa-solid fa-moon";
    } else {
        html.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.className = "fa-solid fa-sun";
    }
};

window.openAddMemberModal = function() {
    if (!currentUserId) return alert("Please sign in first.");
    document.getElementById('modalNameInput').value = '';
    document.getElementById('modalPaidInput').value = '';
    document.getElementById('addMemberModal').style.display = 'flex';
};

window.closeAddMemberModal = function() {
    document.getElementById('addMemberModal').style.display = 'none';
};

window.submitAddMemberForm = function() {
    const name = document.getElementById('modalNameInput').value.trim();
    const paid = parseFloat(document.getElementById('modalPaidInput').value) || 0;
    if (!name) return alert("Please enter a valid participant name.");

    payments[name] = (payments[name] || 0) + paid;
    saveToBackend();
    closeAddMemberModal();
    updateDashboardUI();
};

window.removeParticipant = function(name) {
    if (confirm(`Remove ${name}?`)) {
        delete payments[name];
        saveToBackend();
        updateDashboardUI();
    }
};

window.openUpiModal = function(debtor, creditor, amount) {
    const upiLink = `upi://pay?pa=giftpool@upi&pn=${encodeURIComponent(creditor)}&am=${amount}&cu=INR&tn=${encodeURIComponent('GiftPool Contribution')}`;
    document.getElementById('upiModalDesc').innerHTML = `Pay <b>₹${amount}</b> from <b>${debtor}</b> to <b>${creditor}</b>`;
    document.getElementById('upiQrCodeImg').src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`;
    document.getElementById('upiDeepLinkBtn').href = upiLink;
    document.getElementById('upiModal').style.display = 'flex';
};

window.closeUpiModal = function() {
    document.getElementById('upiModal').style.display = 'none';
};

function clearDashboardToFreshState() {
    payments = {};
    currentBudget = 5000;
    updateDashboardUI(true);
}

function updateDashboardUI(isLoggedOut = false) {
    const tbody = document.getElementById('participantTableBody');
    if (isLoggedOut || !currentUserId) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">Please sign in to view your private pool data.</td></tr>`;
        return;
    }

    const names = Object.keys(payments);
    const totalCollected = Object.values(payments).reduce((a, b) => a + b, 0);
    const count = names.length;
    const fairShare = count > 0 ? currentBudget / count : 0;
    const progressPct = currentBudget > 0 ? (totalCollected / currentBudget) * 100 : 0;

    document.getElementById('heroBudgetDisplay').innerText = currentBudget.toLocaleString('en-IN');
    document.getElementById('heroCollectedDisplay').innerText = totalCollected.toLocaleString('en-IN');
    document.getElementById('heroPercentDisplay').innerText = `${progressPct.toFixed(1)}%`;
    document.getElementById('heroProgressBar').style.width = `${Math.min(progressPct, 100)}%`;

    document.getElementById('metricCollected').innerText = `₹${totalCollected.toLocaleString('en-IN')}`;
    document.getElementById('metricPending').innerText = `₹${Math.max(0, currentBudget - totalCollected).toLocaleString('en-IN')}`;
    document.getElementById('metricTotalMembers').innerText = count;
    document.getElementById('metricFairShare').innerText = `₹${fairShare.toFixed(0)}`;

    let fullCount = 0, partialCount = 0, extraCount = 0, noneCount = 0;
    let tableHtml = "";

    names.forEach((name, idx) => {
        const paid = payments[name];
        const balance = paid - fairShare;
        let statusBadge = "", statusClass = "";

        if (paid === 0) { noneCount++; statusBadge = "Not Paid"; statusClass = "owes"; }
        else if (balance > 1) { extraCount++; statusBadge = "Overpaid"; statusClass = "overpaid"; }
        else if (Math.abs(balance) <= 1) { fullCount++; statusBadge = "Settled"; statusClass = "settled"; }
        else { partialCount++; statusBadge = "Needs to pay"; statusClass = "owes"; }

        tableHtml += `
            <tr>
                <td>${idx + 1}</td>
                <td><strong>${name}</strong></td>
                <td>₹${paid.toFixed(2)}</td>
                <td>₹${fairShare.toFixed(2)}</td>
                <td><span style="color: ${balance >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight:600;">${balance >= 0 ? '+' : ''}₹${balance.toFixed(2)}</span></td>
                <td><span class="status-badge ${statusClass}">${statusBadge}</span></td>
                <td><button onclick="removeParticipant('${name}')" class="btn-icon-dark" title="Delete"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
    });

    if (tbody) tbody.innerHTML = tableHtml || `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No members yet. Use the 'Add Member' form!</td></tr>`;
    
    document.getElementById('statPaidFullCount').innerText = fullCount + extraCount;
    document.getElementById('statPartialCount').innerText = partialCount;
    document.getElementById('statExtraCount').innerText = extraCount;
    document.getElementById('statNotPaidCount').innerText = noneCount;
    document.getElementById('qsTotal').innerText = count;

    generateSettlementActions();
}

window.generateSettlementActions = function() {
    if (!currentUserId) return;
    const fairShare = Object.keys(payments).length > 0 ? currentBudget / Object.keys(payments).length : 0;
    const balances = {};
    for (const [name, paid] of Object.entries(payments)) {
        balances[name] = paid - fairShare;
    }

    const debtors = {};
    const creditors = {};
    for (const [name, bal] of Object.entries(balances)) {
        if (bal < -0.01) debtors[name] = Math.abs(bal);
        if (bal > 0.01) creditors[name] = bal;
    }

    const txs = [];
    const dNames = Object.keys(debtors);
    const cNames = Object.keys(creditors);
    let i = 0, j = 0;

    while (i < dNames.length && j < cNames.length) {
        const d = dNames[i];
        const c = cNames[j];
        const amt = Math.min(debtors[d], creditors[c]);
        txs.push({ debtor: d, creditor: c, amount: amt.toFixed(0) });
        debtors[d] -= amt;
        creditors[c] -= amt;
        if (debtors[d] < 0.01) i++;
        if (creditors[c] < 0.01) j++;
    }

    const txCount = document.getElementById('settlementTxCount');
    const planBox = document.getElementById('settlementPlan');
    if (txCount) txCount.innerText = `${txs.length} transactions needed`;
    if (planBox) {
        planBox.innerHTML = txs.length === 0 
            ? `<div class="settlement-row"><span>✅ Everyone is perfectly settled up!</span></div>` 
            : txs.map(t => `
                <div class="settlement-row" style="display: flex; justify-content: space-between; align-items: center;">
                    <span><strong>${t.debtor}</strong> pays ₹${t.amount} to <strong>${t.creditor}</strong></span>
                    <button onclick="openUpiModal('${t.debtor}', '${t.creditor}', '${t.amount}')" class="btn-primary" style="padding: 4px 10px; font-size: 0.75rem;">
                        <i class="fa-solid fa-qrcode"></i> Pay Now
                    </button>
                </div>
            `).join('');
    }
};

window.toggleMobileSidebar = function() {
    const sidebar = document.getElementById('appSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
        if (backdrop) backdrop.classList.toggle('active');
    }
};

window.exportToExcel = function() {
    alert("Export feature ready.");
};
window.openPoolsModal = function() { alert("Pool Library available."); };
window.closeModal = function() {};
window.openImportModal = function() {};
window.closeImportModal = function() {};
window.filterMembersTable = function() {};
window.exportToExcel = function() {
    if (!currentUserId) return alert("Please sign in first.");
    const names = Object.keys(payments);
    if (names.length === 0) return alert("No data available to export.");

    const fairShare = currentBudget / names.length;
    let csvContent = "Participant Name,Paid Amount (INR),Fair Share (INR),Balance (INR),Status\n";

    names.forEach(name => {
        const paid = payments[name];
        const balance = paid - fairShare;
        let status = balance > 1 ? "Overpaid" : (Math.abs(balance) <= 1 ? "Settled" : "Owes Money");
        csvContent += `"${name}",${paid.toFixed(2)},${fairShare.toFixed(2)},${balance.toFixed(2)},"${status}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${currentPoolId}_GiftPool_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};