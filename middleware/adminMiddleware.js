const User = require('../models/User');

const checkAdminRole = async(req, res, next) => {
    try{
        const user = await User.findById(req.user.id);
        if(!user){
            const error = new Error("User not found");
            error.statusCode = 404;
            return next(error);
        }

        if(user.role !== "admin"){
            const error = new Error("You are not authorized to access this .");
            error.statusCode = 403;
            return next(error);
        }
        next();
    }
    catch(err){
        next(err);
    }
};

module.exports = checkAdminRole;