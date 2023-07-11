const express = require('express');
const viewsController = require('../controllers/viewsController');
const router = express.Router();



router.get('/', viewsController.getOverview)
router.get('/tours/:id', viewsController.getTour)
router.get('/login', viewsController.login)
 
// /login
module.exports = router;