const User = require('../models/User')

module.exports = async (req, res, next) => {

    const userSession = req.session.user
    const user = new User(userSession.uuid, userSession.name, userSession.email, userSession.role, userSession.subscription)

    if(await user.verify().catch(err => { return false })){
        if(user.role === 'ADMIN'){
            next()
        } else {
            return res.redirect('/profile')
        }
    } else {
        return res.redirect('/profile/logout')
    }
    
}