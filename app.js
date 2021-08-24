const express = require('express')
const session = require('express-session')
const fileUpload = require('express-fileupload')
const db = require('./core/database')
const dotenv = require('dotenv')
const path = require('path')
const auth = require('./middlewares/auth')
const cookieParser = require('cookie-parser')
const redirectUrl = require('./middlewares/redirectUrl')
const exphbs = require('express-handlebars')
const isAdmin = require('./middlewares/isAdmin')

const app = express()
const publicDirectory = path.join(__dirname, './public')

app.use(express.static(publicDirectory))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use(fileUpload())

app.engine('hbs', exphbs({
    defaultLayout: 'default',
    extname: '.hbs',
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
}))

app.set('view engine', 'hbs')


const twoHours = 1000 * 60 * 60 * 2
app.use(session({
    name: 'sid',
    secret: process.env.SESSION_SECRET,
    saveUninitialized:true,
    cookie: { maxAge: twoHours },
    resave: false 
}))

// Define routes

app.use('/', require('./routes/pages'))
app.use('/auth', redirectUrl, require('./routes/auth'))
app.use('/profile', auth, require('./routes/profile'))
app.use('/posts', require('./routes/posts'))
app.use('/admin', auth, isAdmin, require('./routes/admin'))

app.listen(5001, console.log("Server started on http://localhost:5001"))