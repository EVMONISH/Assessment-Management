const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register user
exports.register = async (req, res) => {
    try {
        console.log('Register request:', req.body);
        
        const { name, email, password, userType, registrationNumber } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ 
                success: false,
                message: 'User already exists' 
            });
        }

        // Create new user
        user = new User({
            name,
            email,
            password,
            userType,
            registrationNumber: userType === 'student' ? registrationNumber : null
        });

        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                userType: user.userType,
                name: user.name 
            },
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                registrationNumber: user.registrationNumber
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Server error' 
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        console.log('Login request:', req.body);
        
        const { email, password, userType } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Check user type
        if (user.userType !== userType) {
            return res.status(400).json({ 
                success: false,
                message: `Please login as ${user.userType}` 
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                userType: user.userType,
                name: user.name 
            },
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                registrationNumber: user.registrationNumber
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Server error' 
        });
    }
};