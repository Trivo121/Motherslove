const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

exports.register = async(req,res)=>{

    const {name,email,password} = req.body;

    const exists = await User.findOne({email});

    if(exists)
        return res.status(400).json({
            message:"Email already exists"
        });

    const user = await User.create({
        name,
        email,
        password
    });

    res.status(201).json({
        token:generateToken(
            user._id,
            user.role
        )
    });
};

exports.login = async(req,res)=>{

    const {email,password} = req.body;

    const user = await User.findOne({email});

    if(
        !user ||
        !(await bcrypt.compare(password,user.password))
    ){
        return res.status(401).json({
            message:"Invalid credentials"
        });
    }

    res.json({
        token:generateToken(
            user._id,
            user.role
        )
    });
};