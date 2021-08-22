const db = require('../core/database')

module.exports = class Post{

    constructor(comment){
        this.comment = comment
    }

    static findAll(){
        
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM posts', [], (err, result) => {
                return err ? reject(err) : resolve(result)
            })
        })

    }

    static who(uuid){
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE uuid = ?', [uuid], (err, result) => {
                return err ? reject(err) : resolve(result)
            })
        })
    }

}