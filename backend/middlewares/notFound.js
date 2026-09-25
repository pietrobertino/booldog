const notFound = (req, res, next)=>{
    res.status(404).json({
        error:true,
        message:"Not Found"
    })
}

module.exports = notFound