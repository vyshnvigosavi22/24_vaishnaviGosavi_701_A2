const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/erp_system');

// Employee Schema (same as Q4)
const employeeSchema = new mongoose.Schema({
    empId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    basicSalary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number }
});

const Employee = mongoose.model('Employee', employeeSchema);

// Leave Application Schema
const leaveSchema = new mongoose.Schema({
    empId: { type: String, required: true },
    date: { type: Date, required: true },
    reason: { type: String, required: true },
    granted: { type: String, enum: ['pending', 'yes', 'no'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const Leave = mongoose.model('Leave', leaveSchema);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const JWT_SECRET = 'employee-jwt-secret';

// JWT Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/api/login', async (req, res) => {
    try {
        const { empId, password } = req.body;
        
        const employee = await Employee.findOne({ empId });
        if (!employee) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const validPassword = await bcrypt.compare(password, employee.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { empId: employee.empId, name: employee.name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ token, employee: { empId: employee.empId, name: employee.name } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const employee = await Employee.findOne({ empId: req.user.empId });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/leave', authenticateToken, async (req, res) => {
    try {
        const { date, reason } = req.body;
        
        const leave = new Leave({
            empId: req.user.empId,
            date: new Date(date),
            reason
        });
        
        await leave.save();
        res.json({ message: 'Leave application submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/leaves', authenticateToken, async (req, res) => {
    try {
        const leaves = await Leave.find({ empId: req.user.empId });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3004, () => {
    console.log('Employee JWT Site running on http://localhost:3004');
});
