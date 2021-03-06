import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import { isAuth } from '../utils/utils.js';

const orderRouter = express.Router();
//router to get history of orders
orderRouter.get('/mine', isAuth, expressAsyncHandler(async(req, res)=>{
    const orders = await Order.find({user: req.user._id});
    res.send(orders)
}))

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

// api for getting details of an order
orderRouter.get('/:id', isAuth, expressAsyncHandler( async (req, res)=>{
    const order = await Order.findById(req.params.id);
    if(order) {
        res.send(order)
    }else{
        res.status(404).send({message: "Order Not Found."})
    }
}))

// router to update order
orderRouter.put('/:id/pay', isAuth, expressAsyncHandler(async(req, res) =>{
    const order = await Order.findById(req.params.id);
    if(order){
        order.isPaid = true,
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address
        };
        const updatedOrder = await order.save();
        res.send({
            message: "Order paid",
            order: updatedOrder
        })
    }else{
        res.status(404).send({message: 'Order Not Found'});
    }
}))
export default orderRouter;