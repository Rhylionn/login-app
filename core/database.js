const mysql = require('mysql2')
const dotenv = require('dotenv')

dotenv.config({ path: './.env' })

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})


db.connect((err, connection) => {
    if(err){
        console.log(err)
        console.log("/!\\ WARNING : Can't reach the mysql database!")
    }

})

module.exports = db