const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'transitops_super_secret_key';

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'TransitOps API is running' });
});

// Routes
const vehiclesRouter = require('./routes/vehicles');
const driversRouter = require('./routes/drivers');
const tripsRouter = require('./routes/trips');
const authRouter = require('./routes/auth');
const maintenanceRouter = require('./routes/maintenance');
const reportsRouter = require('./routes/reports');
const expensesRouter = require('./routes/expenses');

const { authenticateToken } = require('./middleware/auth');

// Public Route (No token required)
app.use('/api/auth', authRouter);

// Apply JWT Authentication Middleware to all routes below this line
// This strictly enforces: "Only authenticated users should access the application"
app.use(authenticateToken);

app.use('/api/vehicles', vehiclesRouter);
app.use('/api/drivers', driversRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/expenses', expensesRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
