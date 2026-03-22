const Marks = require('../models/Marks');
const User = require('../models/User');

// Add marks
exports.addMarks = async (req, res) => {
    try {
        const { registrationNumber, assessmentType, assessmentName, marksObtained, semester } = req.body;

        // Find student
        const student = await User.findOne({ 
            registrationNumber,
            userType: 'student' 
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const marks = new Marks({
            student: student._id,
            registrationNumber,
            assessmentType,
            assessmentName,
            marksObtained,
            semester,
            teacher: req.user.userId
        });

        await marks.save();
        res.json({ success: true, marks });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Get marks
exports.getMarks = async (req, res) => {
    try {
        let marks;
        
        if (req.user.userType === 'teacher') {
            marks = await Marks.find({ teacher: req.user.userId });
        } else {
            marks = await Marks.find({ student: req.user.userId });
        }

        res.json({ success: true, marks });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};