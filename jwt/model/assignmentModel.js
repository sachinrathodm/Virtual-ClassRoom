const mongoose = require('mongoose')
const conf = process.env

const assignmentSchema = new mongoose.Schema({
    tutor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null,
    },
    assignment_name: { type: String, default: null },
    assignment_description: { type: String, default: null },
    assignment_publishdate: { type: String, default: null },
    assignment_deadline: { type: String, default: null },
    assignment_status: { type: String, default: null },
    student_email: [{ type: String, default: null }],
    student_submission: [
        {
            submissionlink: { type: String, default: null },
            submissiondate: { type: String, default: null },
            status: { type: String, default: conf.PENDING },
            remark: { type: String, default: null },
        },
    ],
})

module.exports = mongoose.model('assignment', assignmentSchema)
