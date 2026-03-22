const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const teacher = require('../middleware/teacher');
const { 
    createExam, 
    getExams, 
    deleteExam 
} = require('../controllers/examController');

// Create exam (teacher only)
router.post('/', auth, teacher, createExam);

// Get exams
router.get('/', auth, getExams);

// Delete exam (teacher only)
router.delete('/:id', auth, teacher, deleteExam);

module.exports = router;