const express = require('express');
const authRouter = require('./routes/auth');
const complaintRouter = require('./routes/complaint');
const app = express();
const port = 8000; // You can change this to any port you prefer

// Middleware to parse JSON requests
app.use(express.json());

// Define routes
app.use("/user",authRouter);
app.use("/complaint",complaintRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
