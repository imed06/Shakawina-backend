const { Router } = require('express');
const complaintController = require('../controllers/complaintController');

const complaintRouter = Router();

// get all complaints for admin
complaintRouter.get('/', complaintController.getComplaints);

// create new complaint
complaintRouter.post('/new', complaintController.createComplaint);

// get single complaint
complaintRouter.get('/:id', complaintController.getComplaintById);

// update a complaint
complaintRouter.put('/:id', complaintController.updateComplaint);

// delete a complaint
complaintRouter.delete('/:id', complaintController.deleteComplaint);

module.exports = complaintRouter;