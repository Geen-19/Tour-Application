const User = require('./../Models/userModel.js');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/AppError.js');
const factory = require('./handlerFactory.js');

exports.getUser = factory.getOne(User)
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User);
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) {
            newObj[el] = obj[el]; 
        }
    })
    return newObj;
}

exports.updateMe = catchAsync( async(req, res, next) => {
    // 1) create error if user POSTs password 
    if(req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates', 400));

    }
    // 2) Filtered out unwanted usernames that are not allowed
    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });
    

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
})
exports.getMe = (req,res,next) => {
    req.params.id = req.user.id;
    next();
}
exports.deleteMe = catchAsync(async (req,res,next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({
        status: 'Success',
        data: null
    })
})

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'Please use sign up'
    })
}
