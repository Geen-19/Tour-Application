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

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});
// virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review', 
    foreignField: 'tour',
    localField: '_id'
})
//tourSchema.index({price: 1});
tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({startLocation: '2dsphere'});
  // DOCUMENT MIDDLEWARE: runs before .save() and .create()

  // tourSchema.pre('save', function(next) {
  //   console.log('Will save document...');
  //   next();
  // });
  
  // tourSchema.post('save', function(doc, next) {
  //   console.log(doc);
  //   next();
  // });
  
  // QUERY MIDDLEWARE
  // tourSchema.pre('find', function(next) {
  tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } });
  
    this.start = Date.now();
    next();
  });
  tourSchema.pre(/^find/, function(next) {
      this.populate({
        path: 'guides',
        select: '-__v'
    });
    next();
  })
//   tourSchema.pre('aggregate', function(next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  
//     console.log(this.pipeline());
//     next();
//   });
  
  tourSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    next();
  });
// referencing

// embedding users in tours 
// tourSchema.pre('save', async function(next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// })
tourSchema.post(/^find/, function(docs, next) {
    //console.log(`Query took ${Date.now() - this.start} milliseconds`)
    console.log(docs);
    next();
})

// Aggregation middle ware
tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: {secretTour: {$ne: true}} })
    console.log(this);
    next()
})
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
