var express = require('express')
var router = express.Router()
const User = require('../jwt/model/userModel')
const auth = require('../jwt/middleware/auth')
const assignmentSchema = require('../jwt/model/assignmentModel')
const conf = process.env
//create assignment
router.post('/create', auth, async function (req, res) {
    if (req.user.type !== conf.TUTOR)
        return res.status(401).send('Unauthorized To acess')

    try {
        const {
            assignment_name,
            assignment_description,
            assignment_publishdate,
            assignment_deadline,
            student_email,
        } = req.body
        if (
            !(
                assignment_name &&
                assignment_description &&
                assignment_publishdate &&
                assignment_deadline &&
                student_email
            )
        ) {
            res.status(400).send('Missing fields')
        }
        //check email is registerd or not

        var notRegisterEmails = []
        for (let i = 0; i < student_email.length; i++) {
            const email = student_email[i]
            const oldUser = await User.findOne({ email: email.toLowerCase() })
            if (!oldUser) {
                i--
                notRegisterEmails.push(email)
                const index = student_email.indexOf(email)
                console.log(index)
                if (index > -1) student_email.splice(index, 1)
            }
        }

        let assignment_status = conf.ONGOING

        const newassignment_publishdate = Date.parse(assignment_publishdate)
        const newassignment_deadline = Date.parse(assignment_deadline)

        if (newassignment_publishdate > new Date().getTime())
            assignment_status = conf.SCHEDULED

        if (student_email.length > 0) {
            var student_submission_list = []

            for (email of student_email) {
                const oldUser = await User.findOne({
                    email: email.toLowerCase(),
                })
                if (oldUser) {
                    console.log(oldUser)

                    const tempStudentSubmission = {
                        submissionlink: null,
                        submissiondate: null,
                        status: conf.PENDING,
                        remark: null,
                    }
                    student_submission_list.push(tempStudentSubmission)
                }
            }

            const createdAssignment = await assignmentSchema.create({
                tutor_id: req.user.user_id,
                assignment_name,
                assignment_description,
                assignment_publishdate: newassignment_publishdate.toString(),
                assignment_deadline: newassignment_deadline.toString(),
                assignment_status,
                student_email: student_email,
                student_submission: student_submission_list,
            })
            res.status(201).send(createdAssignment)
        } else {
            res.status(400).send('NO student Emails please add student email')
        }
    } catch (err) {
        res.status(400).send(err)
    }
})

//Update assignment
router.post('/update/:assignmentId', auth, async function (req, res) {
    if (req.user.type !== conf.TUTOR)
        return res.status(401).send('Unauthorized To acess')
    try {
        if (req.params.assignmentId) {
            const assignment = await assignmentSchema.findOne({
                _id: req.params.assignmentId,
            })
            if (!assignment) {
                return res.status(400).send('assignment id is Invalid.')
            }
            if (!assignment.tutor_id.equals(req.user.user_id)) {
                return res
                    .status(400)
                    .send('you are not Tutor for this Assignment.')
            }
        }
        const {
            assignment_name,
            assignment_description,
            assignment_publishdate,
            assignment_deadline,
            student_email,
        } = req.body
        if (
            !(
                assignment_name &&
                assignment_description &&
                assignment_publishdate &&
                assignment_deadline &&
                student_email
            )
        ) {
            res.status(400).send('Missing fields')
        }
        //check email is registerd or not
        var notRegisterEmails = []
        for (let i = 0; i < student_email.length; i++) {
            const email = student_email[i]
            const oldUser = await User.findOne({ email: email.toLowerCase() })
            if (!oldUser) {
                i--
                notRegisterEmails.push(email)
                const index = student_email.indexOf(email)
                console.log(index)
                if (index > -1) student_email.splice(index, 1)
            }
        }
        let assignment_status = conf.ONGOING

        const newassignment_publishdate = Date.parse(assignment_publishdate)
        const newassignment_deadline = Date.parse(assignment_deadline)

        console.log(newassignment_publishdate)
        console.log(new Date().getTime())
        if (newassignment_publishdate > new Date().getTime())
            assignment_status = conf.SCHEDULED

        if (student_email.length > 0) {
            var student_submission_list = []

            for (email of student_email) {
                const oldUser = await User.findOne({
                    email: email.toLowerCase(),
                })
                if (oldUser) {
                    console.log(oldUser)

                    const tempStudentSubmission = {
                        submissionlink: null,
                        submissiondate: null,
                        status: conf.PENDING,
                        remark: null,
                    }
                    student_submission_list.push(tempStudentSubmission)
                }
            }
            const updatedAssignment = await assignmentSchema.findOneAndUpdate(
                {
                    _id: req.params.assignmentId,
                    tutor_id: req.user.user_id,
                },
                {
                    assignment_name,
                    assignment_description,
                    assignment_publishdate:
                        newassignment_publishdate.toString(),
                    assignment_deadline: newassignment_deadline.toString(),
                    assignment_status,
                    student_email: student_email,
                    student_submission: student_submission_list,
                }
            )
            res.status(200).send(updatedAssignment)
        }
    } catch (err) {
        res.status(400).send(err)
    }
})

//delete assignment
router.post('/delete/:assignmentId', auth, async function (req, res) {
    if (req.user.type !== conf.TUTOR)
        return res.status(401).send('Unauthorized To acess')

    try {
        if (req.params.assignmentId) {
            const assignment = await assignmentSchema.findOne({
                _id: req.params.assignmentId,
            })
            if (!assignment) {
                return res.status(400).send('assignment id is Invalid.')
            }
            if (assignment.tutor_id != req.user.user_id) {
                return res
                    .status(400)
                    .send('you are not Tutor for this Assignment.')
            }
        }
        const deletedAssignment = await assignmentSchema.findOneAndRemove({
            _id: req.params.assignmentId,
            tutor_id: req.user.user_id,
        })
        res.status(200).send(deletedAssignment)
    } catch (err) {
        res.status(400).send(err)
    }
})

//student assign assignments
router.post('/assign', auth, async function (req, res) {
    if (req.user.type !== conf.STUDENT)
        return res.status(401).send('Unauthorized To acess')

    try {
        const assignmentList = await assignmentSchema.find({})
        var studentAssignmentList = []
        for (let i = 0; i < assignmentList.length; i++) {
            const emailindex = assignmentList[i].student_email.indexOf(
                req.user.email
            )
            if (emailindex >= 0) {
                console.log(assignmentList[i])
                const tempAssignment = {
                    assignment_name: assignmentList[i].assignment_name,
                    assignment_description:
                        assignmentList[i].assignment_description,
                    assignment_publishdate:
                        assignmentList[i].assignment_publishdate,
                    assignment_deadline: assignmentList[i].assignment_deadline,
                    student_submission: {
                        submissionlink:
                            assignmentList[i].student_submission[emailindex]
                                .submissionlink,
                        submissiondate:
                            assignmentList[i].student_submission[emailindex]
                                .submissiondate,
                        status: assignmentList[i].student_submission[emailindex]
                            .status,
                        remark: assignmentList[i].student_submission[emailindex]
                            .remark,
                    },
                }
                studentAssignmentList.push(tempAssignment)
            }
        }

        res.status(200).send(studentAssignmentList)
    } catch (err) {
        res.status(400).send(err)
    }
})

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
