const User = require('../models/User');
const {generateToken} = require('../middleware/authMiddleware');

exports.register = async (req, res, next) => {
    try{
        const data = req.body;

        const adminrole = await User.findOne({role:"admin"});
        if(data.role === "admin" && adminrole){
            const error = new Error("Admin user already exists");
            error.statusCode = 400;
            return next(error);
        }

        const existingUser = await User.findOne({email:data.email.toLowerCase().trim()});
        if(existingUser){
            const error = new Error("Email is already registered");
            error.statusCode = 400;
            return next(error);
        }

        const enrollExists = await User.findOne({enrollmentNo:req.body.enrollmentNo});
        if(enrollExists){
            const error = new Error("nrollment number already exists");
            error.statusCode =400;
            return next(error);
        }

        const newuser = await new User(data).save();
        const payload = {id:newuser.id};
        const token = generateToken(payload);
        
        res.status(201).json({success:true, newuser, token});
    }
    catch(err){
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try{
        const{email, password} = req.body;

        if(!email || !password){
            const error = new Error("Email and password are required");
            error.statusCode = 400;
            return next(error);
        }

        const user = await User.findOne({email});
        if(!user || !(await user.comparePassword(password))){
            const error = new Error("Invalid email or password");
            error.statusCode = 401;
            return next(error);
        }

        const payload = {id:user.id};
        const token = generateToken(payload);

        res.status(200).json({success: true, token, user:{_id:user._id, fullName:user.fullName, email:user.email, trade:user.trade, enrollmentNo:user.enrollmentNo, role:user.role}});
    }
    catch(err){
        next(err);
    }
};

exports.getprofile = async (req, res, next) => {
    try{
        const user = await User.findById(req.user.id);
        if(!user){
            const error = new Error("User not found");
            error.statusCode = 404;
            return next(error);
        }
        res.status(200).json({success: true, user});
    }
    catch(err){
        next(err);
    }
};

exports.updatePassword = async (req, res, next) => {
    try{
        const{currentPassword, newPassword} = req.body;

        if(!currentPassword || !newPassword){
            const error = new Error("Both currentPassword and newPassword are required");
            error.statusCode = 400;
            return next(error);
        }

        const user = await User.findById(req.user.id);
        if(!user || !(await user.comparePassword(currentPassword))){
            const error = new Error("Invalid current password");
            error.statusCode = 400;
            return next(error);
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({success: true, message: 'Password updated successfully'});
    }
    catch(err){
        next(err);
    }
};

exports.getalluser = async (req, res, next) => {
    try{
        const user = await User.find()
        .select("fullName email trade enrollmentNo");
        
        if(user.length === 0){
            const error = new Error("User not found");
            error.statusCode = 404;
            return next(error);
        }
        res.status(200).json({success: true, count: user.length, users: user});
    }
    catch(err){
        next(err);
    }
};