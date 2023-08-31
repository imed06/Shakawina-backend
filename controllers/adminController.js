const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const crypto = require("crypto")
const jwt = require("jsonwebtoken")


const prisma = new PrismaClient();

// create token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET, { expiresIn: '3d' })
}

// mail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'skawina.noreply@gmail.com',
    pass: 'wbngqrimfsstcqxt '
  }
});

// login controller
async function loginAdmin(req, res) {
  try {
    const { username, password } = req.body;

    // Find user by email
    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // create token
    const token = createToken(admin.id);

    res.status(200).json({ admin: admin, token: token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// change password controller
async function changePassword(req, res) {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.plaignant.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // create token
    const token = createToken(user.id);

    res.status(200).json({ plaignant: user, token: token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// answer a complaint controller
async function answerComplaint(req, res) {
  try {
    const id = req.params.id;
    const { answer, adminId } = req.body;

    const createdAnswer = await prisma.answer.create({
      data: {
        content: answer,
        admin: { connect: { id: parseInt(adminId) } },
        complaints: { connect: { id: parseInt(id) } },
      },
    });

    // Update the complaint to link to the answer
    await prisma.complaint.update({
      where: { id: parseInt(id) },
      data: {
        answer: { connect: { id: createdAnswer.id } },
        status: 'Answered', // Assuming you want to update the status
      },
    });

    res.status(200).json({ answer: createdAnswer });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { loginAdmin, changePassword, answerComplaint }