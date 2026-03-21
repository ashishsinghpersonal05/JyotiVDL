document.addEventListener('DOMContentLoaded', () => {
    // State
    let contacts = [];
    let currentContactId = null;

    // DOM Elements
    const contactsList = document.getElementById('contacts-list');
    const totalBalance = document.getElementById('total-balance');
    const emptyState = document.getElementById('empty-state');
    const contactDetail = document.getElementById('contact-detail');
    
    // Modals
    const modalAddContact = document.getElementById('modal-add-contact');
    const modalAddTransaction = document.getElementById('modal-add-transaction');
    
    // Buttons
    const btnAddContact = document.getElementById('add-contact-btn');
    const btnGiveCredit = document.getElementById('btn-give-credit');
    const btnAcceptPayment = document.getElementById('btn-accept-payment');
    const btnAddInterest = document.getElementById('btn-add-interest');
    const btnDeleteContact = document.getElementById('btn-delete-contact');

    // Setup Modals
    const setupModal = (modal, btnOpen, closeId) => {
        const btnClose = document.getElementById(closeId);
        if(btnOpen) btnOpen.addEventListener('click', () => modal.classList.remove('hidden'));
        if(btnClose) btnClose.addEventListener('click', () => modal.classList.add('hidden'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    };

    setupModal(modalAddContact, btnAddContact, 'close-contact-modal');
    setupModal(modalAddTransaction, null, 'close-trans-modal');

    // Format currency
    const formatCurrency = (amount) => {
        return '₹' + Math.abs(amount).toFixed(2);
    };

    // Format date
    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Load Data
    const loadContacts = async () => {
        try {
            const res = await fetch('/api/contacts');
            contacts = await res.json();
            renderContacts();
            updateTotalBalance();
        } catch (error) {
            console.error('Failed to load customers', error);
            contactsList.innerHTML = '<div class="loading">Error loading customers</div>';
        }
    };

    const renderContacts = () => {
        contactsList.innerHTML = '';
        if (contacts.length === 0) {
            contactsList.innerHTML = '<div class="loading" style="text-align:center; padding: 20px; color: #94a3b8;">No customers yet</div>';
            return;
        }

        contacts.forEach(contact => {
            const item = document.createElement('div');
            item.className = `contact-item ${currentContactId === contact.id ? 'active' : ''}`;
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
    };

    const updateTotalBalance = () => {
        let total = contacts.reduce((sum, c) => sum + c.balance, 0);
        
        totalBalance.textContent = formatCurrency(total);
        if (total > 0) {
            totalBalance.className = 'balance-amount text-success';
            totalBalance.previousElementSibling.textContent = "Total You'll Get";
        } else if (total < 0) {
            totalBalance.className = 'balance-amount text-danger';
            totalBalance.previousElementSibling.textContent = "Total You'll Give";
        } else {
            totalBalance.className = 'balance-amount text-neutral';
            totalBalance.previousElementSibling.textContent = "Total Balance";
        }
    };

    // Select Contact
    const selectContact = async (id) => {
        currentContactId = id;
        renderContacts();
        
        const contact = contacts.find(c => c.id === id);
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
                if(t.type === 'credit') noteDefault = 'Loan Given';
                if(t.type === 'payment') noteDefault = 'Payment Received';
                if(t.type === 'interest') noteDefault = 'Interest Added';

                item.innerHTML = `
                    <div class="trans-info">
                        <div class="trans-note">${t.note || noteDefault}</div>
                        <div class="trans-date">${formatDate(t.date)}</div>
                    </div>
                    <div class="trans-amount-wrapper">
                        <div class="trans-amount ${t.type}">${t.type === 'payment' ? '+' : '-'}${formatCurrency(t.amount)}</div>
                        <button class="delete-trans-btn" data-id="${t.id}" title="Delete Transaction">🗑️</button>
                    </div>
                `;
                transList.appendChild(item);
            });
        } catch(error) {
            console.error('Fail to load transactions', error);
        }
    };

    // Submits
    document.getElementById('form-add-contact').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('contact-name').value;
        const phone = document.getElementById('contact-phone').value;
        
        const res = await fetch('/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone })
        });
        
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

    btnDeleteContact.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this customer and all their transactions?')) {
            const res = await fetch(`/api/contacts/${currentContactId}`, { method: 'DELETE' });
            if (res.ok) {
                currentContactId = null;
                contactDetail.classList.add('hidden');
                emptyState.classList.remove('hidden');
                emptyState.classList.add('active');
                loadContacts();
            }
        }
    });

    document.getElementById('form-add-transaction').addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = document.getElementById('trans-amount').value;
        const note = document.getElementById('trans-note').value;
        const type = document.getElementById('trans-type').value;

        const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contactId: currentContactId, amount, type, note })
        });

        if (res.ok) {
            document.getElementById('form-add-transaction').reset();
            modalAddTransaction.classList.add('hidden');
            await loadContacts();
            selectContact(currentContactId);
        }
    });

    document.getElementById('transactions-list').addEventListener('click', async (e) => {
        const btn = e.target.closest('.delete-trans-btn');
        if (!btn) return;
        
        const transId = btn.dataset.id;
        if (confirm('Are you sure you want to delete this transaction?')) {
            const res = await fetch(`/api/transactions/${transId}`, { method: 'DELETE' });
            if (res.ok) {
                await loadContacts();
                if (currentContactId) selectContact(currentContactId);
            }
        }
    });

    loadContacts();
});
