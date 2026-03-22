const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const teacher = require('../middleware/teacher');
const { 
    createAssignment, 
    getAssignments, 
    deleteAssignment 
} = require('../controllers/assignmentController');

// Create assignment (teacher only)
router.post('/', auth, teacher, createAssignment);

// Get assignments
router.get('/', auth, getAssignments);

// Delete assignment (teacher only)
router.delete('/:id', auth, teacher, deleteAssignment);

module.exports = router;