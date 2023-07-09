const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/AppError.js');
const APIFeatures = require('./../utils/APIfeatures.js')
exports.deleteOne = Model => catchAsync(async (req, res,next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if(!doc) {
        return next(new AppError('No document found by that ID', 404));
    }
     res.status(204).json({
        status : "success",
        data: null
    });
})

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body , {
        new:true,
        runValidators: true
    });
    if(!doc) {
        return next(new AppError('No document found by that ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})


exports.createOne = Model => catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    //tours.push(newTour);
        res.status(201).json({
            status: "success",
            data: {
                data: newDoc
            }
        });
    // console.log(req.body);

    //cons newId = tours[tours.length-1].id + 1;

}
)

exports.getOne = (Model, popOptions) => catchAsync( async (req,res,next) => {
    // the populate populate the tours with the data

    let query = Model.findById(req.params.id);
    if(popOptions) query = query.populate(popOptions);
    const doc = await query;
    if(!doc) {
        return next(new AppError('No Document Found With that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc, // here tours is the endpoint and : tours is the data
        }
    });


});
exports.getAll = Model => catchAsync(async (req, res) => {
    let filter = {};
    if(req.params.tourId) filter = {tour: req.params.tourId};
    // 1) Filtering
//     const queryObj = {...req.query};
//     const excludedFields = ['page', 'sort', 'fields','limit'];

//     excludedFields.forEach(el => delete queryObj[el]);
//     console.log(req.query, queryObj);
//     // Advanced Filetering
//     let queryStr = JSON.stringify(queryObj);
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}` );
//     console.log(JSON.parse(queryStr))
// let query =  Tour.find(JSON.parse(queryStr)); 



// 3) Sorting
// if(req.query.sort) {
//     const sortBy = req.query.sort.split(',').join(' ');
//     console.log(sortBy);
//     query = query.sort(sortBy);
// }else {
//     query = query.sort("-createdAt duration")
// }
    // {difficulty: 'easy}
    

// 3) Fields
// if(req.query.fields) {
//     const fields = req.query.fields.split(',').join(' ');
//     query = query.select(fields);
// } else {
//     query : query.select('-__v')
// }
// console.log(req.query);

// 4) Pagination

// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 100;
// const skip = (page - 1) * limit;
// query = query.skip(skip).limit(limit);

// if (req.query.page) {
//     const numTours = await Tour.countDocuments();
//     if(skip >= numTours) throw new Error('This page does not exist')
// }

//or
// const tours = await Tour.find()
//     .where('duration')
//     .equals(req.query.duration)
//     .where('difficulty')
//     .equals(req.query.difficulty)
const features = new  APIFeatures(Model.find(filter), req.query)
.filter()
.sort()
.limiting()
.pagination();

const doc = await features.query;

res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
        data: doc // here tours is the endpoint and : tours is the data
    }
});
});
