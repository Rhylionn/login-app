const express = require('express')
const router = express.Router()

const userController = require('../controllers/user')
const postController = require('../controllers/posts')
const adminController = require('../controllers/admin')

router.get('/', async (req, res) => {
    const untreated = await adminController.untreatedReports()
    res.render('admin/index', {
        user: req.session.user,
        untreated: untreated
    })
})

router.get('/reports', async (req, res) => {
    const reports = await adminController.reportData();

    res.render('admin/reports', {
        user: req.session.user,
        reports: reports
    })
})

module.exports = router