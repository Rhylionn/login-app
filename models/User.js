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

    static find(uuid){

        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE uuid = ?', [uuid], (err, result) => {
                const user = result[0]
                return err ? reject(err) : resolve(new User(uuid, user.name, user.email, user.role, user.subscription)) 
                // /!\ What does the promise return if we can't find the user
            })
        })

    }

    verifyPassword(password){

        return new Promise((resolve, reject) => {
            db.query('SELECT password FROM users WHERE uuid = ?', [this.uuid], (err, result) => {
                if(err) {
                    reject(err)
                } else {
                    bcrypt.compare(password, result[0])
                    .then(valid => {
                        return !valid ? reject(valid) : resolve(valid)
                    }).catch(err => {
                        // Error in bcrypt comparaison
                        // Object passed
                        reject(err)
                    }) 
                }
                
                return err ? reject(err) : resolve(result[0])
            })
        })

    }


    delete() {
        
        return new Promise((resolve, reject) => {

            let token = crypto.randomBytes(32).toString('hex');

            bcrypt.hash(token, 8).then(hashedPassword => {
                db.query('UPDATE users SET name = ?, email = ?, password = ? WHERE uuid = ?', ['DELETED USER', `del-${token}`, hashedPassword, this.uuid], (error, result) => {
                    return err ? reject(err) : resolve(result)
                })
            })

        })

    }


    static getPicture(uuid){
        let picPath;
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif']
        allowedExtensions.forEach(ext => {
    
            if(fs.existsSync(`public/profile/pictures/${uuid}.${ext}`)){
                picPath = `/profile/pictures/${uuid}.${ext}`
            }
    
        })
    
        return picPath
    }


}