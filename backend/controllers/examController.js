const Exam = require('../models/Exam');

// Create exam
exports.createExam = async (req, res) => {
    try {
        const { examName, subject, date, duration, totalMarks } = req.body;
        
        const exam = new Exam({
            examName,
            subject,
            date,
            duration,
            totalMarks,
            teacher: req.user.userId
        });

        await exam.save();
        res.json({ success: true, exam });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Get exams
exports.getExams = async (req, res) => {
    try {
        let exams;
        
        if (req.user.userType === 'teacher') {
            exams = await Exam.find({ teacher: req.user.userId });
        } else {
            exams = await Exam.find();
        }

        res.json({ success: true, exams });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete exam
exports.deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        if (exam.teacher.toString() !== req.user.userId) {
            return res.status(401).json({ error: 'Not authorized' });
        }

        await exam.deleteOne();
        res.json({ success: true, message: 'Exam deleted' });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};