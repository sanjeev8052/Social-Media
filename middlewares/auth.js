const  User = require('../models/user')
const jwt = require('jsonwebtoken');


exports.isAuthenticated  = async (req, res, next)=>{
    try {
        const {token} = req.cookies;
   
    const jwt_secret = "lkslsdjosdlkjls";
    if(!token){
        return res
        .status(401)
        .json({message:" Please login first"})
    }
   
    const decoded = jwt.verify(token,jwt_secret)

    req.user = await User.findById(decoded._id)
    
    next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
    
}