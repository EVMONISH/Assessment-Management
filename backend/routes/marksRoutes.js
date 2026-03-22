const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const teacher = require('../middleware/teacher');
const { addMarks, getMarks } = require('../controllers/marksController');

// Add marks (teacher only)
router.post('/', auth, teacher, addMarks);

// Get marks
router.get('/', auth, getMarks);

module.exports = router;