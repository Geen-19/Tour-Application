const { promisify } = require('util');
const User  = require('./../Models/userModel.js');
const catchAsync = require('./../utils/catchAsync.js');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError.js');
const sendEmail = require('./../utils/Email.js');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({id}, 'this-is-my-name-geen-donald-joel-long-JWT_SECRET', {
        expiresIn: '90d'
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
      expires: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: true
    };
  
    res.cookie('jwt', token, cookieOptions);
  
    // Remove password from output
    user.password = undefined;
  
    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  };
exports.signup = catchAsync(async (req, res , next) => {    
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    });
    createSendToken(newUser, 201, res)
    
});

exports.login = catchAsync( async (req, res, next) => {
    const {email, password} = req.body;
    // 1) check if email and password exists
        if(!email || !password) {
            return next(new AppError('Please provide email and password' , 400))
        }
    // 2) check if user exists && password is correct
        const user = await User.findOne({ email }).select('+password');
        console.log(user);
    //3) if everything is ok send token to client
    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }
    createSendToken(user, 200, res)
})

exports.protect = catchAsync(async(req,res,next) => {
    let token
    // 1) Get token and check if its there
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
         token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if(!token) {
        return next(new AppError('You are not logged in! Please log in to get access', 401));
    }
    //2) verification of the token
    const decoded =  await promisify(jwt.verify)(token, 'this-is-my-name-geen-donald-joel-long-JWT_SECRET');
    console.log(decoded);
    // 3) Check if user still exists
    const freshUser = await User.findById(decoded.id);
    if(!freshUser) {
        return next(new AppError('The user belonging to the token no longer exists', 401));

    }
    // 4) Check if user changed password after the jwt was issued
    if(freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! please login again!', 401))
    }
 
    //GRANT ACCESS TO PROTECTED ROUTE
    req.user = freshUser;
    next();
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles is an ['admin', 'lead-guide']. role is just now use
        
        console.log(req.user.role);
        if(!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 401));

        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req,res,next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if(!user) {
        return next(new AppError('There is no user with email address.', 400))
    }
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false});
    // 3) send it to user's email
    const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password submit your patch request with your new password and passwordConfirm to: ${resetURL}.\n`

    try{
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token {valid for 10mins}',
            message
        });
    
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false});

        return next(new AppError('There was an error sending the mail, Try again later!'));
    }
    

});
exports.resetPassword =  catchAsync(async (req,res,next) => {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}})

    // 2) if token not expired, and there is user, set the password
    if(!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // 3) update
    createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync ( async(req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');
    // 2) check if posted password is correct 
    
    // 3) if password is correct update it
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password)) ){
        return next(new AppError('Your current password is wrong', 401));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // 4) log in and send jwt
    createSendToken(user, 200, res)
});
// Only for rendered pages
exports.isLoggedIn = catchAsync(async(req,res,next) => {
    // 1) Get token and check if its there
    if (req.cookies.jwt) {
    
   
    const decoded =  await promisify(jwt.verify)(
        req.cookies.jwt,
         'this-is-my-name-geen-donald-joel-long-JWT_SECRET');
    // 3) Check if user still exists
    const freshUser = await User.findById(decoded.id);
    if(!freshUser) {
        return next();

    }
    // 4) Check if user changed password after the jwt was issued
    if(freshUser.changedPasswordAfter(decoded.iat)) {
        return next()
    }
   
    //THERE IS A LOGGED IN USER
    res.locals.user = freshUser
    next();
}else{
    next()
}

})