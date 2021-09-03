// Implement Order Payment

/*
1. update order after payment
2. create payOrder in api.js
3. create route for /:id/pay in orderRouter.js
4. rerender after pay order 

*/



//update orderModel.js in backend
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
    paymentResult: {
            id: String,
            status: String,
            update_time: String,
            email_address: String
    },
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

// add orderRouter.pu() route in orderRouter.js
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

//update orderConstants.js to add ORDER_PAY constants
export const ORDER_CREATE_REQUEST = "ORDER_CREATE_REQUEST";
export const ORDER_CREATE_SUCCESS = "ORDER_CREATE_SUCCESS";
export const ORDER_CREATE_FAIL = "ORDER_CREATE_FAIL";
export const ORDER_CREATE_RESET = "ORDER_CREATE_RESET";


export const ORDER_PAY_REQUEST = "ORDER_PAY_REQUEST";
export const ORDER_PAY_SUCCESS = "ORDER_PAY_SUCCESS";
export const ORDER_PAY_FAIL = "ORDER_PAY_FAIL";
export const ORDER_PAY_RESET = "ORDER_PAY_RESET";


export const ORDER_DETAILS_REQUEST = "ORDER_DETAILS_REQUEST";
export const ORDER_DETAILS_SUCCESS = "ORDER_DETAILS_SUCCESS";
export const ORDER_DETAILS_FAIL = "ORDER_DETAILS_FAIL";



//modify orderActions.js to add orderPay function
import Axios from 'axios';
import { CART_EMPTY } from '../constants/cartConstants';
import { ORDER_CREATE_FAIL, 
    ORDER_CREATE_REQUEST, 
    ORDER_CREATE_SUCCESS, 
    ORDER_DETAILS_FAIL, 
    ORDER_DETAILS_REQUEST, 
    ORDER_DETAILS_SUCCESS, 
    ORDER_PAY_FAIL, 
    ORDER_PAY_REQUEST,
    ORDER_PAY_SUCCESS} from "../constants/orderConstants"

export const createOrder = (order) => async (dispatch, getState) => {
    dispatch({
        type: ORDER_CREATE_REQUEST,
        payload: order
    });
    try {
        //get userInfo from redux store
        const { userSignin: { userInfo }} = getState() // getState returns the whole redux store for us
        const { data } = await Axios.post('/api/orders', order, {
            headers: {
                Authorization: `Bearer ${userInfo.token}`
            }
        })
        dispatch({
            type: ORDER_CREATE_SUCCESS,
            payload: data.order,
        });
        dispatch({
            type: CART_EMPTY,
        });
        localStorage.removeItem('cartItems');
    } catch (error) {
        dispatch({
            type: ORDER_CREATE_FAIL,
            payload: error.response && error.response.data.message?
            error.response.data.message : error.message,
        })
        
    }
}

//define detailsOrder function
export const detailsOrder = (orderId) => async (dispatch, getState) => {
    dispatch({
        type: ORDER_DETAILS_REQUEST,
        payload: orderId
    });
    const { userSignin: { userInfo }, } = getState()
    try {
        const { data } = await Axios.get(`/api/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${userInfo.token}`}
        });

        dispatch({
            type: ORDER_DETAILS_SUCCESS,
            payload: data
        })
    } catch (error) {
        const message = error.response && error.response.data.message?
        error.response.data.message : error.message;
        dispatch({
            type: ORDER_DETAILS_FAIL,
            payload: message
        })
        
    }
}

//pay order action
export const payOrder = async (order, paymentResult) => (dispatch, getState) =>{
    dispatch({
        type: ORDER_PAY_REQUEST,
        payload: {order, paymentResult}
    });
    //get user info
    const { userSignin: { userInfo }, } = getState();
    try {
        const { data } = Axios.put(`/api/orders/${order._id}/pay`, paymentResult, {
            headers: { Authorization: `Bearer ${userInfo.token}`},
        });
        dispatch({
            type: ORDER_PAY_SUCCESS,
            payload: data
        })
    } catch (error) {
        const message = error.response && error.response.data.message?
        error.response.data.message : error.message;
        dispatch({
            type: ORDER_PAY_FAIL,
            payload: message
        })
        
    }
}

