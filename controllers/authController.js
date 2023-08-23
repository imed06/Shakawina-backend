const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const crypto = require("crypto")

const prisma = new PrismaClient();

// mail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-password'
  }
});

// sign up controller
async function registerUser(req, res) {
  try {
    const { nom, prenom, email, password, adresse, dateOfBirth, placeOfBirth } = req.body;

    // Check if the user with the given email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const dob = new Date(req.body.dateOfBirth); // Assuming req.body.dateOfBirth is in ISO 8601 format
    const formattedDOB = dob.toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD'

    // Create the user in the database
    const newUser = await prisma.user.create({
      data: {
        nom,
        prenom,
        email,
        password: hashedPassword,
        adresse,
        dateOfBirth,
        placeOfBirth,
      },
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// login controller
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// logout controller
async function logoutUser(req, res) {
  // In a real-world scenario, you might want to handle any necessary cleanup or session management here
  res.json({ message: 'Logout successful' });
}

// forgot password controller
async function resetPasswordByEmail(req, res) {
  try {
    const {email} = req.body
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate a new random password
    const newRawPassword = generatePassword(); // Implement your own random password generation function
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newRawPassword, salt);

    // Update the user's password in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    // Send email with the new password
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: user.email,
      subject: 'Password Reset',
      text: `Your new password: ${newRawPassword}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    return false;
  }
}

// generate password
const generatePassword = (
  length = 10,
  wishlist = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$'
) =>
  Array.from(crypto.randomFillSync(new Uint32Array(length)))
    .map((x) => wishlist[x % wishlist.length])
    .join('')

module.exports = { registerUser, loginUser, logoutUser, resetPasswordByEmail };

