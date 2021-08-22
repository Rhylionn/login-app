const express = require('express')
const redirectUrl = require('../middlewares/redirectUrl')
const userController = require('../controllers/user')
const router = express.Router()

router.get('/', (req, res) => {
    const user = req.session.user
    const picPath = userController.getPicture(user.uuid)
    user.isAdmin = user.role === 'ADMIN' ? true : false

   userController.findUser(req.session.user.uuid)

    return res.render('profile/index', {
        user: user,
        profilePicture: picPath != undefined ? picPath :  '/profile/pictures/default_picture.jpg'
    })
})

router.get('/logout', (req, res) => {
    req.session.destroy()
    return res.redirect('/')
})

router
.post('/edit', (req, res) => {
    if ('changeEmail' in req.body) { 
        userController.changeEmail(req, res)
    } else if ('changePassword' in req.body) {
        userController.changePassword(req, res)
    } else {
        res.send('ERROR')
    }
})
.get('/edit', (req, res) => {
    user = req.session.user
    return res.render('profile/edit', {
        user: user
    })
})

router
.post('/edit/picture', userController.changePicture)
.get('/edit/picture', (req, res) => {
    user = req.session.user
    return res.render('profile/picture', {
        user: user
    })
})

router
.post('/delete', userController.deleteMyAccount)
.get('/delete', (req, res) => {
    user = req.session.user
    return res.render('profile/delete', {
        user: user
    })
})

module.exports = router