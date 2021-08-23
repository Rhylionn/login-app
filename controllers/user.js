const db = require('../core/database')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const fs = require('fs')
const User = require('../models/User')

exports.changeEmail = async (req, res) => {
    const userSession = req.session.user
    const user = new User(userSession.uuid, userSession.name, userSession.email, userSession.role, userSession.subscription)
    
    if(await user.verify()){
        user.changeEmail(req.body.newEmail)
        .then(() => {
            return res.redirect('/profile/logout')
        })
        .catch((error) => {
            return res.render('profile/edit', {
                user: user,
                message: error.message
            })
        })
    } else {
        return res.render('edit', {
            user: user,
            message: 'User error, please try reconnecting before proceeding.'
        })
    }

} 

exports.changePassword = async (req, res) => {

    const userSession = req.session.user
    const user = new User(userSession.uuid, userSession.name, userSession.email, userSession.role, userSession.subscription)

    if(await user.verify().catch()){
        
        if(req.body.password === req.body.passwordConfirm) {
            user.changePassword(req.body.password)
            .then(() => {
                return res.redirect('/profile/logout')
            })
            .catch((err) => {
                return res.render('profile/edit', {
                    user: user,
                    message: err
                })
            })
        } else {
            return res.render('profile/edit', {
                user: user,
                message: 'Passwords does not correspond'
            })
        }

    } else {
        return res.render('profile/edit', {
            message: 'User error, please try reconnecting before proceeding.',
            user: user
        })
    }
    
} 

exports.deleteMyAccount = async (req, res) => {
    const userSession = req.session.user
    const user = new User(userSession.uuid, userSession.name, userSession.email, userSession.role, userSession.subscription)

    const isValid = await user.verifyPassword(req.body.password).catch((valid) => { return false })

    
    if(isValid){
        return user.delete()
        .then(() => {
            return res.redirect('/profile/logout')
        })
        .catch(err => { 
            return res.render('profile/delte', {
                user: user,
                message: err
            })
        })
    } else {
        return res.render('profile/delete', {
            user: user,
            message: 'Password does not correspond'
        })
    }
    

}

exports.changePicture = (req, res) => {
    let user = req.session.user
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif']

    if(!req.files){
        return res.render('profile/picture', {
            message: 'No file uploaded',
            user: user
        })
    } else {
        
        let picture = req.files.profilePicture
        let pictureExtension = picture.name.split('.')[1].toLowerCase()

        if(!allowedExtensions.includes(pictureExtension)){
            return res.render('profile/picture', {
                message: "This extension is not allowed",
                user: user
            })
        } else if(picture.size > 1000000) {
            return res.render('profile/picture', {
                message: 'File is over 1MB',
                user: user
            })

        } else if(pictureExtension === "gif" && user.subscription === 'Free'){
            return res.render('profile/picture', {
                message: 'To use gif images, please consider subscribing.',
                user: user
            })
        } else {
            let uploadPath = `public/profile/pictures/${user.uuid}`

            allowedExtensions.forEach(element => {
                if(fs.existsSync(`${uploadPath}.${element}`)){
                    fs.rmSync(`${uploadPath}.${element}`)
                }
            })
    
            picture.mv(`${uploadPath}.${pictureExtension}`, (err) => {
                if(err) {
                    return res.render('profile/picture', {
                        message: err,
                        user: user
                    })
                } else {
                    return res.redirect('/profile')
                }
            })
        }
    }
}

exports.getPicture = (uuid) => {
    const picturePath = User.getPicture(uuid)
    return picturePath
}

exports.findUser = async (uuid) => {
    const user = await User.find(uuid)
    return user
}