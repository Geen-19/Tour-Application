const fs = require('fs');
const Tour = require('./../Models/tourModel.js');

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
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = {...this.queryString};
        const excludedFields = ['page', 'sort', 'fields','limit'];

        excludedFields.forEach(el => delete queryObj[el]);
        // Advanced Filetering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}` );
        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }
    sort() {
        if(this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            console.log(sortBy);
            this.query = this.query.sort(sortBy);
        }else {
            this.query = this.query.sort("-createdAt duration")
        }

        return this;
    }
    limiting() {
        if(this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    pagination() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        
        return this;
    }
}
exports.getAllTours = async (req, res) => {
    try{
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
    const features = new  APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limiting()
    .pagination();

    const tours = await features.query;

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours: tours // here tours is the endpoint and : tours is the data
        }
    });
}catch(err) {
    console.log(err);
    res.status(404).json({
        status: 'fail',
        message: err
    })
}
}
exports.getTour =  async (req,res) => {
    
    try{
        const tours = await Tour.findById(req.params.id) 
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours, // here tours is the endpoint and : tours is the data
            }
        });
    }catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
    
};
exports.createTour = async (req, res) => {
    // console.log(req.body);

    //cons newId = tours[tours.length-1].id + 1;
    try{
   const newTour = await Tour.create(req.body);
    //tours.push(newTour);
        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        });
    }catch (err){
        res.status(400).json({
            status: "fail",
            message: err
        })
    }
}

exports.updateTour  = async (req, res) => {
    try{

    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,

    })
    return res.status(200).json({
        status : "success",
        data: {
          tour:  tour
        }
    })
}catch (err){
    res.status(400).json({
        status: "fail",
        message: 'Invalid data sent'
    })
}
}
exports.deleteTour =  async (req, res) => {
    try{
    const deletedCount = await Tour.deleteOne({_id:req.params.id});
     res.status(204).json({
        status : "success",
        dataDeletedCount:  deletedCount
    });
}catch(err){
    res.status(204).json({
        status : "fail",
        message: err
    });
}
}

exports.getTourStats = async (req,res) => {
    try{
        const stats = await Tour.aggregate([
            {
                $match: {ratingsAverage: {$gte: 4.5}}
            },
            {
                $group: {
                    _id: null,
                    numRatings: {$sum: '$ratingsQuantity'},
                    numTours: {$sum: 1},
                    avgRating: {$avg: '$ratingsAverage'},
                    avgPrice: {$avg: '$price'},
                    minPrice: {$min: '$price'},
                    maxPrice: {$max: '$price'}
                }
            }
        ])
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        })
    }catch(err){
    res.status(204).json({
        status : "fail",
        message: err
    });
}
}
