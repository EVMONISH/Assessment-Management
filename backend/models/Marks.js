const mongoose = require('mongoose');

const MarksSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    registrationNumber: {
        type: String,
        required: true
    },
    assessmentType: {
        type: String,
        enum: ['assignment', 'exam', 'quiz'],
        required: true
    },
    assessmentName: {
        type: String,
        required: true
    },
    marksObtained: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    totalMarks: {
        type: Number,
        default: 100
    },
    semester: {
        type: String,
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Marks', MarksSchema);