const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_management';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ MongoDB Error:', err));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const examRoutes = require('./routes/examRoutes');
const marksRoutes = require('./routes/marksRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/marks', marksRoutes);

// Home route
app.get('/', (req, res) => {
    res.json({
        message: '🎓 School Management API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login'
            },
            assignments: {
                create: 'POST /api/assignments (teacher only)',
                get: 'GET /api/assignments',
                delete: 'DELETE /api/assignments/:id (teacher only)'
            },
            exams: {
                create: 'POST /api/exams (teacher only)',
                get: 'GET /api/exams',
                delete: 'DELETE /api/exams/:id (teacher only)'
            },
            marks: {
                add: 'POST /api/marks (teacher only)',
                get: 'GET /api/marks'
            }
        }
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});