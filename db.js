const mongoose = require('mongoose')
require('dotenv').config()

const dbURI = process.env.MONGO_URI;
//MONGO_URI is hidden in the .env file which is gitignored
//Also must be added to Heroku config vars

mongoose.connect(dbURI)
.then(res =>{
    console.log("DB connected");
})
.catch(err =>{
    console.error("DB not connected", err);
})