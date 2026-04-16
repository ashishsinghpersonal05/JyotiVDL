document.addEventListener('DOMContentLoaded', () => {
    // State
    let state = {
        mode: 'customers',
        contacts: [],
        currentContactId: null,
        investments: [],
        currentInvId: null,
        properties: [],
        currentPropId: null,
        loans: [],
        currentLoanId: null
    };

    // DOM Elements - Tabs & Views
    const navHome = document.getElementById('nav-home');
    const navCustomers = document.getElementById('nav-customers');
    const navInvestments = document.getElementById('nav-investments');
    const navProperties = document.getElementById('nav-properties');
    const navLoans = document.getElementById('nav-loans');
    const navReport = document.getElementById('nav-report');
    const workspaceHome = document.getElementById('home-workspace');
    const workspaceCustomers = document.getElementById('customers-workspace');
    const workspaceInvestments = document.getElementById('investments-workspace');
    const workspaceProperties = document.getElementById('properties-workspace');
    const workspaceLoans = document.getElementById('loans-workspace');
    const workspaceReport = document.getElementById('report-workspace');

    // DOM Elements - Customers
    const contactsList = document.getElementById('contacts-list');
    const totalBalance = document.getElementById('total-balance');
    const emptyState = document.getElementById('empty-state');
    const contactDetail = document.getElementById('contact-detail');
    const modalAddContact = document.getElementById('modal-add-contact');
    const modalAddTransaction = document.getElementById('modal-add-transaction');
    const btnAddContact = document.getElementById('add-contact-btn');
    const btnGiveCredit = document.getElementById('btn-give-credit');
    const btnAcceptPayment = document.getElementById('btn-accept-payment');
    const btnAddInterest = document.getElementById('btn-add-interest');
    const btnDeleteContact = document.getElementById('btn-delete-contact');

    // DOM Elements - Investments
    const invList = document.getElementById('investments-list');
    const totalInvBalance = document.getElementById('total-inv-balance');
    const invEmptyState = document.getElementById('inv-empty-state');
    const invDetail = document.getElementById('inv-detail');
    const modalAddInv = document.getElementById('modal-add-inv');
    const modalAddInvTrans = document.getElementById('modal-add-inv-trans');
    const btnAddInv = document.getElementById('add-inv-btn');
    const btnInvInvest = document.getElementById('btn-inv-invest');
    const btnInvReturn = document.getElementById('btn-inv-return');
    const btnInvWithdraw = document.getElementById('btn-inv-withdraw');
    const btnDeleteInv = document.getElementById('btn-delete-inv');

    // DOM Elements - Properties
    const propList = document.getElementById('properties-list');
    const totalPropBalance = document.getElementById('total-prop-balance');
    const propEmptyState = document.getElementById('prop-empty-state');
    const propDetail = document.getElementById('prop-detail');
    const modalAddProp = document.getElementById('modal-add-prop');
    const modalAddPropTrans = document.getElementById('modal-add-prop-trans');
    const btnAddProp = document.getElementById('add-prop-btn');
    const btnPropBuy = document.getElementById('btn-prop-buy');
    const btnPropAppreciation = document.getElementById('btn-prop-appreciation');
    const btnPropDepreciation = document.getElementById('btn-prop-depreciation');
    const btnDeleteProp = document.getElementById('btn-delete-prop');

    // DOM Elements - Loans
    const loanList = document.getElementById('loans-list');
    const totalLoanBalance = document.getElementById('total-loan-balance');
    const loanEmptyState = document.getElementById('loan-empty-state');
    const loanDetail = document.getElementById('loan-detail');
    const modalAddLoan = document.getElementById('modal-add-loan');
    const modalAddLoanTrans = document.getElementById('modal-add-loan-trans');
    const btnAddLoan = document.getElementById('add-loan-btn');
    const btnLoanRepay = document.getElementById('btn-loan-repay');
    const btnLoanBorrow = document.getElementById('btn-loan-borrow');
    const btnLoanInterest = document.getElementById('btn-loan-interest');
    const btnDeleteLoan = document.getElementById('btn-delete-loan');

    // Modals Setup helper
    const setupModal = (modal, btnOpen, closeId) => {
        const btnClose = document.getElementById(closeId);
        if (btnOpen) btnOpen.addEventListener('click', () => modal.classList.remove('hidden'));
        if (btnClose) btnClose.addEventListener('click', () => modal.classList.add('hidden'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    };

    setupModal(modalAddContact, btnAddContact, 'close-contact-modal');
    setupModal(modalAddTransaction, null, 'close-trans-modal');
    setupModal(modalAddInv, btnAddInv, 'close-inv-modal');
    setupModal(modalAddInvTrans, null, 'close-inv-trans-modal');
    setupModal(modalAddProp, btnAddProp, 'close-prop-modal');
    setupModal(modalAddPropTrans, null, 'close-prop-trans-modal');
    setupModal(modalAddLoan, btnAddLoan, 'close-loan-modal');
    setupModal(modalAddLoanTrans, null, 'close-loan-trans-modal');

    const renderIcons = () => {
        if (window.lucide) {
            lucide.createIcons();
        }
    };

    // Format Helpers
    const formatCurrency = (amount) => '₹' + Math.abs(amount).toFixed(2);
    const formatCurrencyShort = (amount) => {
        const absAmt = Math.abs(amount);
        const sign = amount < 0 ? '-' : '';
        if (absAmt >= 10000000) {
            return sign + '₹' + (absAmt / 10000000).toFixed(2) + ' Cr';
        } else if (absAmt >= 100000) {
            return sign + '₹' + (absAmt / 100000).toFixed(2) + ' L';
        } else if (absAmt >= 1000) {
            return sign + '₹' + (absAmt / 1000).toFixed(2) + ' K';
        } else {
            return sign + '₹' + absAmt.toFixed(2);
        }
    };
    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Tab Switching Logic
    const switchTab = async (mode) => {
        state.mode = mode;

        // Reset Nav
        navHome.classList.remove('active');
        navCustomers.classList.remove('active');
        navInvestments.classList.remove('active');
        navProperties.classList.remove('active');
        navLoans.classList.remove('active');
        navReport.classList.remove('active');

        // Hide Workspaces
        workspaceHome.classList.add('hidden');
        workspaceCustomers.classList.add('hidden');
        workspaceInvestments.classList.add('hidden');
        workspaceProperties.classList.add('hidden');
        workspaceLoans.classList.add('hidden');
        workspaceReport.classList.add('hidden');

        if (mode === 'home') {
            navHome.classList.add('active');
            workspaceHome.classList.remove('hidden');
            await renderDashboard();
        } else if (mode === 'customers') {
            navCustomers.classList.add('active');
            workspaceCustomers.classList.remove('hidden');
            loadContacts();
        } else if (mode === 'investments') {
            navInvestments.classList.add('active');
            workspaceInvestments.classList.remove('hidden');
            loadInvestments();
        } else if (mode === 'properties') {
            navProperties.classList.add('active');
            workspaceProperties.classList.remove('hidden');
            loadProperties();
        } else if (mode === 'loans') {
            navLoans.classList.add('active');
            workspaceLoans.classList.remove('hidden');
            loadLoans();
        } else if (mode === 'report') {
            navReport.classList.add('active');
            workspaceReport.classList.remove('hidden');
            loadReport();
        }
        renderIcons();
    };

    navHome.addEventListener('click', () => switchTab('home'));
    navCustomers.addEventListener('click', () => switchTab('customers'));
    navInvestments.addEventListener('click', () => switchTab('investments'));
    navProperties.addEventListener('click', () => switchTab('properties'));
    navLoans.addEventListener('click', () => switchTab('loans'));
    navReport.addEventListener('click', () => switchTab('report'));

    // Dashboard Logic
    const renderDashboard = async () => {
        // Always refresh all data for accurate KPIs
        try { const res = await fetch('/api/contacts'); state.contacts = await res.json(); } catch (e) { }
        try { const res = await fetch('/api/investments'); state.investments = await res.json(); } catch (e) { }
        try { const res = await fetch('/api/properties'); state.properties = await res.json(); } catch (e) { }
        try { const res = await fetch('/api/loans'); state.loans = await res.json(); } catch (e) { }

        const totalLent = state.contacts.reduce((sum, c) => sum + c.balance, 0);
        const totalInv = state.investments.reduce((sum, i) => sum + i.balance, 0);
        const totalProp = state.properties.reduce((sum, p) => sum + p.balance, 0);
        const totalLoansOwed = state.loans.reduce((sum, l) => sum + l.balance, 0);
        const totalNetWorth = totalLent + totalInv + totalProp - totalLoansOwed;

        document.getElementById('dash-net-worth').textContent = formatCurrencyShort(totalNetWorth);
        document.getElementById('dash-investments').textContent = formatCurrencyShort(totalInv);

        const elDashLent = document.getElementById('dash-lent');
        elDashLent.textContent = formatCurrencyShort(totalLent);
        elDashLent.className = `kpi-amount ${totalLent >= 0 ? 'text-success' : 'text-danger'}`;

        document.getElementById('dash-lent-label').textContent = totalLent >= 0 ? "You'll Get (Customers)" : "You Owe (Customers)";

        document.getElementById('dash-loans').textContent = formatCurrencyShort(totalLoansOwed);

        const breakdown = {};
        state.investments.forEach(inv => {
            if (!breakdown[inv.type]) breakdown[inv.type] = 0;
            breakdown[inv.type] += inv.balance;
        });
        state.properties.forEach(prop => {
            if (!breakdown[prop.type]) breakdown[prop.type] = 0;
            breakdown[prop.type] += prop.balance;
        });

        const breakdownContainer = document.getElementById('dash-inv-breakdown');
        if (breakdownContainer) {
            breakdownContainer.innerHTML = '';
            
            // Sort categories by amount descending
            const sortedTypes = Object.keys(breakdown).sort((a, b) => breakdown[b] - breakdown[a]);
            
            sortedTypes.forEach(type => {
                const amount = breakdown[type];
                let iconName = 'pie-chart';
                
                if(type === 'EPF' || type === 'NPS' || type === 'FD' || type === 'RD') iconName = 'piggy-bank';
                else if(type === 'Mutual Fund' || type === 'Stocks') iconName = 'trending-up';
                else if(type === 'Sukanya Samriddhi') iconName = 'heart';
                else if(type === 'Society' || type === 'Commercial') iconName = 'building';
                else if(type === 'Apartment' || type === 'House') iconName = 'home';
                else if(type === 'Agricultural' || type === 'Plot') iconName = 'map';
                
                breakdownContainer.innerHTML += `
                    <div class="kpi-card" style="padding: 24px; min-height: 120px; justify-content: center;">
                        <div class="kpi-header">
                            <span class="kpi-label">${type}</span>
                            <div class="kpi-icon" style="width: 36px; height: 36px;"><i data-lucide="${iconName}" style="width: 18px; height: 18px;"></i></div>
                        </div>
                        <div class="kpi-amount text-success" style="font-size: 1.75rem; margin-top: 8px;">${formatCurrencyShort(amount)}</div>
                        <div class="kpi-decor kpi-decor-2" style="width: 60px; height: 60px; bottom: -20px; left: -20px;"></div>
                    </div>
                `;
            });
            renderIcons();
        }
    };

    // ==========================================
    // CUSTOMERS LOGIC
    // ==========================================
    const loadContacts = async () => {
        try {
            const res = await fetch('/api/contacts');
            state.contacts = await res.json();
            renderContacts();
            updateTotalBalance();
        } catch (error) {
            contactsList.innerHTML = '<div class="loading">Error loading</div>';
        }
    };

    const renderContacts = () => {
        contactsList.innerHTML = '';
        if (state.contacts.length === 0) {
            contactsList.innerHTML = '<div class="loading" style="text-align:center; padding: 20px; color: #94a3b8;">No customers yet</div>';
            return;
        }

        state.contacts.forEach(contact => {
            const item = document.createElement('div');
            item.className = `contact-item ${state.currentContactId === contact.id ? 'active' : ''}`;
            item.onclick = () => selectContact(contact.id);

            const initial = contact.name.charAt(0).toUpperCase();
            let balClass = 'text-neutral';
            let balText = '₹0.00';

            if (contact.balance > 0) {
                balClass = 'text-success';
                balText = formatCurrency(contact.balance) + ' You Get';
            } else if (contact.balance < 0) {
                balClass = 'text-danger';
                balText = formatCurrency(contact.balance) + ' You Give';
            }

            item.innerHTML = `
                <div class="avatar">${initial}</div>
                <div class="contact-details-list">
                    <div class="contact-name">${contact.name}</div>
                    <div class="contact-time">${contact.phone || 'No phone'}</div>
                </div>
                <div class="contact-bal ${balClass}">${balText}</div>
            `;
            contactsList.appendChild(item);
        });
        renderIcons();
    };

    const updateTotalBalance = () => {
        let total = state.contacts.reduce((sum, c) => sum + c.balance, 0);
        totalBalance.textContent = formatCurrency(total);
        if (total > 0) {
            totalBalance.className = 'balance-amount text-success';
            totalBalance.previousElementSibling.textContent = "Total You'll Get";
        } else if (total > -0.01 && total < 0.01) { // Floating point 0
            totalBalance.className = 'balance-amount text-neutral';
            totalBalance.previousElementSibling.textContent = "Total Balance";
        } else {
            totalBalance.className = 'balance-amount text-danger';
            totalBalance.previousElementSibling.textContent = "Total You'll Give";
        }
    };

    const selectContact = async (id) => {
        state.currentContactId = id;
        renderContacts();

        const contact = state.contacts.find(c => c.id === id);
        if (!contact) return;

        document.getElementById('detail-avatar').textContent = contact.name.charAt(0).toUpperCase();
        document.getElementById('detail-name').textContent = contact.name;
        document.getElementById('detail-phone').textContent = contact.phone || 'No phone number';

        const detailBal = document.getElementById('detail-balance');
        detailBal.textContent = formatCurrency(contact.balance);
        if (contact.balance > 0) {
            detailBal.className = 'balance-amount text-success';
            detailBal.previousElementSibling.textContent = "You'll Get";
        } else if (contact.balance < 0) {
            detailBal.className = 'balance-amount text-danger';
            detailBal.previousElementSibling.textContent = "You'll Give";
        } else {
            detailBal.className = 'balance-amount text-neutral';
            detailBal.previousElementSibling.textContent = "Settled Up";
        }

        emptyState.classList.remove('active');
        emptyState.classList.add('hidden');
        contactDetail.classList.remove('hidden');

        await loadTransactions(id);
    };

    const loadTransactions = async (id) => {
        const transList = document.getElementById('transactions-list');
        transList.innerHTML = '<div class="loading" style="text-align:center;color:var(--text-secondary);padding:20px;">Loading...</div>';

        try {
            const res = await fetch(`/api/transactions/${id}`);
            const transactions = await res.json();

            transList.innerHTML = '';
            if (transactions.length === 0) {
                transList.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">No transactions yet. Give a loan to start!</div>';
                return;
            }

            transactions.forEach(t => {
                const item = document.createElement('div');
                item.className = `transaction-card ${t.type}`;

                let noteDefault = 'Transaction';
                if (t.type === 'credit') noteDefault = 'Loan Given';
                if (t.type === 'payment') noteDefault = 'Payment Received';
                if (t.type === 'interest') noteDefault = 'Interest Added';

                item.innerHTML = `
                    <div class="trans-info">
                        <div class="trans-note">${t.note || noteDefault}</div>
                        <div class="trans-date">${formatDate(t.date)}</div>
                    </div>
                    <div class="trans-amount-wrapper">
                        <div class="trans-amount ${t.type}">${t.type === 'payment' ? '+' : '-'}${formatCurrency(t.amount)}</div>
                        <button class="delete-trans-btn" data-id="${t.id}" data-model="contact" title="Delete Transaction"><i data-lucide="trash-2" style="width:18px;height:18px;"></i></button>
                    </div>
                `;
                transList.appendChild(item);
            });
            renderIcons();
        } catch (error) {
            console.error('Fail to load transactions', error);
        }
    };

    document.getElementById('form-add-contact').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('contact-name').value;
        const phone = document.getElementById('contact-phone').value;
        const res = await fetch('/api/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, phone }) });
        if (res.ok) {
            document.getElementById('form-add-contact').reset();
            modalAddContact.classList.add('hidden');
            loadContacts();
        }
    });

    btnGiveCredit.addEventListener('click', () => {
        document.getElementById('transaction-modal-title').textContent = 'Give Loan';
        document.getElementById('trans-type').value = 'credit';
        modalAddTransaction.classList.remove('hidden');
    });

    btnAcceptPayment.addEventListener('click', () => {
        document.getElementById('transaction-modal-title').textContent = 'Receive Payment';
        document.getElementById('trans-type').value = 'payment';
        modalAddTransaction.classList.remove('hidden');
    });

    btnAddInterest.addEventListener('click', () => {
        document.getElementById('transaction-modal-title').textContent = 'Add Interest';
        document.getElementById('trans-type').value = 'interest';
        modalAddTransaction.classList.remove('hidden');
    });

    document.getElementById('form-add-transaction').addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = document.getElementById('trans-amount').value;
        const note = document.getElementById('trans-note').value;
        const type = document.getElementById('trans-type').value;

        const res = await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactId: state.currentContactId, amount, type, note }) });
        if (res.ok) {
            document.getElementById('form-add-transaction').reset();
            modalAddTransaction.classList.add('hidden');
            await loadContacts();
            selectContact(state.currentContactId);
        }
    });

    btnDeleteContact.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this customer?')) {
            const res = await fetch(`/api/contacts/${state.currentContactId}`, { method: 'DELETE' });
            if (res.ok) {
                state.currentContactId = null;
                contactDetail.classList.add('hidden');
                emptyState.classList.remove('hidden');
                emptyState.classList.add('active');
                loadContacts();
            }
        }
    });

    document.getElementById('transactions-list').addEventListener('click', async (e) => {
        const btn = e.target.closest('.delete-trans-btn');
        if (!btn) return;
        const transId = btn.dataset.id;
        if (confirm('Delete this transaction?')) {
            const res = await fetch(`/api/transactions/${transId}`, { method: 'DELETE' });
            if (res.ok) {
                await loadContacts();
                if (state.currentContactId) selectContact(state.currentContactId);
            }
        }
    });

    // ==========================================
    // INVESTMENTS LOGIC
    // ==========================================

    const loadInvestments = async () => {
        try {
            const res = await fetch('/api/investments');
            state.investments = await res.json();
            renderInvestments();
            updateTotalInvBalance();
        } catch (error) {
            invList.innerHTML = '<div class="loading">Error loading</div>';
        }
    };

    const renderInvestments = () => {
        invList.innerHTML = '';
        if (state.investments.length === 0) {
            invList.innerHTML = '<div class="loading" style="text-align:center; padding: 20px; color: #94a3b8;">No investments yet</div>';
            return;
        }

        state.investments.forEach(inv => {
            const item = document.createElement('div');
            item.className = `contact-item ${state.currentInvId === inv.id ? 'active' : ''}`;
            item.onclick = () => selectInvestment(inv.id);

            const initial = inv.name.charAt(0).toUpperCase();
            const balClass = inv.balance >= 0 ? 'text-success' : 'text-danger';

            item.innerHTML = `
                <div class="avatar" style="background: linear-gradient(135deg, #10b981, #059669);">${initial}</div>
                <div class="contact-details-list">
                    <div class="contact-name">${inv.name}</div>
                    <div class="contact-time">${inv.type}</div>
                </div>
                <div class="contact-bal ${balClass}">${formatCurrency(inv.balance)}</div>
            `;
            invList.appendChild(item);
        });
        renderIcons();
    };

    const updateTotalInvBalance = () => {
        let total = state.investments.reduce((sum, i) => sum + i.balance, 0);
        totalInvBalance.textContent = formatCurrency(total);
        totalInvBalance.className = `balance-amount ${total >= 0 ? 'text-success' : 'text-danger'}`;
    };

    const selectInvestment = async (id) => {
        state.currentInvId = id;
        renderInvestments();

        const inv = state.investments.find(i => i.id === id);
        if (!inv) return;

        document.getElementById('inv-detail-avatar').textContent = inv.name.charAt(0).toUpperCase();
        document.getElementById('inv-detail-name').textContent = inv.name;
        document.getElementById('inv-detail-type').textContent = inv.type;

        const detailBal = document.getElementById('inv-detail-balance');
        detailBal.textContent = formatCurrency(inv.balance);
        detailBal.className = `balance-amount ${inv.balance >= 0 ? 'text-success' : 'text-danger'}`;

        invEmptyState.classList.remove('active');
        invEmptyState.classList.add('hidden');
        invDetail.classList.remove('hidden');

        await loadInvTransactions(id);
    };

    const loadInvTransactions = async (id) => {
        const transList = document.getElementById('inv-transactions-list');
        transList.innerHTML = '<div class="loading" style="text-align:center;color:var(--text-secondary);padding:20px;">Loading...</div>';

        try {
            const res = await fetch(`/api/investment-transactions/${id}`);
            const transactions = await res.json();

            transList.innerHTML = '';
            if (transactions.length === 0) {
                transList.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">No history yet. Start investing!</div>';
                return;
            }

            transactions.forEach(t => {
                const item = document.createElement('div');
                item.className = 'transaction-card';

                // Map styling: invest/return = success, withdraw = danger
                if (t.type === 'withdraw') item.classList.add('credit'); // red border indicating negative
                else if (t.type === 'invest') item.classList.add('payment'); // green border indicating positive
                else item.classList.add('interest'); // orange border (Add Return)

                let noteDefault = 'Transaction';
                if (t.type === 'invest') noteDefault = 'Invested Funds';
                if (t.type === 'return') noteDefault = 'Return / Interest';
                if (t.type === 'withdraw') noteDefault = 'Withdrawal';

                const sign = (t.type === 'withdraw') ? '-' : '+';
                const balClass = (t.type === 'withdraw') ? 'credit' : (t.type === 'invest' ? 'payment' : 'interest');

                item.innerHTML = `
                    <div class="trans-info">
                        <div class="trans-note">${t.note || noteDefault}</div>
                        <div class="trans-date">${formatDate(t.date)}</div>
                    </div>
                    <div class="trans-amount-wrapper">
                        <div class="trans-amount ${balClass}">${sign}${formatCurrency(t.amount)}</div>
                        <button class="delete-inv-trans-btn delete-trans-btn" data-id="${t.id}" title="Delete Transaction"><i data-lucide="trash-2" style="width:18px;height:18px;"></i></button>
                    </div>
                `;
                transList.appendChild(item);
            });
            renderIcons();
        } catch (error) {
            console.error('Fail to load transactions', error);
        }
    };

    document.getElementById('form-add-inv').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('inv-name').value;
        const type = document.getElementById('inv-type').value;
        const res = await fetch('/api/investments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, type }) });
        if (res.ok) {
            document.getElementById('form-add-inv').reset();
            modalAddInv.classList.add('hidden');
            loadInvestments();
        }
    });

    // Transaction Modals (Investments)
    btnInvInvest.addEventListener('click', () => {
        document.getElementById('inv-trans-modal-title').textContent = 'Invest Funds';
        document.getElementById('inv-trans-type').value = 'invest';
        modalAddInvTrans.classList.remove('hidden');
    });

    btnInvReturn.addEventListener('click', () => {
        document.getElementById('inv-trans-modal-title').textContent = 'Add Returns / Interest';
        document.getElementById('inv-trans-type').value = 'return';
        modalAddInvTrans.classList.remove('hidden');
    });

    btnInvWithdraw.addEventListener('click', () => {
        document.getElementById('inv-trans-modal-title').textContent = 'Withdraw Funds';
        document.getElementById('inv-trans-type').value = 'withdraw';
        modalAddInvTrans.classList.remove('hidden');
    });

    document.getElementById('form-add-inv-trans').addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = document.getElementById('inv-trans-amount').value;
        const note = document.getElementById('inv-trans-note').value;
        const type = document.getElementById('inv-trans-type').value;

        const res = await fetch('/api/investment-transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ investmentId: state.currentInvId, amount, type, note }) });
        if (res.ok) {
            document.getElementById('form-add-inv-trans').reset();
            modalAddInvTrans.classList.add('hidden');
            await loadInvestments();
            selectInvestment(state.currentInvId);
        }
    });

    btnDeleteInv.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this investment profile?')) {
            const res = await fetch(`/api/investments/${state.currentInvId}`, { method: 'DELETE' });
            if (res.ok) {
                state.currentInvId = null;
                invDetail.classList.add('hidden');
                invEmptyState.classList.remove('hidden');
                invEmptyState.classList.add('active');
                loadInvestments();
            }
        }
    });

    document.getElementById('inv-transactions-list').addEventListener('click', async (e) => {
        const btn = e.target.closest('.delete-inv-trans-btn');
        if (!btn) return;
        const transId = btn.dataset.id;
        if (confirm('Delete this transaction?')) {
            const res = await fetch(`/api/investment-transactions/${transId}`, { method: 'DELETE' });
            if (res.ok) {
                await loadInvestments();
                if (state.currentInvId) selectInvestment(state.currentInvId);
            }
        }
    });

    // ==========================================
    // PROPERTIES LOGIC
    // ==========================================

    const loadProperties = async () => {
        try {
            const res = await fetch('/api/properties');
            state.properties = await res.json();
            renderProperties();
            updateTotalPropBalance();
        } catch (error) {
            propList.innerHTML = '<div class="loading">Error loading</div>';
        }
    };

    const renderProperties = () => {
        propList.innerHTML = '';
        if (state.properties.length === 0) {
            propList.innerHTML = '<div class="loading" style="text-align:center; padding: 20px; color: #94a3b8;">No properties yet</div>';
            return;
        }

        state.properties.forEach(prop => {
            const item = document.createElement('div');
            item.className = `contact-item ${state.currentPropId === prop.id ? 'active' : ''}`;
            item.onclick = () => selectProperty(prop.id);

            const initial = prop.name.charAt(0).toUpperCase();
            const balClass = prop.balance >= 0 ? 'text-success' : 'text-danger';

            item.innerHTML = `
                <div class="avatar" style="background: linear-gradient(135deg, #a855f7, #7e22ce);">${initial}</div>
                <div class="contact-details-list">
                    <div class="contact-name">${prop.name}</div>
                    <div class="contact-time">${prop.type}</div>
                </div>
                <div class="contact-bal ${balClass}">${formatCurrency(prop.balance)}</div>
            `;
            propList.appendChild(item);
        });
        renderIcons();
    };

    const updateTotalPropBalance = () => {
        let total = state.properties.reduce((sum, p) => sum + p.balance, 0);
        totalPropBalance.textContent = formatCurrency(total);
        totalPropBalance.className = `balance-amount ${total >= 0 ? 'text-success' : 'text-neutral'}`;
    };

    const selectProperty = async (id) => {
        state.currentPropId = id;
        renderProperties();

        const prop = state.properties.find(p => p.id === id);
        if (!prop) return;

        document.getElementById('prop-detail-avatar').textContent = prop.name.charAt(0).toUpperCase();
        document.getElementById('prop-detail-name').textContent = prop.name;
        document.getElementById('prop-detail-type').textContent = prop.type;

        const detailBal = document.getElementById('prop-detail-balance');
        detailBal.textContent = formatCurrency(prop.balance);
        detailBal.className = `balance-amount ${prop.balance >= 0 ? 'text-success' : 'text-danger'}`;

        propEmptyState.classList.remove('active');
        propEmptyState.classList.add('hidden');
        propDetail.classList.remove('hidden');

        await loadPropTransactions(id);
    };

    const loadPropTransactions = async (id) => {
        const transList = document.getElementById('prop-transactions-list');
        transList.innerHTML = '<div class="loading" style="text-align:center;color:var(--text-secondary);padding:20px;">Loading...</div>';

        try {
            const res = await fetch(`/api/property-transactions/${id}`);
            const transactions = await res.json();

            transList.innerHTML = '';
            if (transactions.length === 0) {
                transList.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">No valuation history yet. Add the initial value!</div>';
                return;
            }

            transactions.forEach(t => {
                const item = document.createElement('div');
                item.className = 'transaction-card';

                if (t.type === 'depreciation' || t.type === 'sell') item.classList.add('credit');
                else if (t.type === 'buy') item.classList.add('payment');
                else item.classList.add('interest');

                let noteDefault = 'Transaction';
                if (t.type === 'buy') noteDefault = 'Initial Value / Buy';
                if (t.type === 'appreciation') noteDefault = 'Appreciation';
                if (t.type === 'depreciation') noteDefault = 'Depreciation';
                if (t.type === 'sell') noteDefault = 'Sold';

                const sign = (t.type === 'depreciation' || t.type === 'sell') ? '-' : '+';
                const balClass = (t.type === 'depreciation' || t.type === 'sell') ? 'credit' : (t.type === 'buy' ? 'payment' : 'interest');

                item.innerHTML = `
                    <div class="trans-info">
                        <div class="trans-note">${t.note || noteDefault}</div>
                        <div class="trans-date">${formatDate(t.date)}</div>
                    </div>
                    <div class="trans-amount-wrapper">
                        <div class="trans-amount ${balClass}">${sign}${formatCurrency(t.amount)}</div>
                        <button class="delete-prop-trans-btn delete-trans-btn" data-id="${t.id}" title="Delete Transaction"><i data-lucide="trash-2" style="width:18px;height:18px;"></i></button>
                    </div>
                `;
                transList.appendChild(item);
            });
            renderIcons();
        } catch (error) {
            console.error('Fail to load transactions', error);
        }
    };

    document.getElementById('form-add-prop').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('prop-name').value;
        const type = document.getElementById('prop-type').value;
        const res = await fetch('/api/properties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, type }) });
        if (res.ok) {
            document.getElementById('form-add-prop').reset();
            modalAddProp.classList.add('hidden');
            loadProperties();
        }
    });

    btnPropBuy.addEventListener('click', () => {
        document.getElementById('prop-trans-modal-title').textContent = 'Initial Value / Buy Property';
        document.getElementById('prop-trans-type').value = 'buy';
        modalAddPropTrans.classList.remove('hidden');
    });

    btnPropAppreciation.addEventListener('click', () => {
        document.getElementById('prop-trans-modal-title').textContent = 'Record Appreciation';
        document.getElementById('prop-trans-type').value = 'appreciation';
        modalAddPropTrans.classList.remove('hidden');
    });

    btnPropDepreciation.addEventListener('click', () => {
        document.getElementById('prop-trans-modal-title').textContent = 'Record Depreciation';
        document.getElementById('prop-trans-type').value = 'depreciation';
        modalAddPropTrans.classList.remove('hidden');
    });

    document.getElementById('form-add-prop-trans').addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = document.getElementById('prop-trans-amount').value;
        const note = document.getElementById('prop-trans-note').value;
        const type = document.getElementById('prop-trans-type').value;

        const res = await fetch('/api/property-transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ propertyId: state.currentPropId, amount, type, note }) });
        if (res.ok) {
            document.getElementById('form-add-prop-trans').reset();
            modalAddPropTrans.classList.add('hidden');
            await loadProperties();
            selectProperty(state.currentPropId);
        }
    });

    btnDeleteProp.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this property?')) {
            const res = await fetch(`/api/properties/${state.currentPropId}`, { method: 'DELETE' });
            if (res.ok) {
                state.currentPropId = null;
                propDetail.classList.add('hidden');
                propEmptyState.classList.remove('hidden');
                propEmptyState.classList.add('active');
                loadProperties();
            }
        }
    });

    document.getElementById('prop-transactions-list').addEventListener('click', async (e) => {
        const btn = e.target.closest('.delete-prop-trans-btn');
        if (!btn) return;
        const transId = btn.dataset.id;
        if (confirm('Delete this transaction?')) {
            const res = await fetch(`/api/property-transactions/${transId}`, { method: 'DELETE' });
            if (res.ok) {
                await loadProperties();
                if (state.currentPropId) selectProperty(state.currentPropId);
            }
        }
    });

    // ==========================================
    // LOANS LOGIC
    // ==========================================

    const loadLoans = async () => {
        try {
            const res = await fetch('/api/loans');
            state.loans = await res.json();
            renderLoans();
            updateTotalLoanBalance();
        } catch (error) {
            loanList.innerHTML = '<div class="loading">Error loading</div>';
        }
    };

    const renderLoans = () => {
        loanList.innerHTML = '';
        if (state.loans.length === 0) {
            loanList.innerHTML = '<div class="loading" style="text-align:center; padding: 20px; color: #94a3b8;">No loans yet</div>';
            return;
        }

        state.loans.forEach(loan => {
            const item = document.createElement('div');
            item.className = `contact-item ${state.currentLoanId === loan.id ? 'active' : ''}`;
            item.onclick = () => selectLoan(loan.id);

            const initial = loan.name.charAt(0).toUpperCase();
            const balClass = loan.balance > 0 ? 'text-danger' : 'text-success';
            const balLabel = loan.balance > 0 ? 'Outstanding' : 'Cleared';

            item.innerHTML = `
                <div class="avatar" style="background: linear-gradient(135deg, #ef4444, #b91c1c);">${initial}</div>
                <div class="contact-details-list">
                    <div class="contact-name">${loan.name}</div>
                    <div class="contact-time">${loan.type}</div>
                </div>
                <div class="contact-bal ${balClass}">${formatCurrency(loan.balance)} ${balLabel}</div>
            `;
            loanList.appendChild(item);
        });
        renderIcons();
    };

    const updateTotalLoanBalance = () => {
        let total = state.loans.reduce((sum, l) => sum + l.balance, 0);
        totalLoanBalance.textContent = formatCurrency(total);
        totalLoanBalance.className = `balance-amount ${total > 0 ? 'text-danger' : 'text-success'}`;
    };

    const selectLoan = async (id) => {
        state.currentLoanId = id;
        renderLoans();

        const loan = state.loans.find(l => l.id === id);
        if (!loan) return;

        document.getElementById('loan-detail-avatar').textContent = loan.name.charAt(0).toUpperCase();
        document.getElementById('loan-detail-name').textContent = loan.name;
        document.getElementById('loan-detail-type').textContent = loan.type;

        const detailBal = document.getElementById('loan-detail-balance');
        detailBal.textContent = formatCurrency(loan.balance);
        detailBal.className = `balance-amount ${loan.balance > 0 ? 'text-danger' : 'text-success'}`;

        loanEmptyState.classList.remove('active');
        loanEmptyState.classList.add('hidden');
        loanDetail.classList.remove('hidden');

        await loadLoanTransactions(id);
    };

    const loadLoanTransactions = async (id) => {
        const transList = document.getElementById('loan-transactions-list');
        transList.innerHTML = '<div class="loading" style="text-align:center;color:var(--text-secondary);padding:20px;">Loading...</div>';

        try {
            const res = await fetch(`/api/loan-transactions/${id}`);
            const transactions = await res.json();

            transList.innerHTML = '';
            if (transactions.length === 0) {
                transList.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">No transactions yet. Add a borrow entry to start.</div>';
                return;
            }

            transactions.forEach(t => {
                const item = document.createElement('div');
                item.className = 'transaction-card';

                // repay = green (reduces debt), borrow/interest = red (increases debt)
                if (t.type === 'repay') item.classList.add('payment');
                else if (t.type === 'borrow') item.classList.add('credit');
                else item.classList.add('interest');

                let noteDefault = 'Transaction';
                if (t.type === 'borrow') noteDefault = 'Borrowed';
                if (t.type === 'repay') noteDefault = 'EMI / Repayment';
                if (t.type === 'interest') noteDefault = 'Interest Added';

                const sign = t.type === 'repay' ? '-' : '+';
                const amtClass = t.type === 'repay' ? 'payment' : (t.type === 'borrow' ? 'credit' : 'interest');

                item.innerHTML = `
                    <div class="trans-info">
                        <div class="trans-note">${t.note || noteDefault}</div>
                        <div class="trans-date">${formatDate(t.date)}</div>
                    </div>
                    <div class="trans-amount-wrapper">
                        <div class="trans-amount ${amtClass}">${sign}${formatCurrency(t.amount)}</div>
                        <button class="delete-loan-trans-btn delete-trans-btn" data-id="${t.id}" title="Delete Transaction"><i data-lucide="trash-2" style="width:18px;height:18px;"></i></button>
                    </div>
                `;
                transList.appendChild(item);
            });
            renderIcons();
        } catch (error) {
            console.error('Failed to load loan transactions', error);
        }
    };

    document.getElementById('form-add-loan').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('loan-name').value;
        const type = document.getElementById('loan-type').value;
        const res = await fetch('/api/loans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, type }) });
        if (res.ok) {
            document.getElementById('form-add-loan').reset();
            modalAddLoan.classList.add('hidden');
            loadLoans();
        }
    });

    btnLoanRepay.addEventListener('click', () => {
        document.getElementById('loan-trans-modal-title').textContent = 'Pay EMI / Repayment';
        document.getElementById('loan-trans-type').value = 'repay';
        modalAddLoanTrans.classList.remove('hidden');
    });

    btnLoanBorrow.addEventListener('click', () => {
        document.getElementById('loan-trans-modal-title').textContent = 'Borrow More';
        document.getElementById('loan-trans-type').value = 'borrow';
        modalAddLoanTrans.classList.remove('hidden');
    });

    btnLoanInterest.addEventListener('click', () => {
        document.getElementById('loan-trans-modal-title').textContent = 'Add Interest';
        document.getElementById('loan-trans-type').value = 'interest';
        modalAddLoanTrans.classList.remove('hidden');
    });

    document.getElementById('form-add-loan-trans').addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = document.getElementById('loan-trans-amount').value;
        const note = document.getElementById('loan-trans-note').value;
        const type = document.getElementById('loan-trans-type').value;

        const res = await fetch('/api/loan-transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ loanId: state.currentLoanId, amount, type, note }) });
        if (res.ok) {
            document.getElementById('form-add-loan-trans').reset();
            modalAddLoanTrans.classList.add('hidden');
            await loadLoans();
            selectLoan(state.currentLoanId);
        }
    });

    btnDeleteLoan.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this loan?')) {
            const res = await fetch(`/api/loans/${state.currentLoanId}`, { method: 'DELETE' });
            if (res.ok) {
                state.currentLoanId = null;
                loanDetail.classList.add('hidden');
                loanEmptyState.classList.remove('hidden');
                loanEmptyState.classList.add('active');
                loadLoans();
            }
        }
    });

    document.getElementById('loan-transactions-list').addEventListener('click', async (e) => {
        const btn = e.target.closest('.delete-loan-trans-btn');
        if (!btn) return;
        const transId = btn.dataset.id;
        if (confirm('Delete this transaction?')) {
            const res = await fetch(`/api/loan-transactions/${transId}`, { method: 'DELETE' });
            if (res.ok) {
                await loadLoans();
                if (state.currentLoanId) selectLoan(state.currentLoanId);
            }
        }
    });

    // ==========================================
    // REPORT LOGIC
    // ==========================================
    const loadReport = async () => {
        const reportList = document.getElementById('monthly-report-list');
        reportList.innerHTML = '<div class="loading" style="text-align:center; padding: 20px; color: #94a3b8;">Loading report...</div>';

        try {
            const res = await fetch('/api/reports/monthly');
            const data = await res.json();
            
            reportList.innerHTML = '';
            if (data.length === 0) {
                reportList.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">No transactions yet.</div>';
                return;
            }

            data.forEach(item => {
                const el = document.createElement('div');
                el.className = 'contact-item'; 
                el.style.flexDirection = 'column';
                el.style.alignItems = 'stretch';
                el.style.cursor = 'pointer';

                // item.sortKey is "YYYY-MM"
                const [year, month] = item.sortKey.split('-');
                const dateObj = new Date(year, parseInt(month) - 1);
                const monthName = dateObj.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
                
                const netFlow = item.credit - item.debit;
                let netFlowClass = 'text-neutral';
                if (netFlow > 0) netFlowClass = 'text-success';
                else if (netFlow < 0) netFlowClass = 'text-danger';

                let transHtml = '';
                if (item.transactions && item.transactions.length > 0) {
                    item.transactions.forEach(t => {
                        let tClass = 'text-neutral';
                        let sign = '';
                        if (t.type === 'credit' || t.type === 'invest' || t.type === 'interest') { tClass = 'text-danger'; sign = '-'; }
                        else if (t.type === 'payment' || t.type === 'withdraw' || t.type === 'return') { tClass = 'text-success'; sign = '+'; }
                        
                        if (t.type === 'interest') { tClass = 'text-warning'; sign = '+'; }
                        
                        let noteLabel = t.note || t.type;
                        transHtml += `
                            <div style="display:flex; justify-content:space-between; padding: 12px 0; border-bottom: 1px solid var(--border); font-size: 0.9rem;">
                                <div>
                                    <div style="font-weight: 500; color: var(--text-primary); text-transform: capitalize;">${t.entityName} <span style="font-size:0.75rem; color:var(--text-secondary); font-weight:normal;">(${t.isInvestment ? 'Investment' : 'Customer'})</span></div>
                                    <div style="color: var(--text-secondary); font-size: 0.8rem; margin-top:2px;">${formatDate(t.date)} &bull; ${noteLabel}</div>
                                </div>
                                <div style="font-weight: 600;" class="${tClass}">${sign}${formatCurrency(t.amount)}</div>
                            </div>
                        `;
                    });
                } else {
                    transHtml = '<div style="color:var(--text-secondary); padding: 10px 0; font-size: 0.9rem;">No transaction details</div>';
                }

                const headerHtml = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                        <div style="flex:1;">
                            <h3 style="margin: 0; font-size: 1.1rem; color: var(--text-primary); font-weight: 600;">${monthName}</h3>
                            <div style="display: flex; gap: 16px; margin-top: 8px; font-size: 0.85rem; color: var(--text-secondary); flex-wrap: wrap;">
                                <span title="Total Loan Given"><i data-lucide="arrow-up-right" style="width:14px;height:14px;vertical-align:middle;margin-right:2px;" class="text-danger"></i><span class="text-danger">${formatCurrency(item.loanGiven || 0)}</span></span>
                                <span title="Total Interest Added"><i data-lucide="percent" style="width:14px;height:14px;vertical-align:middle;margin-right:2px;color:#f59e0b;"></i><span style="color:#f59e0b;">${formatCurrency(item.interestAdded || 0)}</span></span>
                                <span title="Total Payment Received"><i data-lucide="arrow-down-left" style="width:14px;height:14px;vertical-align:middle;margin-right:2px;" class="text-success"></i><span class="text-success">${formatCurrency(item.amountReceived || 0)}</span></span>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-size: 0.8rem; color: var(--text-secondary); display: block;">Net Cash Flow</span>
                            <span class="balance-amount ${netFlowClass}" style="font-size: 1.2rem;">${netFlow > 0 ? '+' : ''}${formatCurrency(netFlow)}</span>
                            <div style="margin-top: 4px;"><i data-lucide="chevron-down" style="width:16px;height:16px;" class="expand-icon text-neutral"></i></div>
                        </div>
                    </div>
                `;

                const detailsHtml = `
                    <div class="month-details" style="display:none; margin-top: 16px; background: var(--bg-color); border-radius: 8px; padding: 16px; width: 100%; box-sizing: border-box; border: 1px solid var(--border);">
                        <h4 style="margin: 0 0 8px 0; font-size: 0.95rem; color: var(--text-secondary);">Transactions</h4>
                        ${transHtml}
                    </div>
                `;

                el.innerHTML = headerHtml + detailsHtml;
                
                el.addEventListener('click', (e) => {
                    const details = el.querySelector('.month-details');
                    const icon = el.querySelector('.expand-icon');
                    if (details.style.display === 'none') {
                        details.style.display = 'block';
                        icon.setAttribute('data-lucide', 'chevron-up');
                    } else {
                        details.style.display = 'none';
                        icon.setAttribute('data-lucide', 'chevron-down');
                    }
                    if (window.lucide) window.lucide.createIcons();
                });

                reportList.appendChild(el);
            });
            renderIcons();

        } catch (error) {
            reportList.innerHTML = '<div class="loading">Error loading report</div>';
            console.error(error);
        }
    };

    // Boot
    switchTab('home');
});
