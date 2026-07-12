const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /login - Secure login returning a JWT
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Entered email is not valid' });
    }

    try {
        const promisePool = db.promise();
        const [users] = await promisePool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];
        
        // Securely compare the provided password with the hashed password in the DB
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT Payload
        const token = jwt.sign(
            { email: user.email, name: user.name, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '8h' }
        );

        res.json({ 
            message: 'Login successful',
            token,
            user: {
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /register - Helper route to create users with hashed passwords
router.post('/register', async (req, res) => {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Entered email is not valid' });
    }

    try {
        // Hash the password securely with 10 salt rounds
        const hashedPassword = await bcrypt.hash(password, 10);
        const promisePool = db.promise();
        
        await promisePool.query(
            'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, name, role || 'Fleet Manager']
        );

        res.status(201).json({ message: 'User created successfully. You can now login.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
