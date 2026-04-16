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
        if (!parsed.properties) parsed.properties = [];
        if (!parsed.property_transactions) parsed.property_transactions = [];
        if (!parsed.loans) parsed.loans = [];
        if (!parsed.loan_transactions) parsed.loan_transactions = [];
        return parsed;
    } catch (error) {
        console.error(error);
        return { contacts: [], transactions: [], investments: [], investment_transactions: [], properties: [], property_transactions: [], loans: [], loan_transactions: [] };
    }
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// Ensure data file exists with default schema
if (!fs.existsSync(DATA_FILE)) {
    writeData({ contacts: [], transactions: [], investments: [], investment_transactions: [], properties: [], property_transactions: [], loans: [], loan_transactions: [] });
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
// PROPERTIES ROUTES
// ==========================================

app.get('/api/properties', (req, res) => {
    const data = readData();
    res.json(data.properties);
});

app.post('/api/properties', (req, res) => {
    const data = readData();
    const { name, type } = req.body;
    
    if (!name || !type) return res.status(400).json({ error: 'Name and type are required' });

    const newProperty = {
        id: Date.now().toString(),
        name,
        type,
        balance: 0,
        createdAt: new Date().toISOString()
    };
    
    data.properties.push(newProperty);
    writeData(data);
    res.status(201).json(newProperty);
});

app.delete('/api/properties/:id', (req, res) => {
    const data = readData();
    const { id } = req.params;
    
    const initialLen = data.properties.length;
    data.properties = data.properties.filter(p => p.id !== id);
    data.property_transactions = data.property_transactions.filter(t => t.propertyId !== id);
    
    if (data.properties.length === initialLen) {
        return res.status(404).json({ error: 'Property not found' });
    }
    
    writeData(data);
    res.json({ success: true });
});

app.get('/api/property-transactions/:propertyId', (req, res) => {
    const data = readData();
    const { propertyId } = req.params;
    const propTransactions = data.property_transactions.filter(t => t.propertyId === propertyId);
    propTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(propTransactions);
});

app.post('/api/property-transactions', (req, res) => {
    const data = readData();
    const { propertyId, amount, type, note } = req.body;
    
    if (!propertyId || !amount || !type) {
        return res.status(400).json({ error: 'propertyId, amount, and type are required' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ error: 'Valid amount is required' });
    }

    const newTransaction = {
        id: Date.now().toString(),
        propertyId,
        amount: numAmount,
        type,
        note: note || '',
        date: new Date().toISOString()
    };

    let found = false;
    for (const prop of data.properties) {
        if (prop.id === propertyId) {
            found = true;
            if (type === 'buy' || type === 'appreciation') {
                prop.balance += numAmount;
            } else if (type === 'depreciation' || type === 'sell') {
                prop.balance -= numAmount;
            }
            break;
        }
    }

    if (!found) return res.status(404).json({ error: 'Property not found' });

    data.property_transactions.push(newTransaction);
    writeData(data);
    res.status(201).json(newTransaction);
});

app.delete('/api/property-transactions/:id', (req, res) => {
    const data = readData();
    const { id } = req.params;
    
    const index = data.property_transactions.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ error: 'Transaction not found' });
    
    const trans = data.property_transactions[index];
    const prop = data.properties.find(p => p.id === trans.propertyId);
    
    if (prop) {
        if (trans.type === 'buy' || trans.type === 'appreciation') {
            prop.balance -= trans.amount;
        } else if (trans.type === 'depreciation' || trans.type === 'sell') {
            prop.balance += trans.amount;
        }
    }
    
    data.property_transactions.splice(index, 1);
    writeData(data);
    res.json({ success: true });
});

// ==========================================
// LOANS ROUTES
// ==========================================

app.get('/api/loans', (req, res) => {
    const data = readData();
    res.json(data.loans);
});

app.post('/api/loans', (req, res) => {
    const data = readData();
    const { name, type } = req.body;
    
    if (!name || !type) return res.status(400).json({ error: 'Name and type are required' });

    const newLoan = {
        id: Date.now().toString(),
        name,
        type, // 'Home Loan', 'Car Loan', 'Personal Loan', etc.
        balance: 0,
        createdAt: new Date().toISOString()
    };
    
    data.loans.push(newLoan);
    writeData(data);
    res.status(201).json(newLoan);
});

app.delete('/api/loans/:id', (req, res) => {
    const data = readData();
    const { id } = req.params;
    
    const initialLen = data.loans.length;
    data.loans = data.loans.filter(l => l.id !== id);
    data.loan_transactions = data.loan_transactions.filter(t => t.loanId !== id);
    
    if (data.loans.length === initialLen) {
        return res.status(404).json({ error: 'Loan not found' });
    }
    
    writeData(data);
    res.json({ success: true });
});

app.get('/api/loan-transactions/:loanId', (req, res) => {
    const data = readData();
    const { loanId } = req.params;
    const loanTransactions = data.loan_transactions.filter(t => t.loanId === loanId);
    loanTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(loanTransactions);
});

app.post('/api/loan-transactions', (req, res) => {
    const data = readData();
    const { loanId, amount, type, note } = req.body;
    
    if (!loanId || !amount || !type) {
        return res.status(400).json({ error: 'loanId, amount, and type are required' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ error: 'Valid amount is required' });
    }

    const newTransaction = {
        id: Date.now().toString(),
        loanId,
        amount: numAmount,
        type, // 'borrow', 'repay', 'interest'
        note: note || '',
        date: new Date().toISOString()
    };

    let found = false;
    for (const loan of data.loans) {
        if (loan.id === loanId) {
            found = true;
            if (type === 'borrow' || type === 'interest') {
                loan.balance += numAmount; // Balance represents total debt owed
            } else if (type === 'repay') {
                loan.balance -= numAmount;
            }
            break;
        }
    }

    if (!found) return res.status(404).json({ error: 'Loan not found' });

    data.loan_transactions.push(newTransaction);
    writeData(data);
    res.status(201).json(newTransaction);
});

app.delete('/api/loan-transactions/:id', (req, res) => {
    const data = readData();
    const { id } = req.params;
    
    const index = data.loan_transactions.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ error: 'Transaction not found' });
    
    const trans = data.loan_transactions[index];
    const loan = data.loans.find(l => l.id === trans.loanId);
    
    if (loan) {
        if (trans.type === 'borrow' || trans.type === 'interest') {
            loan.balance -= trans.amount;
        } else if (trans.type === 'repay') {
            loan.balance += trans.amount;
        }
    }
    
    data.loan_transactions.splice(index, 1);
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
