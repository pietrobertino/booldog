const express = require('express')
const app = express()
const PORT = 3000
const productsRouter = require("./routers/productsRouter")
const couponsRouter = require("./routers/couponsRouter")
const ordersRouter = require("./routers/ordersRouter")
const brandsRouter = require("./routers/brandsRouter")
const serverError = require("./middlewares/serverError")
const notFound = require("./middlewares/notFound")
const cors = require("cors")

app.use(cors())

app.use(express.json())

app.use(express.static('public'))


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/products', productsRouter)

app.use('/validate', couponsRouter)

app.use("/orders", ordersRouter)

app.use("/brands", brandsRouter)

app.use(notFound)

app.use(serverError)


app.listen(PORT, () => {
  console.log(`Example app listening on port http://localhost:${PORT}`)
})

