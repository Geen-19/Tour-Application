const express = require('express');
const tourController = require('./../controllers/tourController.js');
const authController = require('./../controllers/authController.js');
const reviewRouter = require('./../routes/reviewRouter.js');

const router = express.Router();
// router.param('id', tourController.checkId)
//Aliasing tours
//using Middlewares

router.use('/:tourId/reviews', reviewRouter);

router.route('/tour-stats').get(tourController.getTourStats)
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/high-ratings').get(tourController.highRatings, tourController.getAllTours);
router
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour,
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'));
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);   
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour,
        authController.protect , 
        authController.restrictTo('admin', 'lead-guide'))
    .delete(authController.protect , 
        authController.restrictTo('admin', 'lead-guide'), 
        tourController.deleteTour);

//         
// router.route('/:tourId/reviews').
//     post(authController.protect, 
//         authController.restrictTo('user'),
//         reviewController.createReview);
        // NESTED ROUTING
        // POST /tour/23232/reviews
        // GET /tour/232323/reviews
        // GET /tour/242342/reviews/34234
module.exports = router;