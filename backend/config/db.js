const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = ()=>{

    mongoose.connection.on('connected',()=>{
        console.log("Database Connected")
    })
    mongoose.connect(`${process.env.MONGODB_URI}Ai-recipe-generator`);
}

module.exports = connectDB;