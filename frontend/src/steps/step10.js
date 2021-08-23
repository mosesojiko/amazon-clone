// Implement Add To Cart Action in redux store

/*
1. Create addToCart constants, actions and reducers
2. add reducer to store.js
3. Use action in CartScreen.js
4. Render cartItems.length
*/

//create cartConstants.js
export const CART_ADD_ITEM = 'CART_ADD_ITEM'

//create cartActions.js
import Axios from "axios"
import { CART_ADD_ITEM } from "../constants/cartConstants"

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

//create cartReducers.js
import { CART_ADD_ITEM } from "../constants/cartConstants";

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
            

        default:
            return state
    }
}

//create cartScreen.js
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { addToCart } from '../actions/cartActions';

function CartScreen(props) {
    const productId = props.match.params.id 
    //finding qty
    const qty = props.location.search? Number(props.location.search.split('=')[1]) : 1;
    
     const dispatch = useDispatch()
    useEffect(() =>{
        if(productId){
            dispatch(addToCart(productId, qty))
        }

    }, [dispatch, productId, qty])
    return (
        <div>
            <h1>Cart Screen</h1>
            <p>ADD TO CART : ProductID: { productId} Qty : {qty}</p>
        </div>
    )
}

export default CartScreen

//add cartReducer to store.js
import {compose, applyMiddleware, createStore, combineReducers } from 'redux'
import thunk from 'redux-thunk';
import { cartReducer } from './reducers/cartReducers';

import { productDetailsReducer, productListReducer } from './reducers/productReducers';

const initialState = {
    cart: {
        cartItems: localStorage.getItem('cartItems')? JSON.parse(localStorage.getItem('cartItems')) : []
    },
};

const reducer = combineReducers({
    //introduce reducers to reducer store
    productList: productListReducer,
    productDetails: productDetailsReducer,
    cart: cartReducer
})
//to show store in the console
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
//create store
const store = createStore(reducer, initialState, composeEnhancer(applyMiddleware(thunk)))

export default store

//modify Product.js
import React from 'react'
import { Link } from 'react-router-dom';
import Rating from './Rating';


function Product(props) {
    const { product } = props
    return (
        <div key = { product._id } className="card">
                <Link to={`/product/${product._id}`}>
                     {/* image size should be 680px by 830px */}
                <img className="medium" src = {product.image} alt ={product.name} />

                </Link>
                <div className="card-body">
                <Link to={`/product/${product._id}`}>
                        <h2>{ product.name }</h2>
                    </Link>
                    <Rating 
                    rating = {product.rating} 
                    numReviews = {product.numReviews}>
                    </Rating>
                    <div className="price">${product.price}</div>
                </div>
            </div>

    )
}

export default Product


//modify App.js

import { useSelector } from 'react-redux';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import CartScreen from './screens/CartScreen';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';


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

