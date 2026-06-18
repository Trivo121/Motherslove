const adminOnly = (req,res,next)=>{

    if(
        req.user.role !== "admin" &&
        req.user.role !== "superadmin"
    ){
        return res.status(403).json({
            message:"Access Denied"
        });
    }

    next();
};

module.exports = adminOnly;