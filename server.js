const fs = require('fs');
const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');

dotenv.config({path: './config.env '});
console.log(process.env);


const DB = "mongodb+srv://Geen:itXivHV6Q1cFkiN9@atlascluster.7feqb9v.mongodb.net/";
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex : true,
    useFindAndModify: false,
}).then(con => console.log('DB connection successful'));


// create, read, update and delete



const port = 3000;
app.listen(port , () => {
    console.log(`App running on port ${port}...`);
});


