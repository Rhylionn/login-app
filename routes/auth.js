const express = require('express')
const authController = require('../controllers/auth')

const router = express.Router()

router
    .post('/register', authController.register )
    .get('/register', (req, res) => {
        res.status(200).render('auth/register')
    })
    
router
    .post('/login', authController.login)
    .get('/login', (req, res) => {
        res.status(200).render('auth/login')
    })


module.exports = router