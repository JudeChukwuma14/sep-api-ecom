const express = require("express")
const app = express()
require("dotenv").config()
const allAuthRouter = require("./router/authRoute")
const allProductRouter = require('./router/productRoute')

const mongoose = require("mongoose")
const mongodbString = process.env.MONGODB_URL
mongoose.connect(mongodbString).then(() => {
    console.log(`DB connected to ${mongodbString}`)
    console.log("Database is Active")
}).catch((err) => {
    console.error(err.message)
})


app.use(express.json())
app.use(express.urlencoded({ extended: true }))



app.use("/api/v1", allAuthRouter)
app.use("/api/v1/product", allProductRouter)

const port = process.env.PORT
app.listen(port, () => {
    console.log(`Server is active on Port ${port}`)
})