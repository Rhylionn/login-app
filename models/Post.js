const db = require('../core/database')
const User = require('../models/User')

module.exports = class Post{

    constructor(id, posterUuid, comment){
        this.id = id
        this.posterUuid = posterUuid
        this.comment = comment
    }


    isEditable(user) {
        if(user.uuid !== this.posterUuid){
            return user.role === 'ADMIN' ? true : false
        } else {
            return true
        }
    }

    edit(newComment) {
        return new Promise((resolve, reject) => {
            db.query('UPDATE posts SET post = ? WHERE id = ?', [newComment, this.id], (err, result) => {
                return err ? reject(err) : resolve(result)
            })
        })
    }

    delete(){
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM posts WHERE id = ?', [this.id], (err, result) => {
                return err ? reject(err) : resolve(result)
            })
        })
    }

    static findById(id){
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM posts WHERE id = ?', [id], (err, result) => {
                if(err) {
                    return reject(err)
                } else if(result.length !== 1) {
                    return reject('No posts found')
                } else {
                    return resolve(new Post(result[0].id, result[0].uuid, result[0].post))
                }
            })
        })
    }

    static findAll(){
        
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM posts ORDER BY id DESC', [], (err, result) => {
                return err ? reject(err) : resolve(result)
            })
        })

    }

    static async who(post){
        return new Promise((resolve, reject) => {
            db.query('SELECT uuid, name, email, role, subscription FROM users WHERE uuid = ?', [post.posterUuid], (err, result) => {
                return err ? reject(err) : resolve(new User(result[0].uuid, result[0].name, result[0].email, result[0].role, result[0].subscripiton))
            })
        })
    }

    report(user){
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO reports SET ?', {userUUID: user.uuid, postId: this.id}, (err, result) => {
                return err ? reject(err) : resolve(result)
            })
        })
    }
    

}