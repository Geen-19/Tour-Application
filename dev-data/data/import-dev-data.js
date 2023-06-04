const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../Models/tourModel.js');


dotenv.config({path: './config.env '});
console.log(process.env);


const DB = "mongodb+srv://Geen:itXivHV6Q1cFkiN9@atlascluster.7feqb9v.mongodb.net/";
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex : true,
    useFindAndModify: false
}).then(con => console.log('DB connection successful'));

// READ JS FILE

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));
// import data into database

const importData = async () => {
    try{
        await Tour.create(tours);
        console.log('Data Successfully Loaded');
    }catch(err){
        console.log(err);
    }
};
// DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
    try{
        await Tour.deleteMany();
        console.log('Data deleted successfully');
        process.exit();
    }catch(err) {
        console.log(err);
    }
}
if(process.argv[2] === '--import') {
    importData();
}else if(process.argv[2] === '--delete') {
    deleteData();
}