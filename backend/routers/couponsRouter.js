const express = require('express')
const router = express.Router()
const couponController = require("../controllers/couponController")



// validate 
router.post("/", couponController.validate)



module.exports = router