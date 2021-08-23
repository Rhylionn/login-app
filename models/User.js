const db = require('../core/database')
const fs = require('fs')
const crypto = require('crypto')
const bcrypt = require('bcryptjs/dist/bcrypt')

module.exports = class User{

    constructor(uuid, name, email, role, subscription){

        this.uuid = uuid
        this.name = name
        this.email = email
        this.role = role
        this.subscription = subscription

    }

    // Find and instanciate a user
    static find(uuid){

        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE uuid = ?', [uuid], (err, result) => {
                const user = result[0]
                return err ? reject(err) : resolve(new User(uuid, user.name, user.email, user.role, user.subscription)) 
                // /!\ What does the promise return if we can't find the user
            })
        })

    }

    // Verify if a user exists with all possible parameters
    verify() {
        return new Promise((resolve, reject) => {
            db.query('SELECT uuid FROM users WHERE uuid = ? AND name = ? AND email = ? AND role = ? AND subscription = ?', [this.uuid, this.name, this.email, this.role, this.subscription], (error, result) => {
                if(error) {
                    return reject(error)
                } else if(result.length !== 1){
                    return reject(false)
                } else {
                    return resolve(true)
                }
            })
        })
    }

    // Verify if a given password match with the bcrypt hash in the database
    verifyPassword(password){

        return new Promise((resolve, reject) => {
            db.query('SELECT password FROM users WHERE uuid = ?', [this.uuid], (err, result) => {
                if(err) {
                    reject(err)
                } else {
                    bcrypt.compare(password, result[0].password)
                    .then(valid => {
                        return valid ? resolve(valid) : reject(valid)
                    }).catch(error => {
                        reject(error)
                    }) 
                }
            })
        })

    }

    // Change the password of a user
    changePassword(newPassword) {
        return new Promise((resolve, reject) => {

            bcrypt.hash(newPassword, 8).then(hashedPassword => {
                db.query('UPDATE users SET password = ? WHERE uuid = ?', [hashedPassword, this.uuid], (err, result) => {
                    return err ? reject(err) : resolve(result)
                })
            })

        })
    }

    // Delete a user by replacing all personnal datas with dummy datas
    delete() {
        
        return new Promise((resolve, reject) => {

            let token = crypto.randomBytes(32).toString('hex');

            bcrypt.hash(token, 8).then(hashedPassword => {
                db.query('UPDATE users SET name = ?, email = ?, password = ? WHERE uuid = ?', ['DELETED USER', `del-${token}`, hashedPassword, this.uuid], (error, result) => {
                    return error ? reject(error) : resolve(result)
                })
            })

        })  

        // Remove profile picture for the deleted user

    }

    // Static functin to verify if an email address exist with a given string
    static emailExist(email) {
        return new Promise((resolve, reject) => {
            db.query('SELECT email FROM users WHERE LOWER(email) = ?', [email.toLowerCase()], (error, result) => {
                if(error) {
                    return reject(error)
                } else if (result.length !== 0) {
                    return reject(true)
                } else {
                    return resolve(false)
                }
            })
        })
    }

    // Change the email addr for a user
    changeEmail(newEmail) {

        return new Promise(async (resolve, reject) => {
            
            if(await User.emailExist(newEmail).catch(err => { return err })){  // Problem if error is rejected ?
                reject({ message: 'Email adress already in use.'})
            } else {
                db.query('UPDATE users SET email = ? WHERE uuid = ?', [newEmail, this.uuid], (error, result) => {
                    return error ? reject(error) : resolve(result)
                })
            }
            
        })

    }

    // Get the complete path of a user's picture
    static getPicture(uuid){
        let picPath;
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif']
        allowedExtensions.forEach(ext => {
    
            if(fs.existsSync(`public/profile/pictures/${uuid}.${ext}`)){
                picPath = `/profile/pictures/${uuid}.${ext}`
            }

        })
    
        return picPath !== undefined ? picPath : '/profile/pictures/default_picture.jpg'
    
    }


}