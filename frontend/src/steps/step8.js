//Add product screen to redux

/* 
1. Create product details constants, actions, and reducers
2. Add reducer to store.js
3. Use action in ProductScreen.js
4. Add /api/product/:id to backend api
*/


//product details constants
//declare three constants here
export const PRODUCT_LIST_REQUEST = 'PRODUCT_LIST_REQUEST';
export const PRODUCT_LIST_SUCCESS = 'PRODUCT_LIST_SUCCESS';
export const PRODUCT_LIST_FAIL = 'PRODUCT_LIST_FAIL';


//declare product details constants
export const PRODUCT_DETAILS_REQUEST = 'PRODUCT_DETAILS_REQUEST';
export const PRODUCT_DETAILS_SUCCESS = 'PRODUCT_DETAILS_SUCCESS';
export const PRODUCT_DETAILS_FAIL = 'PRODUCT_DETAILS_FAIL';

//product details actions
import Axios from "axios";
import { PRODUCT_DETAILS_FAIL, 
    PRODUCT_DETAILS_REQUEST, 
    PRODUCT_DETAILS_SUCCESS, 
    PRODUCT_LIST_FAIL, 
    PRODUCT_LIST_REQUEST, 
    PRODUCT_LIST_SUCCESS } from "../constants/productConstants"

//define actions for product list
export const listProducts = () => async (dispatch) =>{
    dispatch ({
        type: PRODUCT_LIST_REQUEST
    })
    //fetching data from backend
    try {;
        const { data } = await Axios.get('/api/products');
        dispatch({
            type: PRODUCT_LIST_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: PRODUCT_LIST_FAIL,
            payload: error.message
        })
    }
}


//get product by it's id from the backend and updates the redux store
export const detailsProduct = (productId) => async (dispatch) =>{
  dispatch({ type: PRODUCT_DETAILS_REQUEST, payload: productId })
  try {
      const { data } = await Axios.get(`/api/products/${productId}`);
      dispatch({ type: PRODUCT_DETAILS_SUCCESS, payload: data})
  } catch (error) {
      dispatch({ type: PRODUCT_DETAILS_FAIL,
        payload: error.response && error.response.data.message?
        error.response.data.message: error.message
    })
  }
}

//product details reducer 
import { PRODUCT_DETAILS_FAIL, 
    PRODUCT_DETAILS_REQUEST, 
    PRODUCT_DETAILS_SUCCESS, 
    PRODUCT_LIST_FAIL, 
    PRODUCT_LIST_REQUEST, 
    PRODUCT_LIST_SUCCESS } from "../constants/productConstants"

//define product list reducers
export const productListReducer = (state = {loading:true, products:[] }, action) =>{
    switch(action.type){
        case PRODUCT_LIST_REQUEST:
        return {loading: true};

        case PRODUCT_LIST_SUCCESS:
        return {loading: false, products: action.payload}

        case PRODUCT_LIST_FAIL:
        return {loading: false, error: action.payload}

        default:
        return state
    }
}

// product details reducer
export const productDetailsReducer = (state = {product: {}, loading: true }, action) => {
    switch(action.type) {
        case PRODUCT_DETAILS_REQUEST:
            return { loading: true}

        case PRODUCT_DETAILS_SUCCESS:
            return { loading: false, product: action.payload}

        case PRODUCT_DETAILS_FAIL:
            return { loading: false, error: action.payload }

        default:
            return state
    }
}


//add prodcut details reducer to store
import {compose, applyMiddleware, createStore, combineReducers } from 'redux'
import thunk from 'redux-thunk';

import { productDetailsReducer, productListReducer } from './reducers/productReducers';

const initialState = {};

const reducer = combineReducers({
    //introduce reducers to reducer store
    productList: productListReducer,
    productDetails: productDetailsReducer
})
//to show store in the console
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
//create store
const store = createStore(reducer, initialState, composeEnhancer(applyMiddleware(thunk)))

export default store

//modify ProdcutScreen.js to use actions 
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Rating from '../components/Rating'
import MessageBox from '../components/MessageBox'
import LoadingBox from '../components/LoadingBox'
import { detailsProduct } from '../actions/productActions'


function ProductScreen(props) {
    const dispatch = useDispatch()
    const productId = props.match.params.id;
    // set product to read from product details in reducer store
    const productDetails = useSelector(state => state.productDetails)
    const { loading, error, product } = productDetails
    
    useEffect(() =>{
        dispatch(detailsProduct(productId))
    }, [dispatch, productId])
    return (
        <div>
          {
          loading? 
          <LoadingBox></LoadingBox>
          :
          error? <MessageBox variant="danger">{error}</MessageBox>
          :
          <div>
            <Link to ="/">Back to result</Link>
           <div className = "row top">
               <div className = "col-2">
                   <img className = "large" src = { product.image } alt = {product.name} />
               </div>
               <div className = "col-1">
                   <ul>
                       <li>
                           <h1>{ product.name }</h1>
                       </li>
                       <li>
                           <Rating
                           rating = {product.rating}
                           numReviews = {product.numReviews}
                           ></Rating>
                       </li>
                       <li>
                           Price: ${product.price}
                       </li>
                       <li>
                           Description:
                           <p>{ product.description }</p>
                       </li>
                   </ul>
               </div>
               <div className = "col-1">
                   <div className = "card card-body">
                       <ul>
                           <li>
                               <div className ="row">
                                   <div>Price</div>
                                   <div className="price">${ product.price }</div>
                               </div>
                           </li>
                           <li>
                               <div className ="row">
                                   <div>Status</div>
                                   <div>
                                       { product.countInStock > 0? (<span className="success">In Stock</span>):
                                       (<span className="danger">Unavailable</span>)
                                       }</div>
                               </div>
                           </li>
                           <li>
                               <button className="primary block"> Add to Cart</button>
                           </li>
                       </ul>
                   </div>
               </div>
           </div>
        </div>
          
        }
        
        </div>
        
    )
}

export default ProductScreen


// add a product details route to server.js in backend folrder
import express from 'express';
import data from './data.js';

const app = express();

//api to get products details
app.get('/api/products/:id', (req, res) => {
    const product = data.products.find(x => x._id === req.params.id);
    if(product) {
        res.send(product)
    }else{
        res.status(404).send({ message: "Product not found" })
    }
})

//api to get all products
app.get('/api/products', (req, res) =>{
    res.send(data.products)
})

//test if server is running well
app.get('/', (req, res)=>{
    res.send("Server is ready");
})
const port = process.env.PORT || 4000
app.listen(port, ()=>{
    console.log(`Serve as http://localhost:${port}`)
})