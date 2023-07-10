const express = require('express');
const morgan = require('morgan');
const path = require('path')
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const AppError = require('./utils/AppError.js')
const qlobalErrorHandler = require('./controllers/errorController.js');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet')
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1. MIDDLEWARES

app.use(helmet())
const limiter = rateLimit({
    max:100,
    windowMs: 60*60*1000,
    message: 'Too many requests from this IP, please try again'
});

app.use('/api',limiter);

app.use(express.json({
    limit: '10kb'
}));

// data sanitization against noSQL query injection
app.use(mongoSanitize());
// data sanitization against xss
app.use(xss());
// Serving static files


app.use(morgan('dev'));
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.headers);
    next();
})



// ROUTES       
app.get('/', (req,res) => {
    res.status(200).render('base', {
        tour: 'The Forest Hiker',
        user: 'Geen'
    });
})
app.get('/overview', (req, res) => {
    res.status(200).render('overview', {
        title: 'All Tours'
    });
})
app.get('/tour', (req, res) => {
    res.status(200).render('tour', {
        title: 'The forest Hiker Tour'
    });
})
app.use('/api/v1/tours', tourRouter); 
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `cant find ${req.originalUrl} on this server`
    // });
    // const err = new Error(`cant find ${req.originalUrl} on this server`);
    // err.status = 'fail';
    // err.statusCode = 404;
    // next(err); // anything thats passed into next() function in middle ware is a error which is then passed to all the other middlewares
    next(new AppError(`cant find ${req.originalUrl} on this server`))
});
// by mentioning 4 parameters express knows its a error handling middle ware
// better error handling using a global middleware where any middle ware is directed
// to this if we have an error in it
app.use(qlobalErrorHandler);
    module.exports = app ;
