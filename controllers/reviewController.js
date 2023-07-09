const Review = require('./../Models/reviewModel.js');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/AppError.js');
const factory = require('./handlerFactory.js')

exports.setTourUserIds = (req,res,next) => {
    // allow nested routes
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
}
exports.getAllReview = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);