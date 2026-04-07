// const startCronJobs = require('./utils/cronJobs');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const startCronJobs = require('./utils/cronJobs'); // NEW

// Import Routes
const authRoutes = require('./routes/authRoutes'); 
const animalRoutes = require('./routes/animalRoutes'); // NEW
const treatmentRoutes = require('./routes/treatmentRoutes'); // NEW
const pharmacistRoutes = require('./routes/pharmacistRoutes');
const adminRoutes = require('./routes/adminRoutes');
const registrarRoutes = require('./routes/registrarRoutes');
const aiReportRoutes = require('./routes/aiReportRoutes');

dotenv.config();
connectDB();

// Start cron jobs
startCronJobs();

const app = express();
app.use(express.json());
app.use(cors());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes); // NEW
app.use('/api/treatments', treatmentRoutes); // NEW
app.use('/api/pharmacist', pharmacistRoutes); // NEW
app.use('/api/admin', adminRoutes);
app.use('/api/registrar', registrarRoutes);
app.use('/api/ai-report', aiReportRoutes);

app.get('/', (req, res) => {
    res.send('Meditrack API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
