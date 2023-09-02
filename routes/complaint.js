const { Router } = require('express');
const complaintController = require('../controllers/complaintController');
const multer = require('multer');
const path = require("path")

// img storage confing
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const complaintRouter = Router();

// get all complaints for admin
complaintRouter.get('/', complaintController.getComplaints);

// create new complaint
complaintRouter.post('/new',upload.single("file"), complaintController.createComplaint);

// count complaints
complaintRouter.get('/count', complaintController.countComplaints);

// get filterd complaints
complaintRouter.get('/filter/:type', complaintController.getComplaintsFilter);

// get single complaint
complaintRouter.get('/:id', complaintController.getComplaintById);

// get user complaints
complaintRouter.get('/user/:id', complaintController.getUserComplaints);


// update a complaint
complaintRouter.put('/:id', complaintController.updateComplaint);

// delete a complaint
complaintRouter.delete('/:id', complaintController.deleteComplaint);

module.exports = complaintRouter;