const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Helper to read data
const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const parsed = JSON.parse(data);
        if (!parsed.investments) parsed.investments = [];
        if (!parsed.investment_transactions) parsed.investment_transactions = [];
        return parsed;
    } catch (error) {
        return { contacts: [], transactions: [], investments: [], investment_transactions: [] };
    }
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// Ensure data file exists with default schema
if (!fs.existsSync(DATA_FILE)) {
    writeData({ contacts: [], transactions: [], investments: [], investment_transactions: [] });
}

// Routes
// 1. Get all contacts and their balances
app.get('/api/contacts', (req, res) => {
    const data = readData();
    res.json(data.contacts);
});

// 2. Add a new contact
app.post('/api/contacts', (req, res) => {
    const data = readData();
    const { name, phone } = req.body;
    
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const newContact = {
        id: Date.now().toString(),
        name,
        phone: phone || '',
        balance: 0, // positive means they owe me (Credit), negative means I owe them (Debit)
        createdAt: new Date().toISOString()
    };
    
    data.contacts.push(newContact);
    writeData(data);
    res.status(201).json(newContact);
});

// 3. Get transactions for a contact
app.get('/api/transactions/:contactId', (req, res) => {
    const data = readData();
    const { contactId } = req.params;
    const contactTransactions = data.transactions.filter(t => t.contactId === contactId);
    
    // sort by date descending
    contactTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(contactTransactions);
});

// 4. Add a transaction
app.post('/api/transactions', (req, res) => {
    const data = readData();
    const { contactId, amount, type, note } = req.body;
    
    if (!contactId || !amount || !type) {
        return res.status(400).json({ error: 'contactId, amount, and type are required' });
    }

    // Determine balance adjustment: 
    // 'credit' = I gave them money, their balance increases
    // 'payment' = They paid me back, their balance decreases
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ error: 'Valid amount is required' });
    }

    const newTransaction = {
        id: Date.now().toString(),
        contactId,
        amount: numAmount,
        type, // 'credit' or 'payment'
        note: note || '',
        date: new Date().toISOString()
    };

    // Update contact balance
    let contactFound = false;
    for (const contact of data.contacts) {
        if (contact.id === contactId) {
            contactFound = true;
            if (type === 'credit' || type === 'interest') {
                contact.balance += numAmount;
            } else if (type === 'payment') {
                contact.balance -= numAmount;
            }
            break;
        }
    }

    if (!contactFound) {
        return res.status(404).json({ error: 'Contact not found' });
    }

    data.transactions.push(newTransaction);
    writeData(data);
    res.status(201).json(newTransaction);
});

// 5. Delete a contact
app.delete('/api/contacts/:contactId', (req, res) => {
    const data = readData();
    const { contactId } = req.params;
    
    const initialLen = data.contacts.length;
    data.contacts = data.contacts.filter(c => c.id !== contactId);
    data.transactions = data.transactions.filter(t => t.contactId !== contactId);
    
    if (data.contacts.length === initialLen) {
        return res.status(404).json({ error: 'Contact not found' });
    }
    
    writeData(data);
    res.json({ success: true });
});

