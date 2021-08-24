const db = require("../core/database")

exports.untreatedReports = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT id FROM reports WHERE treated = false', [], (err, result) => {
            return err ? reject(err) : resolve(result.length)
        })
    })
}


// TODO :
// Get all posts with who reported && previews
// Users part