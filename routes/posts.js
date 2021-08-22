const express = require('express')
const auth = require('../middlewares/auth')
const postsController = require('../controllers/posts')

const router = express.Router()

router.get('/',  async (req, res, next) => {
    user = req.session.user
    const comments = await postsController.getAllPosts()

    // who posted

    return res.render('posts/index', {
        user: user,
        comments: comments
    })
})

router
.post('/add', auth, postsController.add)
.get('/add', auth,(req, res) => {
    user = req.session.user
    res.render('posts/add', {
        user: user
    })
})

module.exports = router