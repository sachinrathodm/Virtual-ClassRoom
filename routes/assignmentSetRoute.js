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
        if (newassignment_publishdate < new Date().getTime())
            return res.status(400).send('assignment publishdate is Invalid.')
        if (newassignment_deadline < newassignment_publishdate)
            return res.status(400).send('assignment deadline is Invalid.')
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
        if (newassignment_publishdate < new Date().getTime())
            return res.status(400).send('assignment publishdate is Invalid.')
        if (newassignment_deadline < newassignment_publishdate)
            return res.status(400).send('assignment deadline is Invalid.')

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

//tutor view assignment list
router.get('/assignmentlist', auth, async function (req, res) {
    if (req.user.type !== conf.TUTOR)
        return res.status(401).send('Unauthorized To acess')
    try {
        const assignmentList = await assignmentSchema.find({
            tutor_id: req.user.user_id,
        })
        res.status(200).send(assignmentList)
    } catch (err) {
        res.status(400).send(err)
    }
})

//given remark
router.post(
    '/remark/:assignmentId/:studentid',
    auth,
    async function (req, res) {
        if (req.user.type !== conf.TUTOR)
            return res.status(401).send('Unauthorized To acess')
        try {
            const assignment = await assignmentSchema.findOne({
                _id: req.params.assignmentId,
            })
            const studentid = await User.findOne({
                _id: req.params.studentid,
            })
            console.log(studentid)
            console.log(assignment.student_email.includes(studentid.email))
            console.log(assignment)
            console.log(assignment.tutor_id.equals(req.user.user_id))
            if (!studentid)
                return res.status(400).send('student id is Invalid.')
            if (!assignment.student_email.includes(studentid.email))
                return res.status(400).send('student id is not in email.')
            if (!assignment)
                return res.status(400).send('assignment id is Invalid.')
            if (!assignment.tutor_id.equals(req.user.user_id))
                return res
                    .status(400)
                    .send('you are not register for this Assignment.')
            const { remark } = req.body
            if (!remark) res.status(400).send('Missing fields')
            console.log(remark)
            const emailindex = assignment.student_email.indexOf(studentid.email)
            assignment.student_submission[emailindex].remark = remark
            assignment.save()
            res.status(200).send(assignment.student_submission[emailindex])
        } catch (err) {
            res.status(400).send(err)
        }
    }
)

//GET ALL PENDING SUBMITTED OVERDUE STUDENT ASSIGNMENT
router.get('/:status/:assignmentId', auth, async function (req, res) {
    if (req.user.type !== conf.TUTOR && req.user.type !== conf.STUDENT)
        return res.status(401).send('Unauthorized To acess')
    try {
        const status = req.params.status
        if (
            !(
                status != conf.PENDING ||
                status != conf.SUBMITTED ||
                status != conf.OVERDUE ||
                status != conf.ALL
            )
        )
            return res.status(400).send('status is Invalid.')

        const assignment = await assignmentSchema.findOne({
            _id: req.params.assignmentId,
        })
        if (!assignment) res.status(400).send('assignment id is Invalid.')
        if (req.user.type == conf.TUTOR) {
            if (!assignment.tutor_id.equals(req.user.user_id))
                res.status(400).send(
                    'you are not register for this Assignment.'
                )

            const { student_submission } = assignment
            if (student_submission.length > 0) {
                var pendingStudentAssignment = []
                for (let i = 0; i < student_submission.length; i++) {
                    if (
                        status == conf.ALL ||
                        student_submission[i].status === status
                    ) {
                        pendingStudentAssignment.push({
                            ...student_submission[i]._doc,
                            email: assignment.student_email[i],
                        })
                    }
                }
                res.status(200).send(pendingStudentAssignment)
            }
        } else if (req.user.type == conf.STUDENT) {
            const emailindex = assignment.student_email.indexOf(req.user.email)
            const { student_submission } = assignment
            if (student_submission.length > 0) {
                var pendingStudentAssignment = []

                if (
                    status == conf.ALL ||
                    student_submission[emailindex].status === status
                ) {
                    pendingStudentAssignment.push({
                        ...student_submission[emailindex]._doc,
                        email: assignment.student_email[emailindex],
                    })
                }
                res.status(200).send(pendingStudentAssignment)
            }
        } else {
            res.status(200).send(assignment.student_submission)
        }
    } catch (err) {
        res.status(400).send(err)
    }
})

module.exports = router
