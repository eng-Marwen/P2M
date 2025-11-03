import jwt from "jsonwebtoken";

export const verifyToken=async(req,res,next)=>{
    try{
        const token=req.cookies["auth-token"];
        if(!token)throw new Error('Unauthorized - invalid token');
        const decoded=jwt.verify(token,process.env.SECRET_KEY);
        if(!decoded)throw new Error('Unauthorized - invalid token');
        req.userId=decoded.userId;
        next();
        
    }catch(error){
        res.status(403).json({
            status:'fail',
            message:error.message
        })
    }
}