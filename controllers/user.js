const db = require('../core/database')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const fs = require('fs')
const User = require('../models/User')

exports.changeEmail = (req, res) => {
    
    if(req.body.oldEmail != req.session.user.email){
        console.log("MASSIVE DANGER: Email do not correspond to session")
    } else {
        db.query('SELECT id, email FROM users WHERE email = ? AND id = ?', [req.session.user.email, req.session.user.id], (err, result) => {
            if(err){
                res.render('profile/edit', {
                    message: err
                })
            } else if(result.length != 1){
                res.render('profile/edit', {
                    message: 'MASSIVE DANGER: More than one email detected.',
                    user: req.session.user
                })
            } else {

                db.query('SELECT id FROM users WHERE LOWER(email) = ?', [req.body.newEmail.toLowerCase()], (errorr, result) => {
                    if(result.length != 0) {
                        res.render('profile/edit', {
                            message: 'Email already in use',
                            user: req.session.user
                        })
                    } else {
                        db.query('UPDATE users SET email = ? WHERE email = ? AND id = ?', [req.body.newEmail, req.session.user.email, req.session.user.id], (error, result) => {
                            if(error){
                                res.render('profile/edit', {
                                    message: err,
                                    user: req.session.user
                                })
                            } else {
                                res.redirect('logout')
                            }
                        })
                    }
                })
            }
        })
    }

    db.query('SELECT id, email FROM users WHERE email = ? AND id = ?', [req.body.oldEmail, req.session.user.email])

} 

exports.changePassword = (req, res) => {
    if (req.body.password == req.body.passwordConfirm){
        
        bcrypt.hash(req.body.password, 8).then(hashedPassword => {
            db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.session.user.id], (err, result) => {
                if(err) { 
                    res.render('profile/edit', {
                        message: err
                    })
                } else {
                    return res.redirect('/profile/logout')
                }
            })
        })

    } else {
        return res.render('profile/edit', {
            message: "Password does not match"
        })
    }
} 

exports.deleteMyAccount = async (req, res) => {
    const userSession = req.session.user
    const user = new User(userSession.uuid, userSession.name, userSession.email, userSession.role, userSession.subscription)

    console.log(await user.verifyPassword(req.body.password))

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
    console.log(user)
    return user
}