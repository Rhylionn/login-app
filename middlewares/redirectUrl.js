module.exports = (req, res, next) => {
    const session = req.session
    if(session.userId){
        return res.redirect('/profile')
    }

    next()
}