// 6. Delete a transaction
app.delete('/api/transactions/:transactionId', (req, res) => {
    const data = readData();
    const { transactionId } = req.params;
    
    const transactionIndex = data.transactions.findIndex(t => t.id === transactionId);
    if (transactionIndex === -1) {
        return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const transaction = data.transactions[transactionIndex];
    
    // Reverse the balance effect
    const contact = data.contacts.find(c => c.id === transaction.contactId);
    if (contact) {
        if (transaction.type === 'credit' || transaction.type === 'interest') {
            contact.balance -= transaction.amount;
        } else if (transaction.type === 'payment') {
            contact.balance += transaction.amount;
        }
    }
    
    data.transactions.splice(transactionIndex, 1);
    writeData(data);
    res.json({ success: true });
});

// ==========================================
// INVESTMENTS ROUTES
// ==========================================

app.get('/api/investments', (req, res) => {
    const data = readData();
    res.json(data.investments);
});

app.post('/api/investments', (req, res) => {
    const data = readData();
    const { name, type } = req.body;
    
    if (!name || !type) return res.status(400).json({ error: 'Name and type are required' });

    const newInvestment = {
        id: Date.now().toString(),
        name,
        type, // 'EPF', 'Mutual Fund', 'FD', etc.
        balance: 0,
        createdAt: new Date().toISOString()
    };
    
    data.investments.push(newInvestment);
    writeData(data);
    res.status(201).json(newInvestment);
});

app.delete('/api/investments/:id', (req, res) => {
    const data = readData();
    const { id } = req.params;
    
    const initialLen = data.investments.length;
    data.investments = data.investments.filter(i => i.id !== id);
    data.investment_transactions = data.investment_transactions.filter(t => t.investmentId !== id);
    
    if (data.investments.length === initialLen) {
        return res.status(404).json({ error: 'Investment not found' });
    }
    
    writeData(data);
    res.json({ success: true });
});

app.get('/api/investment-transactions/:investmentId', (req, res) => {
    const data = readData();
    const { investmentId } = req.params;
    const invTransactions = data.investment_transactions.filter(t => t.investmentId === investmentId);
    invTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(invTransactions);
});

app.post('/api/investment-transactions', (req, res) => {
    const data = readData();
    const { investmentId, amount, type, note } = req.body;
    
    if (!investmentId || !amount || !type) {
        return res.status(400).json({ error: 'investmentId, amount, and type are required' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ error: 'Valid amount is required' });
    }

    const newTransaction = {
        id: Date.now().toString(),
        investmentId,
        amount: numAmount,
        type, // 'invest', 'return', 'withdraw'
        note: note || '',
        date: new Date().toISOString()
    };

    let found = false;
    for (const inv of data.investments) {
        if (inv.id === investmentId) {
            found = true;
            if (type === 'invest' || type === 'return') {
                inv.balance += numAmount;
            } else if (type === 'withdraw') {
                inv.balance -= numAmount;
            }
            break;
        }
    }

    if (!found) return res.status(404).json({ error: 'Investment not found' });

    data.investment_transactions.push(newTransaction);
    writeData(data);
    res.status(201).json(newTransaction);
});

app.delete('/api/investment-transactions/:id', (req, res) => {
    const data = readData();
    const { id } = req.params;
    
    const index = data.investment_transactions.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ error: 'Transaction not found' });
    
    const trans = data.investment_transactions[index];
    const inv = data.investments.find(i => i.id === trans.investmentId);
    
    if (inv) {
        if (trans.type === 'invest' || trans.type === 'return') {
            inv.balance -= trans.amount;
        } else if (trans.type === 'withdraw') {
            inv.balance += trans.amount;
        }
    }
    
    data.investment_transactions.splice(index, 1);
    writeData(data);
    res.json({ success: true });
});

// ==========================================
// REPORTS ROUTES
// ==========================================

app.get('/api/reports/monthly', (req, res) => {
    const data = readData();
    
    // Structure: { 'YYYY-MM': { debit: 0, credit: 0, loanGiven: 0, interestAdded: 0, amountReceived: 0, transactions: [] } }
    const monthlyData = {};

    const getContactName = (id) => { const c = data.contacts.find(x => x.id === id); return c ? c.name : 'Unknown'; };
    const getInvName = (id) => { const i = data.investments.find(x => x.id === id); return i ? i.name : 'Unknown'; };

    const processTransaction = (t, isInvestment) => {
        const d = new Date(t.date);
        if (isNaN(d.getTime())) return;

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const monthKey = `${year}-${month}`;

        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { 
                debit: 0, 
                credit: 0, 
                loanGiven: 0,
                interestAdded: 0,
                amountReceived: 0,
                transactions: [], 
                sortKey: monthKey 
            };
        }

        monthlyData[monthKey].transactions.push({
            id: t.id,
            date: t.date,
            amount: t.amount,
            type: t.type,
            note: t.note,
            entityName: isInvestment ? getInvName(t.investmentId) : getContactName(t.contactId),
            isInvestment
        });

        // Cash flow definition
        if (!isInvestment) {
            // Customer transaction
            if (t.type === 'credit') { // gave loan out
                monthlyData[monthKey].debit += t.amount;
                monthlyData[monthKey].loanGiven += t.amount;
            } else if (t.type === 'payment') { // received payment in
                monthlyData[monthKey].credit += t.amount;
                monthlyData[monthKey].amountReceived += t.amount;
            } else if (t.type === 'interest') {
                monthlyData[monthKey].interestAdded += t.amount;
            }
        } else {
            // Investment transaction
            if (t.type === 'invest') { // funds out
                monthlyData[monthKey].debit += t.amount;
            } else if (t.type === 'withdraw' || t.type === 'return') { // funds in
                monthlyData[monthKey].credit += t.amount;
            }
        }
    };

    data.transactions.forEach(t => processTransaction(t, false));
    data.investment_transactions.forEach(t => processTransaction(t, true));

    // Sort transactions within each month by date descending
    Object.values(monthlyData).forEach(m => {
        m.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    // Convert to sorted array (newest first)
    const sorted = Object.values(monthlyData).sort((a, b) => b.sortKey.localeCompare(a.sortKey));

    res.json(sorted);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
