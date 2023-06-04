const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const app = express();
// 1. MIDDLEWARES


app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
    console.log('Hello From Middleware ');
    next();
});
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})



// ROUTES       

app.use('/api/v1/tours', tourRouter); 
app.use('/api/v1/users', userRouter);

    module.exports = app ;
