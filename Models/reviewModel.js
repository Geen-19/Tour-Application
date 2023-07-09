const mongoose = require('mongoose');
// review // rating // createdAt / ref to tour / ref to user
const Tour = require('./tourModel.js');
const reviewSchema = new mongoose.Schema(
    {
        review:{
            type: String,
            required: [true, 'The review is much required']
        },
        rating: {
            type: Number,
            min:1,
            max:5,
            required: [true, 'The rating for the movie is much required']
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        tour:  
            {
                type : mongoose.Schema.ObjectId,
                ref: 'Tour',
                required: [true, 'review must belong to a tour']
            }
        ,
        user: 
            {
                type : mongoose.Schema.ObjectId,
                ref: 'User',
                required: [true, 'a review must have be written by a user']
            }
        
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);
reviewSchema.index({tour: 1, user: 1}, { unique: true });

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match : {tour: tourId}
        },
        {
            $group : {
                _id: '$tour',
                nRating: {$sum: 1},
                avgRating: {$avg: '$rating'}
            }
        }
        
    ]);
    console.log(stats);
    if(stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        })
    }
}
reviewSchema.post('save', function() {
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
     this.r = await this.findOne();
    console.log(this.r);

})
reviewSchema.post(/^findOneAnd/, async function(next) {
    // await this.findOne(); this does not work here, query is already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);
})
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;



