const AppError = require("../utils/AppError.js")

const handleCastErrorDB = err => {
      const message = `Invalid ${err.path}: ${err.value}.`
      return new AppError(message, 400);
}
const handleDuplicateFieldsDB = err => {
    const message = `Duplicate field value: x, please use another value`
    return new AppError(message, 400)
}
const handleJWTError = err => {
    return new AppError('Invalid Token. Please log in again!', 401);
}
const handleJWTExpiredError = err =>  new AppError('your token has expired, please login again', 401);
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        error: err,
        status: err.status,
        message: err.message,
        stack: err.stack
    })
}
const sendErrorProd = (err, res) => {
    if(err.isOperational) {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    })
    // programming or any unknown error
    } else {
        // 1)  Log error
        console.log('ERROR :',err );
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        })
    }
}


module.exports = (err, req, res, next) => {
    //console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    // if(process.env.NODE_ENV === 'development') {
    //    sendErrorDev(err, res);
    // } else if (process.env.NODE_ENV === 'production'){
    //     sendErrorProd(err, res);
    // }else {
        let error = {...err};
        if(error.name === 'CastError')  error = handleCastErrorDB(error);
        if(error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(error.name === 'JsonWebTokenError') error = handleJWTError(error);
        if(error.name === 'TokenExpiredError') error = handleJWTExpiredError(error);
        console.log(err);
         sendErrorDev(error,res);
    
    
    
}