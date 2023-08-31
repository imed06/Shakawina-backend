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

// sign up controller
async function registerUser(req, res) {
  try {
    const { nom, prenom, email, password, wilaya, commune, natureDoc, numDoc, dateDeliv, placeDeliv, tel } = req.body;

    // Check if the user with the given email already exists
    const existingUser = await prisma.plaignant.findUnique({
      where: { email },
    });

    if (existingUser) {
      const updatedUser = await prisma.plaignant.update({
        data: {
          nom,
          prenom,
          wilaya,
          commune,
          natureDoc,
          numDoc: numDoc,
          dateDeliv,
          placeDeliv,
          tel,
        },
        where: {
          email
        }
      });

      // create token
      const token = createToken(updatedUser.id);

      return res.status(200).json({ plaignant: updatedUser, token: token });
    }

    // Generate a new random password
    const newRawPassword = generatePassword(); // Implement your own random password generation function
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newRawPassword, salt);

    // Create the user in the database
    const newUser = await prisma.plaignant.create({
      data: {
        nom,
        prenom,
        email,
        password: hashedPassword,
        wilaya,
        commune,
        natureDoc,
        numDoc: numDoc,
        dateDeliv,
        placeDeliv,
        tel,
      },
    });

    // create token
    const token = createToken(newUser.id);

    const mailOptions = {
      from: 'skawina.noreply@gmail.com',
      to: email,
      subject: 'Bienvenu',
      html: `
      <p>Bonjour,</p>
      <p>Nous sommes ravis de vous accueillir sur notre plateforme ! Voici vos informations de connexion :</p>
      <p><strong>Mot de passe :</strong> ${newRawPassword}</p>
      <p>Nous vous conseillons de garder ces informations en sécurité et de ne pas les partager.</p>
      <p>Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter.</p>
      <p>Cordialement,</p>
      <p>Shakawina</p>
    `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    return res.status(200).json({ plaignant: newUser, token: token });
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

// update user
async function updateUser(req, res) {
  try {
    const { nom, prenom, email, ancienPW, wilaya, commune, natureDoc, numDoc, dateDeliv, placeDeliv, tel, nouveauPW } = req.body;

    // Find user by email
    const user = await prisma.plaignant.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(ancienPW, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }


    // Hash the password
    var hashedPassword;
    if (nouveauPW != "") {
      hashedPassword = await bcrypt.hash(nouveauPW, 10);
    } else {
      hashedPassword = await bcrypt.hash(ancienPW, 10);
    }

    const updatedUser = await prisma.plaignant.update({
      data: {
        nom,
        prenom,
        wilaya,
        commune,
        natureDoc,
        numDoc: numDoc,
        dateDeliv,
        placeDeliv,
        tel,
        password: hashedPassword
      },
      where: {
        email
      }
    });


    // create token
    const token = createToken(updatedUser.id);

    res.status(200).json({ plaignant: updatedUser, token: token });
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
    const { email } = req.body
    const user = await prisma.plaignant.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate a new random password
    const newRawPassword = generatePassword(); // Implement your own random password generation function
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newRawPassword, salt);

    // Update the user's password in the database
    await prisma.plaignant.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    // Send email with the new password
    const mailOptions = {
      from: 'skawina.noreply@gmail.com',
      to: email,
      subject: 'Mot de passe oublié',
      html: `
      <p>Bonjour,</p>
      <p>Nous avons réinitialisé votre mot de passe. Voici votre nouveau mot de passe:</p>
      <p><strong>${newRawPassword}</strong></p>
      <p>Si vous n'avez pas effectué cette demande, veuillez nous contacter immédiatement.</p>
      <p>Cordialement,</p>
      <p>Shakawina</p>
    `,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    return res.status(200).json({});
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

module.exports = { registerUser, loginUser, logoutUser, resetPasswordByEmail, updateUser };

