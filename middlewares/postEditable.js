const Post = require('../models/Post')
const User = require('../models/User')
const postsController = require('../controllers/posts')

module.exports = async (req, res, next) => {

    const userSession = req.session.user
    const user = new User(userSession.uuid, userSession.name, userSession.email, userSession.role, userSession.subscription)
    
    const post = await postsController.findPost(req.params.id)

    if(post instanceof Post){
        if(!post.isEditable(user)) {
            return res.redirect('/posts')
        } else {
            next()
        }
    } else {
        console.warn(post)
        return res.redirect('/posts')
    }

    


}
