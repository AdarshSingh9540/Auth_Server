const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); 
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendResetEmail = require('../utils/emailConfig');


const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;


        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: "User is already registered"
            });
        }

     
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({
            message: 'User created successfully',
            token,
        });
    } catch (error) {
        console.error(error);  
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;


        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

     
        const userFound = await User.findOne({ email });
        if (!userFound) {
            return res.status(404).json({
                error: "User does not exist"
            });
        }

        const isMatch = await bcrypt.compare(password, userFound.password);
        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }
        const token = jwt.sign({ id: userFound._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Login successful',
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
        await user.save();

        await sendResetEmail(email, token);

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() } // Check if token is still valid
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = {
    signup,
    login,
    requestPasswordReset,
    resetPassword
};
