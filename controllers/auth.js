const db = require('../core/database')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const uuid = require('uuid')

exports.register = (req, res, next) => {

    const { name, email, password, passwordConfirm } = req.body

    db.query('SELECT uuid, email FROM users WHERE email = ?', [email], async (error, results) => {
        if(error){
            console.log(error)
        } {

            regError = false

            if( results.length >= 1){
                regError = true
                return res.render('auth/register', {
                    message: 'That email is already in use'
                })
            } 
                
            if(password !== passwordConfirm){
                regError = true
                return res.render('auth/register', {
                    message: 'Your passwords does not match'
                })
            }

            if(!regError){
                let hashedPassword = await bcrypt.hash(password, 8)

                let myuuid = uuid.v4()
        
                db.query('INSERT INTO users SET ?', {uuid: myuuid, name: name, email: email, password: hashedPassword}, (error, result) => {
                    if(error){
                        console.log(error)
                    } else {
                        return res.render('auth/register', {
                            message: 'User registered'
                        })
                    }
                })
            }
        }
    })
}

exports.login = (req, res) => {
    const { email, password } = req.body

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if(err){
            console.log(err)
        } else if (result.length > 0){
            userDb = result[0]

            bcrypt.compare(password, userDb.password)
            .then(valid => {
                if(!valid){

                    res.status(403).render('auth/login', {
                        message: 'Invalid password'
                    })
                        // Handle errors with URL
                } else {

                    req.session.user = userDb
                    delete req.session.user.password

                    return res.redirect('/profile')

                }
            })
            .catch((err) => {
                console.log(err)
            })
        } else {
            return res.render('auth/login', {
                message: 'User not found'
            })
        }
    })
}