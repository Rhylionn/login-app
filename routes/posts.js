const express = require('express')
const auth = require('../middlewares/auth')
const postEditable = require('../middlewares/postEditable')

const postsController = require('../controllers/posts')
const User = require('../models/User')
const Post = require('../models/Post')

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

router
.post('/edit/:id', auth, postEditable, async (req, res) => {
    const post = await postsController.findPost(req.params.id)

    if (post instanceof Post){
        await post.edit(req.body.comment)
        return res.redirect('/posts')
    } else {
        console.log('Not a valid post')
        return res.render('posts/edit/' + req.params.id, {
            user: user,
            message: post
        })
    }

})
.get('/edit/:id', auth, postEditable, async (req, res) => {
    const userSession = req.session.user
    const user = new User(userSession.uuid, userSession.name, userSession.email, userSession.role, userSession.subscription)

    const post = await postsController.findPost(req.params.id)

    res.render('posts/edit', {
        user: user,
        post: post
    })

})

router.get('/delete/:id', auth, postEditable, async (req, res) => {
    const post = await postsController.findPost(req.params.id)
    await post.delete()
    return res.redirect('/posts')
})

router.get('/report/:id', auth, (req, res) => {

    postsController.reportPost(req, res)
    
})

module.exports = router