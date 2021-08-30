// Implement SignIn Action

/* 
1. create signin constants, actions, and reducers
2. add reducer to store.js
3. use action in SigninScreen.js
 */

// userConstants.js
export const USER_SIGNIN_REQUEST = "USER_SIGNIN_REQUEST";
export const USER_SIGNIN_SUCCESS = "USER_SIGNIN_SUCCESS";
export const USER_SIGNIN_FAIL = "USER_SIGNIN_FAIL";
export const USER_SIGNOUT = "USER_SIGNOUT";

//userActions.js
import { USER_SIGNIN_FAIL, 
    USER_SIGNIN_REQUEST, 
    USER_SIGNIN_SUCCESS, 
    USER_SIGNOUT } from "../constants/userConstants"
import Axios from 'axios'

export const signin = (email, password) => async(dispatch) => {
    dispatch({
        type: USER_SIGNIN_REQUEST,
        payload: { email, password }
    });
    try {
        const { data } = await Axios.post('/api/users/signin', {email, password});
        dispatch({
            type: USER_SIGNIN_SUCCESS,
            payload: data
        })
        localStorage.setItem("userInfo", JSON.stringify(data))
    } catch (error) {
        dispatch({
            type: USER_SIGNIN_FAIL,
            payload: error.response && error.response.data.message?
            error.response.data.message : error.message
        })
        
    }
}

export const signout = () => (dispatch) => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('cartItems');

    dispatch({
        type: USER_SIGNOUT
    })
}
// userReducer.js 
import { USER_SIGNIN_FAIL, 
    USER_SIGNIN_REQUEST, 
    USER_SIGNIN_SUCCESS, 
    USER_SIGNOUT } from "../constants/userConstants";

export const userSigninReducer = (state = {}, action) => {
    switch(action.type){
        case USER_SIGNIN_REQUEST:
            return { loading: true};

        case USER_SIGNIN_SUCCESS:
            return { loading: false, userInfo: action.payload };
            
        case USER_SIGNIN_FAIL: 
            return { loading: false, error: action.payload };
            
        case USER_SIGNOUT:
            return {};

         default : 
         return state;   
    }
}

// add userSigninReducer.js to store.js
import {compose, applyMiddleware, createStore, combineReducers } from 'redux'
import thunk from 'redux-thunk';
import { cartReducer } from './reducers/cartReducers';

import { productDetailsReducer, productListReducer } from './reducers/productReducers';
import { userSigninReducer } from './reducers/userReducers';

const initialState = {
    userSignin: {
        userInfo: localStorage.getItem('userInfo')? JSON.parse(localStorage.getItem('userInfo')) : null
    },
    cart: {
        cartItems: localStorage.getItem('cartItems')? JSON.parse(localStorage.getItem('cartItems')) : []
    },
};

const reducer = combineReducers({
    //introduce reducers to reducer store
    productList: productListReducer,
    productDetails: productDetailsReducer,
    cart: cartReducer,
    userSignin: userSigninReducer
})
//to show store in the console
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
//create store
const store = createStore(reducer, initialState, composeEnhancer(applyMiddleware(thunk)))

export default store


//update SigninScreen.js

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signin } from '../actions/userActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

function SigninScreen(props) {
    const [ email, setEmail ] = useState('');
    const[password, setPassword ] = useState('')

    const redirect = props.location.search? props.location.search.split('=')[1] : '/';

    //get access to userSignin from redux store
    const userSignin = useSelector((state) => state.userSignin);
    const { userInfo, loading, error } = userSignin;

    const dispatch = useDispatch()

    //function for submit handler
    const submitHandler = (e) =>{
        e.preventDefault();
        dispatch(signin(email, password))
    }

    useEffect(() =>{
        if(userInfo){
            props.history.push(redirect)
        }
    }, [props.history, redirect, userInfo])
    return (
        <div>
            <form className = "form" onSubmit = {submitHandler}>
                <div>
                    <h1>Sign In</h1>
                </div>
                { loading && <LoadingBox></LoadingBox> }
                { error && <MessageBox variant = "danger">{ error }</MessageBox> }
                <div>
                    <label htmlFor="email"> Email Address</label>
                    <input type = "email" id ="email" placeholder ="Enter email" required
                    onChange = { e => setEmail(e.target.value) }></input>
                </div>
                <div>
                    <label htmlFor="password"> Password</label>
                    <input type = "password" id ="password" placeholder ="Enter password" required
                    onChange = { e => setPassword(e.target.value) }></input>
                </div>
                <div>
                    <label />
                    <button className = "primary" type ="submit">Sign In</button>
                </div>
                <div>
                    <label />
                    <div>
                        New customer? {' '}
                        <Link to="/register">Create your account</Link>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default SigninScreen

//update app.js

import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import { signout } from './actions/userActions';
import CartScreen from './screens/CartScreen';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
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
