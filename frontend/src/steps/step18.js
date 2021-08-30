// Create register screen and backend API

/* 
1. Create API for /api/users/register
2. insert new user to the database
3. return user info and token
4. create RegisterScreen
5. add fields
6. style fields
7. add screen to app.js
 */

//update userRouter.js in backend folder
import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import {generateToken} from '../utils/utils.js'

import data from '../data.js';
import User from '../models/userModel.js';

const userRouter = express.Router()
//wrapping this whole function inside express async handler will let us get error messages on the frontend
userRouter.get('/seed', expressAsyncHandler(async (req, res) => {
    //to remove all users before creating new ones
    //await User.remove({})
    const createdUsers = await User.insertMany(data.users);
    res.send({ createdUsers })

}));

// signin router
userRouter.post('/signin', expressAsyncHandler( async (req, res) =>{
    const user = await User.findOne({ email: req.body.email});
    if(user){
        if(bcrypt.compareSync(req.body.password, user.password)){
            res.send({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user)
            })
            return
        }
    }
    res.status(401).send({ message: 'Invalid email or password'})
}))

// router for user registration
userRouter.post('/register', expressAsyncHandler( async (req, res)=>{
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    })
    const createdUser = await user.save();
    res.send({
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        isAdmin: createdUser.isAdmin,
        token: generateToken(createdUser)
    })
    
}))

export default userRouter

//create RegisterScreen.js similar to SigninScreen

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../actions/userActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

function RegisterScreen(props) {
    const [ name, setName ] = useState('');
    const [ email, setEmail ] = useState('');
    const[password, setPassword ] = useState('')
    const[confirmPassword, setConfirmPassword ] = useState('')

    const redirect = props.location.search? props.location.search.split('=')[1] : '/';

    //get access to userSignin from redux store
    const userRegister = useSelector((state) => state.userRegister);
    const { userInfo, loading, error } = userRegister;

    const dispatch = useDispatch()

    //function for submit handler
    const submitHandler = (e) =>{
        e.preventDefault();
        if(password !== confirmPassword){
            alert("Password and confirmPassword does not match.")
        }
        else{
            dispatch(register(name, email, password))
        }
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
                    <h1>Create Account</h1>
                </div>
                { loading && <LoadingBox></LoadingBox> }
                { error && <MessageBox variant = "danger">{ error }</MessageBox> }
                <div>
                    <label htmlFor="name"> Name</label>
                    <input type = "text" id ="name" placeholder ="Enter name" required
                    onChange = { e => setName(e.target.value) }></input>
                </div>
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
                    <label htmlFor="confirmPassword"> Confirm Password</label>
                    <input type = "password" id ="comfirmPassword" placeholder ="Enter confirm password" required
                    onChange = { (e) => setConfirmPassword(e.target.value) }></input>
                </div>
                <div>
                    <label />
                    <button className = "primary" type ="submit">Register</button>
                </div>
                <div>
                    <label />
                    <div>
                        Already have an account? {' '}
                        <Link to={`/signin?redirect=${redirect}`}>Sign-In</Link>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default RegisterScreen



//update links in App.js

import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import { signout } from './actions/userActions';
import CartScreen from './screens/CartScreen';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import RegisterScreen from './screens/RegisterScreen';
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

//update userConstants.js 
//constants for register
export const USER_REGISTER_REQUEST = "USER_REGISTER_REQUEST";
export const USER_REGISTER_SUCCESS = "USER_REGISTER_SUCCESS";
export const USER_REGISTER_FAIL = "USER_REGISTER_FAIL";

//constants for signin
export const USER_SIGNIN_REQUEST = "USER_SIGNIN_REQUEST";
export const USER_SIGNIN_SUCCESS = "USER_SIGNIN_SUCCESS";
export const USER_SIGNIN_FAIL = "USER_SIGNIN_FAIL";

//constant for signout
export const USER_SIGNOUT = "USER_SIGNOUT";


//add register function in userActions.js
import { USER_REGISTER_FAIL, USER_REGISTER_REQUEST, USER_REGISTER_SUCCESS, USER_SIGNIN_FAIL, 
    USER_SIGNIN_REQUEST, 
    USER_SIGNIN_SUCCESS, 
    USER_SIGNOUT } from "../constants/userConstants"
import Axios from 'axios'

export const register = (name, email, password) => async(dispatch) => {
    dispatch({
        type: USER_REGISTER_REQUEST,
        payload: { email, password }
    });
    try {
        const { data } = await Axios.post('/api/users/register', {name, email, password});
        dispatch({
            type: USER_REGISTER_SUCCESS,
            payload: data
        })
        dispatch({
            type: USER_SIGNIN_SUCCESS,
            payload: data
        })
        localStorage.setItem("userInfo", JSON.stringify(data))
    } catch (error) {
        dispatch({
            type: USER_REGISTER_FAIL,
            payload: error.response && error.response.data.message?
            error.response.data.message : error.message
        })
        
    }
}

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

//add userRegisterReducer function to userReducers.js
import { USER_REGISTER_FAIL, 
    USER_REGISTER_REQUEST, 
    USER_REGISTER_SUCCESS, 
    USER_SIGNIN_FAIL, 
    USER_SIGNIN_REQUEST, 
    USER_SIGNIN_SUCCESS, 
    USER_SIGNOUT } from "../constants/userConstants";


    export const userRegisterReducer = (state = {}, action) => {
        switch(action.type){
            case USER_REGISTER_REQUEST:
                return { loading: true};
    
            case USER_REGISTER_SUCCESS:
                return { loading: false, userInfo: action.payload };
                
            case USER_REGISTER_FAIL: 
                return { loading: false, error: action.payload };
    
             default : 
             return state;   
        }
    }

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

// update store.js by adding userRegisterReducer
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
        cartItems: localStorage.getItem('cartItems')? JSON.parse(localStorage.getItem('cartItems')) : []
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

// add a className 'loading' to LoadingBox.js under components folder
import React from 'react'

function LoadingBox() {
    return (
        <div className="loading">
            <i className = "fa fa-spinner fa-spin"></i> Loading...
        </div>
    )
}

export default LoadingBox


//update redirect link in SigninScreen.js
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
                        <Link to={`/register?redirect=${redirect}`}>Create your account</Link>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default SigninScreen
