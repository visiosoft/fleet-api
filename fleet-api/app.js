const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerDocs = require('./swagger');
const app = express();
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const vehicleRoutes = require('./routes/vehicleRoutes');
const fuelRoutes = require('./routes/fuelRoutes');
const companySettingsRoutes = require('./routes/companyProfileRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const noteRoutes = require('./routes/noteRoutes');
const receiptRoutes = require('./routes/receiptRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/company', companySettingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/receipts', receiptRoutes);

// MongoDB connection
mongoose.connect('mongodb+srv://devxulfiqar:nSISUpLopruL7S8j@mypaperlessoffice.z5g84.mongodb.net/fleet-management?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Root route for API information
app.get('/', (req, res) => {
  res.json({
    message: 'Fleet Management API',
    documentation: '/api-docs',
    version: '1.0.0'
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    documentation: '/api-docs'
  });
});

const PORT = process.env.PORT || 5000;

// Initialize Swagger
swaggerDocs(app, PORT);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 