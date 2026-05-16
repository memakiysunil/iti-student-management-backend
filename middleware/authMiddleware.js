const jwt = require('jsonwebtoken');

const jwtAuthmiddlewere = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if(!authHeader){
        const error = new Error('Authorization header missing');
        error.statusCode = 401;
        return next(error);
    }

    if(!authHeader.startsWith('Bearer')){
        const error = new Error('Invalid token format');
        error.statusCode = 401;
        return next(error);
    }

    const token = authHeader.split(' ')[1];

    try{
        const decoded =  jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    }
    catch(err){
        const error = new Error ('Unauthorized')
        error.statusCode = 401;
        return next(error);
    }
};

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '100h'});
};

module.exports = {jwtAuthmiddlewere , generateToken}
    
