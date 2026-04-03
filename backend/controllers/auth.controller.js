const User = require('../models/user');
const UserPreferences = require('../models/userPreferences');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (user) =>{
    return jwt.sign({
        id: user._id,
        email: user.email
    },
    process.env.JWT_SECRET,
    {expiresIn: '30d'}
    );
}

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all the credentials'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      password: hashedPassword,
      name
    });

    await UserPreferences.findOneAndUpdate(
      { user_id: user._id },
      {
        $set: {
          dietary_restrictions: [],
          allergies: [],
          preferred_cuisines: [],
          default_servings: 4,
          measurement_unit: "metric"
        }
      },
      { upsert: true }
    );

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        },
        token
      }
    });

  } catch (error) {
    next(error);
  }
}


const login = async(req, res, next) =>{
    try{
        const {email, password} = req.body;

        if(!email || ! password){
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            data:{
                user:{
                    id: user._id,
                    email: user.email,
                    name: user.name
                },
                token
            }
        });
    }
    catch(error){
        next(error);
    }
}


const getCurrentUser = async(req, res, next) =>{
    try{
        const user = await User.findById(req.user.id);

        if(!user){
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data:{ user }
        });
    }
    catch(error){
        next(error);
    }
}

const requestPasswordReset = async(req, res, next)=>{
    try{
        const {email} = req.body;

        if(!email){
            return res.status(400).json({
                success: false,
                message: 'Please provide email'
            });
        }
        
        const user = await User.findOne({email});

        res.json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent'
        });
    }
    catch(error){
        next(error);
    }
}

module.exports ={
    register, login, getCurrentUser, requestPasswordReset
}