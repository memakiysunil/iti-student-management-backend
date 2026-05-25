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
            const error = new Error("enrollment number already exists");
            error.statusCode =400;
            return next(error);
        }

        const newuser = await new User(data).save();
        const payload = {id:newuser.id, role:newuser.role};
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
        if(!user){
            const error = new Error("Invalid email");
            error.statusCode = 401;
            return next(error);
        }
        const pas = await user.comparePassword(password);
        if(!pas){
            const error = new Error("Invalid password");
            error.statusCode = 401;
            return next(error)
        }

        const payload = {id:user.id, role:user.role};
        const token = generateToken(payload);

        res.status(200).json({success: true, token});
    }
    catch(err){
        next(err);
    }
};

exports.getprofile = async (req, res, next) => {
    try{

        const selectFields = req.user.role === "admin" 
            ? "fullName email role" 
            : "fullName email trade enrollmentNo role";

        const user = await User.findById(req.user.id).select(selectFields);
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
    try {
        const user = await User.aggregate([
            { $match: { role: "student" } },
            {
                $addFields: {
                    tradeOrder: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$trade", "COPA"] },                     then: 1 },
                                { case: { $eq: ["$trade", "Sewing Technology"] },        then: 2 },
                                { case: { $eq: ["$trade", "Hair & Skin Care"] },         then: 3 },
                                { case: { $eq: ["$trade", "Dress Making"] },             then: 4 },
                                { case: { $eq: ["$trade", "Embroidery & Needle Work"] }, then: 5 },
                                { case: { $eq: ["$trade", "Stenography"] },              then: 6 },
                                { case: { $eq: ["$trade", "Food Production"] },          then: 7 },
                            ],
                            default: 99
                        }
                    }
                }
            },
            { $sort: { tradeOrder: 1 } },
            { $project: { fullName: 1, email: 1, trade: 1, enrollmentNo: 1 } }
        ]);

        if (user.length === 0) {
            const error = new Error("No students found");
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json({ success: true, count: user.length, user });
    } catch (err) {
        next(err);
    }
};