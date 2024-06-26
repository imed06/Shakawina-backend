const { Router } = require('express');
const adminController = require('../controllers/adminController');

const adminRouter = Router();


// login router
adminRouter.post('/login', adminController.loginAdmin);

// update password router
adminRouter.put('/changePassword', adminController.changePassword);

// answer complaint router
adminRouter.post('/answer/:id', adminController.answerComplaint);

// get users router
adminRouter.get("/users", adminController.getUsers)

module.exports = adminRouter;