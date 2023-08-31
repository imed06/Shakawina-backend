const express = require('express');
const cors = require("cors")
const authRouter = require('./routes/auth');
const complaintRouter = require('./routes/complaint');
const adminRouter = require('./routes/admin');


const app = express();
const port = 4000; // You can change this to any port you prefer

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();



// Middleware to parse JSON requests
app.use(express.json());
app.use(cors())
app.use("/uploads",express.static("./uploads"))

// Define routes
app.use("/user", authRouter);
app.use("/complaint", complaintRouter);
app.use("/admin", adminRouter);

// Add this code to your backend server file

/* app.get('/api/getImage/:id', async (req, res) => {
  const fileId = parseInt(req.params.id);

  try {
    const fileRecord = await prisma.image.findUnique({
      where: { id: fileId },
    });

    if (!fileRecord) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.send(fileRecord.path);
  } catch (error) {
    console.error('Error fetching image', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}); */



// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
