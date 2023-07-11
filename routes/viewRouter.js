const express = require('express');
const viewsController = require('../controllers/viewsController');
const router = express.Router();
const CSP = 'Content-Security-Policy'; 
const POLICY =   "default-src 'self' https://*.mapbox.com;" +   "connect-src 'self' http://127.0.0.1:3000/api/v1/users/login;" +   "base-uri 'self';block-all-mixed-content ;" +   "font-src 'self' https: data:;" +   "frame-ancestors 'self';" +   "img-src http://localhost:3000 'self' blob: data:;" +   "object-src 'none';" +   "script-src https: cdn.jsdelivr.net cdnjs.cloudflare.com api.mapbox.com 'self' blob: ;" +   "script-src-attr 'none';" +   "style-src 'self' https: 'unsafe-inline';" +   'upgrade-insecure-requests'; 


router.use((req, res, next) => {  
     res.setHeader(CSP, POLICY);   
     next(); 
});


router.get('/', viewsController.getOverview)
router.get('/tours/:id', viewsController.getTour)
router.get('/login', viewsController.login)
 
// /login
module.exports = router;