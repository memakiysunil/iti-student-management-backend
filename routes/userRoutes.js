const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {jwtAuthmiddlewere} = require('../middleware/authMiddleware');

router.post('/register',userController.register);
router.post('/login', userController.login);
router.get('/getprofile',jwtAuthmiddlewere,userController.getprofile);
router.put('/updatePassword',jwtAuthmiddlewere,userController.updatePassword);

module.exports = router;