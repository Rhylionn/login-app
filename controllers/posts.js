const db = require('../core/database')
const Post = require('../models/Post')

exports.add = (req, res, next) => {
    user = req.session.user
    const comment = req.body.comment

    if(comment === ''){
        return res.render('posts/add', {
            user: user, 
            message: 'Please do not post empty messages'
        })
    } else {
        db.query('SELECT name, uuid FROM users WHERE uuid = ?', [user.uuid], (err, result) => {
            if(err){
                return res.render('posts/add', {
                    user: user,
                    message: err
                })
            } else if (result.length != 1){
                return res.render('posts/add', {
                    user: user,
                    message: 'Error, 0 or 1+ users with this uuid'
                })
            } else {
                db.query('INSERT INTO posts SET ?', {uuid: user.uuid, post: comment}, (error, postResult) => {
                    if(error){
                        return res.render('posts/add', {
                            user: user,
                            message: error
                        })
                    } else {
                        return res.redirect('/posts')
                    }
                })
            }
        })
    }
}

exports.getAllPosts = async () => {
    const posts = await Post.findAll()

    return posts
}

exports.whoPosted = async(uuid) => {
    const user = await Post.who(uuid)
}