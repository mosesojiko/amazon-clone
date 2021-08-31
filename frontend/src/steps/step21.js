// Design place order screen

/*
1. design order summary fields
2. design order action
 */

//create PlaceOrderScreen.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom'

import CheckoutSteps from '../components/CheckoutSteps'

function PlaceOrderScreen(props) {
    //get cart from redux store
    const cart = useSelector((state) => state.cart)
    //check if user entered payment method, if not redirect the user to payment method
    if(!cart.paymentMethod) {
        props.history.push('/payment')
    }
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
    const placeOrderHandler = () => {
        //TODO: dispatch place order action
    }
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
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlaceOrderScreen



// modify App.js to add a route for placeorder pointing to PlaceOrderScreen component

import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import { signout } from './actions/userActions';
import CartScreen from './screens/CartScreen';
import HomeScreen from './screens/HomeScreen';
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
