const express = require('express')
const auth = require('../middlewares/auth')
const postsController = require('../controllers/posts')

const router = express.Router()

router.get('/',  async (req, res, next) => {
    user = req.session ? req.session.user : undefined
    const comments = await postsController.getAllPosts()
    
    comments.forEach(comment => {
        
        if (user === undefined){
            comment.isMine = false
        } else if (user.role === 'ADMIN'){
            comment.isMine = true
        } else {
            const isMine = comment.uuid === user.uuid ? true : false
            comment.isMine = isMine
        }

    });

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

router.get('/edit', auth, (req, res) => {
    user = req.session.user
    res.render('posts/add', {
        user: user
    })
})

module.exports = router