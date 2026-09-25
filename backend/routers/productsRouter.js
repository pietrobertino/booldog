const express = require('express')
const router = express.Router()
const productController = require("../controllers/productController")



//index
router.get("/", productController.index)

//index animal type
router.get("/animal/:animalType", productController.indexAnimalType)

//show
router.get("/:slug", productController.show)

module.exports = router