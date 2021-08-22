const db = require('../core/database')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const fs = require('fs')

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

exports.delete = (req, res) => {
    db.query('SELECT * FROM users WHERE id = ? AND email = ?', [req.session.user.id, req.session.user.email], (err, result) => {
        if(result.length != 1){
            res.render('profile/delete', {
                message: 'MASSIVE DANGER: Multiple email addresses'
            })
        } else {
            user = result[0]

            if(user.email == req.session.user.email && user.id == req.session.user.id){
                bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if(!valid){
                        res.render('profile/delete', {
                            message: 'Password does not match'
                        })
                    } else {
                        let token = crypto.randomBytes(32).toString('hex');

                        bcrypt.hash(token, 8).then(hashedPassword => {
                            db.query('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ? AND email = ?', ['DELETED USER', `del-${token}`, hashedPassword, user.id, user.email], (error) => {
                                if(err){
                                    return res.render('profile/delete', {
                                        message: err
                                    })
                                } else {
                                    return res.redirect('logout')
                                }
                            })
                        })
                        
                    }
                })
            } else {
                res.render('profile/delete', {
                    message: 'Attempting to bypass security'
                })
            }


        }
    })
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

exports.getPicture = (req, res) => {
    user = req.session.user

    let picPath;
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif']
    allowedExtensions.forEach(ext => {

        if(fs.existsSync(`public/profile/pictures/${user.uuid}.${ext}`)){
            picPath = `/profile/pictures/${user.uuid}.${ext}`
        }

    })

    return picPath
}