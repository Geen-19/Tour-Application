const express = require('express');
const tourController = require('./../controllers/tourController.js');

const router = express.Router();
// router.param('id', tourController.checkId)
//Aliasing tours
//using Middlewares
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/high-ratings').get(tourController.highRatings, tourController.getAllTours);
router.route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour);
    
router.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = router;