const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal to 40 characters'],
        minlength: [10, 'A tour must have more or equal ro 10 characters']
    },
    duration: {
        type: Number
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
        values:   ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either : easy, medium, difficult'
    }
    },
    ratingsAverage: {
        runValidators: true,
        type: Number,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Must be below 5'],
        default: 4.5,
    },
    ratingsQuantity: {
        type: Number,
        default:0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        // this keyword only for new doc and not update anol.
        validator : function(val) {
            return val < this.price;
          },
          message: 'Discount price {(VALUE)} should be below regular price'
      },
      
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a Summary']
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    }, 
    images: [String],
    createdAt:{
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date]
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