//modify orderReducers.js to add orderPayReducer function
import { ORDER_CREATE_FAIL, ORDER_CREATE_REQUEST, ORDER_CREATE_RESET, ORDER_CREATE_SUCCESS, ORDER_DETAILS_FAIL, ORDER_DETAILS_REQUEST, ORDER_DETAILS_SUCCESS, ORDER_PAY_FAIL, ORDER_PAY_REQUEST, ORDER_PAY_SUCCESS } from "../constants/orderConstants";

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


//define orderPayReducer
export const orderPayReducer = (state = {}, action) => {
    switch(action.type) {
        case ORDER_PAY_REQUEST:
            return { loading: true };

        case ORDER_PAY_SUCCESS:
            return { loading: false, success: true };    

        case ORDER_PAY_FAIL:
            return { loading: false, error: action.pay };
            case ORDER_PAY_RESET:
                return {};       

        default:
            return state;    
    }
}

// add orderPayReducer to store.js
import {compose, applyMiddleware, createStore, combineReducers } from 'redux'
import thunk from 'redux-thunk';
import { cartReducer } from './reducers/cartReducers';
import { orderCreateReducer, orderDetailsReducer, orderPayReducer } from './reducers/orderReducers';

import { productDetailsReducer, productListReducer } from './reducers/productReducers';
import { userRegisterReducer, userSigninReducer } from './reducers/userReducers';

const initialState = {
    userSignin: {
        userInfo: localStorage.getItem('userInfo')? JSON.parse(localStorage.getItem('userInfo')) : null
    },
    cart: {
        cartItems: localStorage.getItem('cartItems')? JSON.parse(localStorage.getItem('cartItems')) : [],
        shippingAddress: localStorage.getItem('shippingAddress')? JSON.parse(localStorage.getItem('shippingAddress')) : {},
        paymentMethod: 'PayPal',
    },
};

const reducer = combineReducers({
    //introduce reducers to reducer store
    productList: productListReducer,
    productDetails: productDetailsReducer,
    cart: cartReducer,
    userSignin: userSigninReducer,
    userRegister: userRegisterReducer,
    orderCreate: orderCreateReducer,
    orderDetails: orderDetailsReducer,
    orderPay: orderPayReducer,
})
//to show store in the console
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
//create store
const store = createStore(reducer, initialState, composeEnhancer(applyMiddleware(thunk)))

export default store



//modify orderScreen.js
import Axios from 'axios';
import { PayPalButton } from 'react-paypal-button-v2';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom'
import { detailsOrder, payOrder } from '../actions/orderActions';

import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { ORDER_PAY_RESET } from '../constants/orderConstants';

function OrderScreen(props) {
    const orderId = props.match.params.id;
    //hook for getting the status of paypal sdk
    const [ sdkReady, setSdkReady ] = useState(false)
    const orderDetails = useSelector(state => state.orderDetails);
    const { order, loading, error } = orderDetails;
    //get the orderPay from redux store
    const orderPay = useSelector(state => state.orderPay);
    //in other to use error, and success in orderPay, we rename it
    const { loading: loadingPay, error: errorPay, success: successPay } = orderPay

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
    
        if(!order || successPay || (order && order._id !== orderId)){
            dispatch({type: ORDER_PAY_RESET})
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
      
        
    }, [dispatch, order, orderId, sdkReady, successPay]);

    //payment success handler function
    const successPaymentHandler = (paymentResult) =>{
        dispatch(payOrder(order, paymentResult))
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
                                            <>
                                            {
                                                errorPay && (<MessageBox variant="danger">{errorPay}</MessageBox>)
                                            }
                                            {loadingPay && <LoadingBox></LoadingBox>}
                                            <PayPalButton amount = { order.totalPrice }
                                            onSuccess = { successPaymentHandler }
                                            ></PayPalButton>
                                            </>
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
