// Display Orders History

/* 
create OrderHistoryScreen.js
1. create customer orders api
2. create api for getMyOrders
3. show orders in profile screen
4. style orders
*/

//modify orderConstants.js
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

//for order history
export const ORDER_MINE_LIST_REQUEST = "ORDER_MINE_LIST_REQUEST"
export const ORDER_MINE_LIST_SUCCESS = "ORDER_MINE_LIST_SUCCESS"
export const ORDER_MINE_LIST_FAIL = "ORDER_MINE_LIST_FAIL"


//modify orderActions.js
import Axios from 'axios';
import { CART_EMPTY } from '../constants/cartConstants';
import { ORDER_CREATE_FAIL, 
    ORDER_CREATE_REQUEST, 
    ORDER_CREATE_SUCCESS, 
    ORDER_DETAILS_FAIL, 
    ORDER_DETAILS_REQUEST, 
    ORDER_DETAILS_SUCCESS, 
    ORDER_MINE_LIST_FAIL, 
    ORDER_MINE_LIST_REQUEST, 
    ORDER_MINE_LIST_SUCCESS, 
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


//ACTION FOR ORDER HISTORY
//return my orders
export const listOrderMine = () =>async(dispatch, getState) =>{
    dispatch({
        type: ORDER_MINE_LIST_REQUEST
    })
//get userInfo
    const { userSignin: { userInfo }} = getState();
    try {
        const { data } = await Axios.get('/api/orders/mine', {
            headers: {
                Authorization: `Bearer ${userInfo.token}`
            }
        });
        dispatch({
            type: ORDER_MINE_LIST_SUCCESS,
            payload: data
        })
        
    } catch (error) {
        const message = error.response && error.response.data.message?
        error.response.data.message : error.message;
        dispatch({type: ORDER_MINE_LIST_FAIL, payload: message})
    }
}


// modify orderReducers.js
import { 
    ORDER_CREATE_FAIL, 
    ORDER_CREATE_REQUEST, 
    ORDER_CREATE_RESET, 
    ORDER_CREATE_SUCCESS, 
    ORDER_DETAILS_FAIL, 
    ORDER_DETAILS_REQUEST, 
    ORDER_DETAILS_SUCCESS, 
    ORDER_MINE_LIST_FAIL, 
    ORDER_MINE_LIST_REQUEST, 
    ORDER_MINE_LIST_SUCCESS, 
    ORDER_PAY_FAIL, 
    ORDER_PAY_REQUEST, 
    ORDER_PAY_RESET, 
    ORDER_PAY_SUCCESS } from "../constants/orderConstants";

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
            return { loading: false, error: action.pay } ;
            
            case ORDER_PAY_RESET:
                return {};     

        default:
            return state;    
    }
}

//reducer for history of orders
export const orderMineListReducer = (state = { orders: []}, action) =>{
    switch(action.type) {
        case ORDER_MINE_LIST_REQUEST:
            return { loading: true };

        case ORDER_MINE_LIST_SUCCESS:
            return { loading: false, orders: action.payload };  
            
        case ORDER_MINE_LIST_FAIL:
            return { loading: false, error: action.payload };    

        default:
            return state;    
    }
}


// add orderMineListReducers to store.js
import {compose, applyMiddleware, createStore, combineReducers } from 'redux'
import thunk from 'redux-thunk';
import { cartReducer } from './reducers/cartReducers';
import { orderCreateReducer, orderDetailsReducer, orderMineListReducer, orderPayReducer } from './reducers/orderReducers';

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
    orderMineList: orderMineListReducer
})
//to show store in the console
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
//create store
const store = createStore(reducer, initialState, composeEnhancer(applyMiddleware(thunk)))

export default store


//add route to orderHistoryScreen.js from App.js. Also add order history in dropdown

