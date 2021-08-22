var express = require('express')
var router = express.Router()
const User = require('../jwt/model/userModel')
const auth = require('../jwt/middleware/auth')
const assignmentSchema = require('../jwt/model/assignmentModel')
const conf = process.env

//student submit Assignment
router.post('/submit/:assignmentId', auth, async function (req, res) {
    if (req.user.type !== conf.STUDENT)
        return res.status(401).send('Unauthorized To acess')

    try {
        const assignment = await assignmentSchema.findOne({
            _id: req.params.assignmentId,
        })
        if (!assignment) res.status(400).send('assignment id is Invalid.')
        if (!assignment.student_email.includes(req.user.email))
            res.status(400).send('you are not register for this Assignment.')
        const { submissionlink } = req.body
        if (!submissionlink) res.status(400).send('Missing fields')
        console.log(req.user.email)
        var indexOfStudent = assignment.student_email.indexOf(req.user.email)

        if (indexOfStudent >= 0) {
            if (assignment.student_submission[indexOfStudent].submissionlink)
                return res.status(400).send('You have already submitted')

            assignment.student_submission[indexOfStudent].submissionlink =
                submissionlink
            assignment.student_submission[indexOfStudent].submissiondate =
                new Date().getTime()
            new Date().getTime() > assignment.assignment_deadline
                ? (assignment.student_submission[indexOfStudent].status =
                      conf.OVERDUE)
                : (assignment.student_submission[indexOfStudent].status =
                      conf.SUBMITTED)
        }
        assignment.save()
        res.status(200).send(assignment.student_submission[indexOfStudent])
    } catch (err) {
        res.status(400).send(err)
    }
})

module.exports = router
