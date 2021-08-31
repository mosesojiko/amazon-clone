import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import productRouter from './routers/productRouter.js';
import userRouter from './routers/userRouter.js';
import orderRouter from './routers/orderRouter.js';

dotenv.config();
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// eslint-disable-next-line no-undef
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/amazona',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/api/users', userRouter)
app.use('/api/products', productRouter)
app.use('/api/orders', orderRouter)


//test if server is running well
app.get('/', (req, res)=>{
    res.send("Server is ready");
})

//to show errors
app.use((err, req, res, next) =>{
    res.status(500).send({ message: err.message })
    next()
})
// eslint-disable-next-line no-undef
const port = process.env.PORT || 4000
app.listen(port, ()=>{
    console.log(`Serve as http://localhost:${port}`)
})