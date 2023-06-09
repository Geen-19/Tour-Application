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
    
    res.status(200).set(
        'Content-Security-Policy',
        "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
      ).render('tour', {
        title: `${tour.name}`,
        tour
    });
});
exports.login = catchAsync(async (req, res) => {
    res.status(200)
    .set(
        'Content-Security-Policy',
        "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/1.4.0/axios.min.js 'unsafe-inline' 'unsafe-eval';"
    )
    .render('login', {
    title: 'Log into your account'
});
});

// /login 