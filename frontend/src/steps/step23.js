// Implement place order action

/* 
1. handle place order button click
2. create place order constants, action, and reducer
*/

//modify PlaceOrderScreen.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom'
import { createOrder } from '../actions/orderActions';

import CheckoutSteps from '../components/CheckoutSteps'
import { ORDER_CREATE_RESET } from '../constants/orderConstants';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

function PlaceOrderScreen(props) {
    //get cart from redux store
    const cart = useSelector((state) => state.cart)
    //check if user entered payment method, if not redirect the user to payment method
    if(!cart.paymentMethod) {
        props.history.push('/payment')
    }
    //get orderCreate from redux store
    const orderCreate = useSelector(state => state.orderCreate);
    const { loading, success, error, order } = orderCreate
    //define a helper function for order summary
    const toPrice = (num) => Number(num.toFixed(2)); //e.g  5.123 => "5.12" => 5.12
    //using toPrice for cartItems
    cart.itemsPrice = toPrice(cart.cartItems.reduce((a, c) => a + c.qty * c.price, 0));
    //using toPrice for shippingAddress
    cart.shippingPrice = cart.itemsPrice > 100? toPrice(0): toPrice(10)
    //using it for tax
    cart.taxPrice = toPrice(0.15 * cart.itemsPrice);
    //for total price
    cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice

    //function for placeOrderHandler
    const dispatch = useDispatch();
    const placeOrderHandler = () => {
        //here, rename cart to orderItems bcos that is what we have in the backent
        dispatch(createOrder({ ...cart, orderItems: cart.cartItems }))
    }

    useEffect(() =>{
        if(success) {
            //redirect the user to order details screen
            props.history.push(`/order/${order._id}`);
            dispatch({
                type: ORDER_CREATE_RESET
            })
        }

    }, [dispatch, order, props.history, success])
    return (
        <div>
            <CheckoutSteps step1 step2 step3 step4 ></CheckoutSteps>
            <div className = "row top">
                <div className = "col-2">
                    <ul>
                        <li>
                            <div className ="card card-body">
                                <h2>Shipping</h2>
                                <p> <strong>Name:</strong> { cart.shippingAddress.fullName } <br />
                                <strong>Address:</strong> { cart.shippingAddress.address },
                                { cart.shippingAddress.city }, { cart.shippingAddress.postalCode },
                                { cart.shippingAddress.country }
                                </p>
                            </div>
                        </li>
                        <li>
                            <div className ="card card-body">
                                <h2>Payment</h2>
                                <p> <strong>Method:</strong> { cart.paymentMethod } 
                                </p>
                            </div>
                        </li>
                        <li>
                            <div className ="card card-body">
                                <h2>Order Items</h2>
                                <ul>
                            {
                                cart.cartItems.map((item) =>(
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
                                    <div>${cart.itemsPrice.toFixed(2)}</div>
                                </div>
                            </li>
                            <li>
                                <div className = "row">
                                    <div>Shipping</div>
                                    <div>${cart.shippingPrice.toFixed(2)}</div>
                                </div>
                            </li>
                            <li>
                                <div className = "row">
                                    <div>Tax</div>
                                    <div>${cart.taxPrice.toFixed(2)}</div>
                                </div>
                            </li>
                            <li>
                                <div className = "row">
                                    <div> <strong>Order Total</strong> </div>
                                    <div> <strong>${cart.totalPrice.toFixed(2)}</strong> </div>
                                </div>
                            </li>
                            <li>
                                <button type ="button" onClick = {placeOrderHandler}
                                className ="primary block"
                                disabled = { cart.cartItems.length === 0 }
                                >Place Order</button> 
                            </li>
                            {
                                loading && <LoadingBox></LoadingBox>
                            }
                            {
                                error && <MessageBox variant ="danger">{error}</MessageBox>
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlaceOrderScreen



// create orderConstants.js in constants folder
export const ORDER_CREATE_REQUEST = "ORDER_CREATE_REQUEST";
export const ORDER_CREATE_SUCCESS = "ORDER_CREATE_SUCCESS";
export const ORDER_CREATE_FAIL = "ORDER_CREATE_FAIL";
export const ORDER_CREATE_RESET = "ORDER_CREATE_RESET";


// create orderActions.js in actions folder
import Axios from 'axios';
import { CART_EMPTY } from '../constants/cartConstants';
import { ORDER_CREATE_FAIL, ORDER_CREATE_REQUEST, ORDER_CREATE_SUCCESS } from "../constants/orderConstants"

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


// create orderReducers.js in reducers folder
import { ORDER_CREATE_FAIL, ORDER_CREATE_REQUEST, ORDER_CREATE_RESET, ORDER_CREATE_SUCCESS } from "../constants/orderConstants";

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



// modified cartConstants.js
export const CART_ADD_ITEM = 'CART_ADD_ITEM';
export const CART_REMOVE_ITEM = "CART_REMOVE_ITEM";
export const CART_SAVE_SHIPPING_ADDRESS = 'CART_SAVE_SHIPPING_ADDRESS';
export const CART_SAVE_PAYMENT_METHOD = 'CART_SAVE_PAYMENT_METHOD';
export const CART_EMPTY = "CART_EMPTY";


// modify cartReducers.js
import { 
    CART_ADD_ITEM, 
    CART_EMPTY, 
    CART_REMOVE_ITEM, 
    CART_SAVE_PAYMENT_METHOD, 
    CART_SAVE_SHIPPING_ADDRESS 
} from "../constants/cartConstants";

export const cartReducer = (state = { cartItems: [] }, action) =>{
    switch(action.type){
        case CART_ADD_ITEM:
            const item = action.payload;
            const existItem = state.cartItems.find(x => x.product === item.product);

            if(existItem) {
                return {
                    ...state,
                    cartItems: state.cartItems.map(x => x.product === existItem.product? item: x),
                }
                }else{
                    return {
                        ...state,
                        cartItems: [...state.cartItems, item]
                    }
                }

        case CART_REMOVE_ITEM: 
             return {
                 ...state,
                 cartItems: state.cartItems.filter((x) => x.product !== action.payload)
             }       
            
        case CART_SAVE_SHIPPING_ADDRESS:
            return {
                 ...state,
                 shippingAddress: action.payload
            }

        case CART_SAVE_PAYMENT_METHOD:
            return {
                ...state,
                paymentMethod: action.payload
            }
        case CART_EMPTY:
            return {
                ...state, 
                cartItems: []
            }    

        default:
            return state
    }
}



// add orderCreateReducer to store.js
import {compose, applyMiddleware, createStore, combineReducers } from 'redux'
import thunk from 'redux-thunk';
import { cartReducer } from './reducers/cartReducers';
import { orderCreateReducer } from './reducers/orderReducers';

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
})
//to show store in the console
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
//create store
const store = createStore(reducer, initialState, composeEnhancer(applyMiddleware(thunk)))

export default store