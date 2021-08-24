const express = require('express')
const router = express.Router()

const adminController = require('../controllers/admin')

router.get('/', async (req, res) => {
    const untreated = await adminController.untreatedReports()
    res.render('admin/index', {
        user: req.session.user,
        untreated: untreated
    })
})

router.get('/reports', (req, res) => {
    res.render('admin/reports')
})

module.exports = router