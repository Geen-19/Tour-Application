const Tour = require('../Models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync( async(req,res) => {
    // 1) get tour data from collection
    const tours = await Tour.find();
    // 2) Build Template

    // 3) Render it!!!
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});
exports.getTour = catchAsync(async (req,res) => {
    // get data for the requested tour (reviews and guides)
    const tour = await Tour.findById(req.params.id).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    // Build template 

    // Render template using data
    
    res.status(200).render('tour', {
        title: `${tour.name}`,
        tour
    });
});