import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import { signout } from './actions/userActions';
import CartScreen from './screens/CartScreen';
import HomeScreen from './screens/HomeScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import OrderScreen from './screens/OrderScreen';
import PaymentMethodsScreen from './screens/PaymentMethodsScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import ProductScreen from './screens/ProductScreen';
import RegisterScreen from './screens/RegisterScreen';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import SigninScreen from './screens/SigninScreen';


function App() {
    //get access to cartItems from redux store
    const cart = useSelector(state => state.cart);
    const { cartItems } = cart
    //get access to userSignin from redux store
    const userSignin = useSelector((state) => state.userSignin);
    const { userInfo } = userSignin;

    //sign out function
    const dispatch = useDispatch()
    const signoutHandler = () =>{
        dispatch(signout())
    }
  return (
    <BrowserRouter>
    <div className="grid-container">
    <header className="row">
        <div>
            <Link className="brand" to="/">Amazon</Link>
        </div>
        <div>
            <Link to="/cart">Cart
            {cartItems.length > 0 && (
                <span className = "badge">{cartItems.length}</span>
            )}
            </Link>
            {
                  /* Show name of user that signed in. Also implement signout */
                userInfo? (
                    <div className ="dropdown">
                         <Link to ="#">{ userInfo.name } <i className ="fa fa-caret-down"></i> </Link>
                         <ul className = "dropdown-content">
                             <li>
                                 <Link to ="/orderhistory">Order History</Link>
                             </li>
                        <Link to ="#signout" onClick= { signoutHandler }> Sign Out </Link>
                        </ul>
                    </div>
                    
                ):
                (
                    <Link to="/signin">Sign In</Link>

                )
            }
            
        </div>
    </header>
    <main>
    <Route path = '/cart/:id?' component = {CartScreen} ></Route>
    <Route path = '/product/:id' component = {ProductScreen} ></Route>
    <Route path = '/signin' component = {SigninScreen} ></Route>
    <Route path = '/register' component = { RegisterScreen } ></Route>
    <Route path = '/shipping' component = { ShippingAddressScreen } ></Route>
    <Route path = '/payment' component = { PaymentMethodsScreen } ></Route>
    <Route path = '/placeorder' component = { PlaceOrderScreen } ></Route>
    <Route path = '/order/:id' component = { OrderScreen } ></Route>
    <Route path = '/orderhistory' component = { OrderHistoryScreen } ></Route>
    <Route path = '/' component = {HomeScreen} exact></Route>
          
    </main>
    <footer className="row center">
        All right reserved
    </footer>
</div>
    </BrowserRouter>
   );
}

export default App;


//in backend, modify orderRouter.js to add a route that gets all orders
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


// craete OrderHistoryScreen.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listOrderMine } from '../actions/orderActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

function OrderHistoryScreen(props) {
    const orderMineList = useSelector(state => state.orderMineList);
    const { loading, error, orders } = orderMineList

    const dispatch = useDispatch();
    useEffect(()=>{
        //call listOrderMine form orderActions
        dispatch(listOrderMine())

    }, [dispatch])
    return (
        <div>
            <h1> Order History</h1>
            {
                loading? <LoadingBox></LoadingBox>:
                error? <MessageBox variant="danger">{error}</MessageBox>:
                (
                    <table className ="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>DATE</th>
                                <th>TOTAL</th>
                                <th>PAID</th>
                                <th>DELIVERED</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                orders.map((order) =>(
                                    <tr key = {order._id}>
                                        <td>{order._id}</td>
                                        {/* get only the date part, and leave the time*/}
                                        <td>{order.createdAt.substring(0, 10)}</td>
                                        <td>{order.totalPrice.toFixed(2)}</td>
                                        <td>{order.isPaid? order.paidAt.substring(0, 10): "No"}</td>
                                        <td>{order.deliveredAt? order.deliveredAt.substring(0, 10): "No"}</td>
                                        <td>
                                            <button type ="button" className="small"
                                            onClick = {()=> {props.history.push(`/order/${order._id}`)}}>
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                )
            }
        </div>
    )
}

export default OrderHistoryScreen
