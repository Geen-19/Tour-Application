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
exports.getTour = (req,res) => {
    res.status(200).render('tour', {
        title: 'The Forest Hunter'
    });
};