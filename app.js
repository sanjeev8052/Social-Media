const express  = require('express');
const connectDatabase = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors')


const app = express();
connectDatabase();


// importing Routes
const  userRoute = require('./routes/user');
const postRoute = require('./routes/post')

// using middlewares

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(cors())

// using Routes
app.use("/api/v1/",userRoute);
app.use("/api/v1/",postRoute);


module.exports = app 