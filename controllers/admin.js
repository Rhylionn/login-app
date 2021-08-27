const db = require("../core/database")
const userController = require('../controllers/user')
const postController = require('../controllers/posts')

exports.untreatedReports = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT id FROM reports WHERE treated = false', [], (err, result) => {
            return err ? reject(err) : resolve(result.length)
        })
    })
}

exports.getReports = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM reports', [], (err, result) => {
            return err ? reject(err) : resolve(result) 
        })
    })
}

exports.reportData = async () => {
    const reports = await this.getReports()
        
    reports.forEach(async report => {
        const post = await postController.findPost(report.postId)
        const poster = await postController.whoPosted(post)
    
        report.user = await userController.findUser(report.userUUID)
        report.post = post
        report.poster = poster
    });
    
    return reports
}

// TODO :
// Get all posts with who reported && previews
// Users part