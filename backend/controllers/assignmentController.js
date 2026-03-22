const Assignment = require('../models/Assignment');

// Create assignment
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, subject, dueDate } = req.body;
        
        const assignment = new Assignment({
            title,
            description,
            subject,
            dueDate,
            teacher: req.user.userId
        });

        await assignment.save();
        res.json({ success: true, assignment });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Get assignments
exports.getAssignments = async (req, res) => {
    try {
        let assignments;
        
        if (req.user.userType === 'teacher') {
            assignments = await Assignment.find({ teacher: req.user.userId });
        } else {
            assignments = await Assignment.find();
        }

        res.json({ success: true, assignments });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        if (assignment.teacher.toString() !== req.user.userId) {
            return res.status(401).json({ error: 'Not authorized' });
        }

        await assignment.deleteOne();
        res.json({ success: true, message: 'Assignment deleted' });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};