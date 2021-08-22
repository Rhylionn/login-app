const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.status(200).render('index', {
        layout: 'indexLayout',
        user: req.session.user
    })
})


module.exports = router