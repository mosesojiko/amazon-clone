// Add PayPal Button

/* 
1. get client id from paypal
2. set it in .env file
3. create route form /api/paypal/clientId
4. create getPaypalClientID in api.js
5. add paypay checkout script in OrderScreen.js
6. show paypal button
*/

//to add paypal, go to
// https://developer.paypal.com/home
// then click on 'Log in to dashboard', signup and login, click on 'my apps & credentials'
// select 'sandbox', click 'create app', enter app name, click 'create app'
// creating app to get clientId and the rest
//copy your client id, and use it in .env
//AYlayFmZ383xlB4Y_6xQ977ELPbEfXddyU_F4pG6rmCFPdZaMYyfjpVR9NwSi55Om4HbEjSUf31ZJLVX

//create an api to send the client id from backend to the frontend, do this in server.js
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

//api for paypay
app.get('/api/config/paypay', (req, res) =>{
    // eslint-disable-next-line no-undef
    res.send(process.env.PAYPAL_CLIENT_ID || 'sb') //sb stands for sandbox
})


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


//to show paypay button, install react-paypal-button-v2 in frontend folder

//remove order : {} from orderReducers.js, state = {loading: true, order: {}},
import { ORDER_CREATE_FAIL, ORDER_CREATE_REQUEST, ORDER_CREATE_RESET, ORDER_CREATE_SUCCESS, ORDER_DETAILS_FAIL, ORDER_DETAILS_REQUEST, ORDER_DETAILS_SUCCESS } from "../constants/orderConstants";

export const orderCreateReducer = ( state = {}, action) => {
    switch(action.type) {
        case ORDER_CREATE_REQUEST:
            return { loading: true };

        case ORDER_CREATE_SUCCESS:
            return {
                loading: false, success: true, order: action.payload
            };
            
        case ORDER_CREATE_FAIL:
            return {
                loading: false, error: action.payload
            }  
        
        case ORDER_CREATE_RESET:
            return {};
                
        default: return state;
    }
}



export const orderDetailsReducer = (state = {loading: true}, action) => {
    switch(action.type) {
        case ORDER_DETAILS_REQUEST:
            return { loading: true}


        case ORDER_DETAILS_SUCCESS:
            return {
                loading: false,
                order: action.payload
            };
            
            
        case ORDER_DETAILS_FAIL:
            return {
                loading: false,
                error: action.payload
            }    

        default:
            return state    
    }
}


// update OrderScreen.js
import Axios from 'axios';
import { PayPalButton } from 'react-paypal-button-v2';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom'
import { detailsOrder } from '../actions/orderActions';

import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

function OrderScreen(props) {
    const orderId = props.match.params.id;
    //hook for getting the status of paypal sdk
    const [ sdkReady, setSdkReady ] = useState(false)
    const orderDetails = useSelector(state => state.orderDetails);
    const { order, loading, error } = orderDetails;
    //function for placeOrderHandler
    const dispatch = useDispatch();
   
    useEffect(() =>{
        //add paypal script function to this useEffect
        const addPayPalScript = async () =>{
            const { data } = await Axios.get('/api/config/paypal');
            //now define a script and set the source to this paypal sdk
            const script = document.createElement('script');
            script.type="text/javascript";
            script.src = `https://www.paypal.com/sdk/js?client-id=${data}`;
            script.async = true;
            script.onload = () =>{
                setSdkReady(true)
            };
           document.body.appendChild(script)
        }
    
        if(!order._id){
            dispatch(detailsOrder(orderId)); //load the order
        }else{
            //order is ready
            if(!order.isPaid){
                //if the order is not paid, check if you have already loaded the paypal
                if(!window.paypal){
                    //then load the paypal
                    addPayPalScript()
                }else{
                    //we have an unpaid order, and paypal already loaded
                    setSdkReady(true)
                }
            }
        }
      
        
    }, [dispatch, order, orderId, sdkReady]);

    //payment success handler function
    const successPaymentHandler = () =>{
        //TODO: dispatch pay order
    }
    return loading? (<LoadingBox></LoadingBox>):
    error? (<MessageBox variant="danger">{error}</MessageBox>):
    (
        <div>
            <h1>Order {order._id} </h1>
            <div className = "row top">
                <div className = "col-2">
                    <ul>
                        <li>
                            <div className ="card card-body">
                                <h2>Shipping</h2>
                                <p> <strong>Name:</strong> { order.shippingAddress.fullName } <br />
                                <strong>Address:</strong> { order.shippingAddress.address },
                                { order.shippingAddress.city }, { order.shippingAddress.postalCode },
                                { order.shippingAddress.country }
                                </p>

                                { order.isDelivered?
                                 (<MessageBox variant ="success">Delivered at {order.deliveredAt}</MessageBox>):
                                 (<MessageBox variant="danger">Not Delivered</MessageBox>)
                                 }
                            </div>
                        </li>
                        <li>
                            <div className ="card card-body">
                                <h2>Payment</h2>
                                <p> <strong>Method:</strong> { order.paymentMethod } 
                                </p>

                                { order.isPaid?
                                 (<MessageBox variant ="success">Paid at {order.paidAt}</MessageBox>):
                                 (<MessageBox variant="danger">Not Paid</MessageBox>)
                                 }
                            </div>
                        </li>
                        <li>
                            <div className ="card card-body">
                                <h2>Order Items</h2>
                                <ul>
                            {
                                order.orderItems.map((item) =>(
                                    <li key = { item.product }>
                                        <div className ="row">
                                            <div>
                                                <img src = { item.image } alt = { item.name } className="small"></img>
                                            </div>
                                            <div className ="min-30">
                                                <Link to = {`/product/${item.product}`}>{item.name}</Link>
                                            </div>
                                            
                                            <div>

                                                {item.qty} x {item.price} = ${item.qty * item.price}
                                            </div>
                                            
                                        </div>
                                    </li>
                                ))
                            }
                        </ul>
                            </div>
                        </li>
                    </ul>

                </div>
                <div className = "col-1">
                    <div className ="card card-body">
                        <ul>
                            <li>
                                <h2>Order Summary</h2>
                            </li>
                            <li>
                                <div className = "row">
                                    <div>Items</div>
                                    <div>${order.itemsPrice.toFixed(2)}</div>
                                </div>
                            </li>
                            <li>
                                <div className = "row">
                                    <div>Shipping</div>
                                    <div>${order.shippingPrice.toFixed(2)}</div>
                                </div>
                            </li>
                            <li>
                                <div className = "row">
                                    <div>Tax</div>
                                    <div>${order.taxPrice.toFixed(2)}</div>
                                </div>
                            </li>
                            <li>
                                <div className = "row">
                                    <div> <strong>Order Total</strong> </div>
                                    <div> <strong>${order.totalPrice.toFixed(2)}</strong> </div>
                                </div>
                            </li>
                            {
                                /* Paypay button. check if oreder is not paid, check if the paypal button is not loaded */
                                !order.isPaid && (
                                    <li>
                                        {
                                        !sdkReady? (<LoadingBox></LoadingBox>):
                                        (
                                            <PayPalButton amount = { order.totalPrice }
                                            onSuccess = { successPaymentHandler }
                                            ></PayPalButton>
                                        )
                                        }
                                    </li>
                                )
                            }
                           
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderScreen
