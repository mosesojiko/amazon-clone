// Create Place Order API

/*
1. createOrder api
2. create createOrder model
3. create createOrder router
4. create post order route
*/

//in backend folder, create orderModel.js in models folder
import mongooses from 'mongoose';

const orderShema = new mongooses.Schema({
    orderItems: [{
        name: {type: String, required: true},
        qty: {type: Number, reqired: true},
        image: {type: String, required: true},
        price: {type: Number, required: true},
        product: {
            type: mongooses.Schema.Types.ObjectId,
            ref: 'Product', 
            required: true,
        },
    },],
    shippingAddress: {
        fullName: {type: String, required: true},
        address: {type: String, required: true},
        city: {type: String, required: true},
        postalCode: {type: String, required: true},
        country: {type: String, required: true},
    },
    paymentMethod: {type: String, required: true},
    itemsPrice: {type: Number, required:true},
    shippingPrice: {type: Number, required:true},
    taxPrice: {type: Number, required:true},
    totalPrice: {type: Number, required:true},
    user: {
        type: mongooses.Schema.Types.ObjectId, 
        ref: "User",
        required: true,
    },
    isPaid: {type: Boolean, default: false},
    paidAt: {type: Date},
    isDelivered: {type: Boolean, default: false},
    deliveredAt: {type: Date},
},
{
    timestamps: true,
}
);

const Order = mongooses.model("Order", orderShema)

export default Order;

// in backend folder, craete orderRouter.js in routers folder
import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import { isAuth } from '../utils/utils.js';

const orderRouter = express.Router();

orderRouter.post('/', isAuth, expressAsyncHandler( async(req, res) =>{
    //check if order items contains order or not
    if(req.body.orderItems.length === 0) {
        res.status(400).send({message: 'Cart is empty'})
    }else{
        //to get information about the user that created this order, define a middleware called isAuth in utils folder
        const order = new Order({
            orderItems: req.body.orderItems,
            shippingAddress: req.body.shippingAddress,
            paymentMethod: req.body.paymentMethod,
            itemsPrice: req.body.itemsPrice,
            shippingPrice: req.body.shippingPrice,
            taxPrice: req.body.taxPrice,
            totalPrice: req.body.totalPrice,
            user: req.user._id,
        });
        const createdOrder = await order.save();
        res.status(201).send({
            message: "New Order Created",
            order: createdOrder
        })
    }
}))

export default orderRouter;

//in backend folder, create a middleware called isAuth to authenticate user, done in utils.js under utils folder
import jwt from 'jsonwebtoken'

export const generateToken = (user) =>{
    return jwt.sign({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin}, 
        // eslint-disable-next-line no-undef
        process.env.JWT_SECRET || 'somethingsecret',
        {
            expiresIn: '30d',
        }
        )
}

// function to authenticate user that created an order
export const isAuth = (req, res, next) =>{
    const authorization = req.headers.authorization;
    if(authorization) {
        const token = authorization.slice(7, authorization.length) //Bearer xxxxx => xxxxx i.e slcice start from x
        //use jwt to dcrypt the token
        // eslint-disable-next-line no-undef
        jwt.verify(token, process.env.JWT_SECRET || 'somethingsecret', (err, decode) =>{
            if(err) {
                res.status(401).send({message: "Invalid Token"})
            }else{
                req.user = decode; //info about the user
                next()
            }
        })
    }else{
        res.status(401).send({message: "No Token"})
    }
}


// modify server.js by adding app.use('/api/orders', orderRouter)
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