const fs = require('fs');
const Tour = require('./../Models/tourModel.js');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/AppError.js');
const factory = require('./handlerFactory.js');
exports.highRatings = (req, res, next) => {
    console.log('High Ratings');
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}
exports.aliasTopTours = (req, res, next) => {
    console.log('Top 5 tours')
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1; // 2021
  
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      {
        $limit: 12
      }
    ]);
  
    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  });
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, {path: 'reviews'})
exports.createTour = factory.createOne(Tour)
exports.updateTour  = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour =  catchAsync(async (req, res,next) => {
//     const deletedCount = await Tour.deleteOne({_id:req.params.id});
//      res.status(204).json({
//         status : "success",
//         dataDeletedCount:  deletedCount
//     });

// })

exports.getTourStats = catchAsync(async (req,res) => {
        const stats = Tour.aggregate({
            
        })
    
});
///tours-within/:distance/center/:latlng/unit/:unit
exports.getToursWithin = catchAsync(async(req, res,next) => {
    const {distance, latlng, unit} = req.params;
    const [lat,lng] = latlng.split(",");

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        return next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
        
    }
    console.log(distance, lat,lng,unit);
    const tours = await Tour.find({ startLocation: { $geoWithin: {$centerSphere: [[lng,lat], radius]} } });
    res.status(200).json({
        status: 'success',
        result : tours.length,

        data: {
            data: tours
        }
    });
})
exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
  
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }
  
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);
  
    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  });
  