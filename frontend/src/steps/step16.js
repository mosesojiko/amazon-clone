//Design signin screen

/*
1. create SigninScreen
2. render email and password fields
3. create signin constants, actions, and reducers
4. update header based on user login 
 */

//SigninScreen.js design
import React, { useState } from 'react'
import {Link} from 'react-router-dom';

function SigninScreen() {
    const [ email, setEmail ] = useState('');
    const[password, setPassword ] = useState('')

    //function for submit handler
    const submitHandler = (e) =>{
        e.preventDefault();
        //TODO: for signin actions
    }
    return (
        <div>
            <form className = "form" onSubmit = {submitHandler}>
                <div>
                    <h1>Sign In</h1>
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

//modified app.js

import { useSelector } from 'react-redux';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import CartScreen from './screens/CartScreen';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import SigninScreen from './screens/SigninScreen';


function App() {
    //get access to cartItems from redux
    const cart = useSelector(state => state.cart);
    const { cartItems } = cart
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
            <Link to="/signin">Sign In</Link>
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
//style the signin screen
