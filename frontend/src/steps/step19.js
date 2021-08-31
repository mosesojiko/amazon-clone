// Create Shipping Screen

/*
1. create checkoutSteps.js component
2. create shipping fields
3. implement shipping constants, actions, and reducers
 */

//create CheckoutSteps.js component
import React from 'react'

function CheckoutSteps(props) {
    return (
        <div className = "row checkout-steps">
            <div className = {props.step1 ? 'active' : ''}>Sign-In</div>
            <div className = {props.step2 ? 'active' : ''}>Shipping</div>
            <div className = {props.step3 ? 'active' : ''}>Payment</div>
            <div className = {props.step4 ? 'active' : ''}>Place Order</div>
            
        </div>
    )
}

export default CheckoutSteps

//create ShippingAddressScreen.js in screens folder
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress } from '../actions/cartActions';
import CheckoutSteps from '../components/CheckoutSteps'

function ShippingAddressScreen(props) {
    //only signed-in user should see this screen
    const userSignin = useSelector(state => state.userSignin);
    const { userInfo } = userSignin; //get userInfo from userSignin

    //get userInfo from previous order/cart
    const cart = useSelector(state => state.cart);
    const { shippingAddress } = cart
    if(!userInfo) {
        props.history.push('/signin')
    }

//instaed of empty values, default values for these fields should come from the information in shippingAddress
    const [ fullName, setFullName ] = useState(shippingAddress.fullName);
    const [ address, setAddress ] = useState(shippingAddress.address);
    const [ city, setCity ] = useState(shippingAddress.city);
    const [ postalCode, setPostalCode ] = useState(shippingAddress.postalCode);
    const [ country, setCountry ] = useState(shippingAddress.country);

    //define dispatch 
    const dispatch = useDispatch()

    //function to handle submit
    const submitHandler = (e) =>{
        e.preventDefault();
        dispatch(saveShippingAddress({fullName, address, city, postalCode, country}))
        //redirect the user to payment
        props.history.push('/payment')
    }
    return (
        <div>
            <CheckoutSteps step1 step2></CheckoutSteps>
            <form className ="form" onSubmit = { submitHandler }>
                <div>
                    <h1>Shipping Address</h1>
                </div>
                <div>
                    <label htmlFor = "fullName">Fullname</label>
                    <input type="text" id="fullName" placeholder="Enter your fullname" 
                    value = {fullName} onChange = { (e) =>setFullName(e.target.value)} required></input>
                </div>
                <div>
                    <label htmlFor = "address">Address</label>
                    <input type="text" id="address" placeholder="Enter address" 
                    value = {address} onChange = { (e) =>setAddress(e.target.value)} required></input>
                </div>
                <div>
                    <label htmlFor = "city">City</label>
                    <input type="text" id="city" placeholder="Enter city" 
                    value = {city} onChange = { (e) =>setCity(e.target.value)} required></input>
                </div>
                <div>
                    <label htmlFor = "postalCode">Postal Code</label>
                    <input type="text" id="postalCode" placeholder="Enter postal code" 
                    value = {postalCode} onChange = { (e) =>setPostalCode(e.target.value)} required></input>
                </div>
                <div>
                    <label htmlFor = "country">Country</label>
                    <input type="text" id="country" placeholder="Enter country" 
                    value = {country} onChange = { (e) =>setCountry(e.target.value)} required></input>
                </div>
                <div>
                    <label />
                    <button className="primary" type ="submit">Continue</button> 
                </div>
            </form>
        </div>
    )
}

export default ShippingAddressScreen

 
                  


//create a route for ShippingAddressScreen in App.js

import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import { signout } from './actions/userActions';
import CartScreen from './screens/CartScreen';
import HomeScreen from './screens/HomeScreen';
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



//constants inside constants
export const CART_ADD_ITEM = 'CART_ADD_ITEM';
export const CART_REMOVE_ITEM = "CART_REMOVE_ITEM"
export const CART_SAVE_SHIPPING_ADDRESS = 'CART_SAVE_SHIPPING_ADDRESS'

//inside cartActions
import Axios from "axios"
import { CART_ADD_ITEM, CART_REMOVE_ITEM, CART_SAVE_SHIPPING_ADDRESS } from "../constants/cartConstants"

export const addToCart = (productId, qty) => async(dispatch, getState) => {
    //send axios request to get information of this product
    const { data } = await Axios.get(`/api/products/${productId}`)
    dispatch({
        type: CART_ADD_ITEM,
        payload: {
            name: data.name,
            image: data.image,
            price: data.price,
            countInStock: data.countInStock,
            product: data._id,
            qty,
        },
    });
    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
}

//remove from cart
export const removeFromCart = (productId) => (dispatch, getState) =>{
    dispatch({
        type: CART_REMOVE_ITEM,
        payload: productId
    });
    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems))
}

//define saveShippingAddress function
export const saveShippingAddress = (data) =>(dispatch) => {
    dispatch({
        type: CART_SAVE_SHIPPING_ADDRESS,
        payload: data
    })
    localStorage.setItem('shippingAddress', JSON.stringify(data))
}



//inside cartReducers
import { CART_ADD_ITEM, CART_REMOVE_ITEM, CART_SAVE_SHIPPING_ADDRESS } from "../constants/cartConstants";

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
        default:
            return state
    }
}

        

//add shippingAddress to cart in store.js
import {compose, applyMiddleware, createStore, combineReducers } from 'redux'
import thunk from 'redux-thunk';
import { cartReducer } from './reducers/cartReducers';

import { productDetailsReducer, productListReducer } from './reducers/productReducers';
import { userRegisterReducer, userSigninReducer } from './reducers/userReducers';

const initialState = {
    userSignin: {
        userInfo: localStorage.getItem('userInfo')? JSON.parse(localStorage.getItem('userInfo')) : null
    },
    cart: {
        cartItems: localStorage.getItem('cartItems')? JSON.parse(localStorage.getItem('cartItems')) : [],
        shippingAddress: localStorage.getItem('shippingAddress')? JSON.parse(localStorage.getItem('shippingAddress')) : {},
    },
};

const reducer = combineReducers({
    //introduce reducers to reducer store
    productList: productListReducer,
    productDetails: productDetailsReducer,
    cart: cartReducer,
    userSignin: userSigninReducer,
    userRegister: userRegisterReducer
})
//to show store in the console
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
//create store
const store = createStore(reducer, initialState, composeEnhancer(applyMiddleware(thunk)))

export default store