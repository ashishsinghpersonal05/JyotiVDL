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
        return JSON.parse(data);
    } catch (error) {
        return { contacts: [], transactions: [] };
    }
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// Ensure data file exists with default schema
if (!fs.existsSync(DATA_FILE)) {
    writeData({ contacts: [], transactions: [] });
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
