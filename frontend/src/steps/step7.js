//Using Redux to manage the state of our app
// Add redux to homeScreen

/* 
1. npm install redux react-redux
2. Create store.js
npm install redux-thunk //makes it possible to send ejs request
3. initState = { products: [] } //install redux dev tools extension to view your store in the console
create constants folder in src folder, productConstants.js
create actions folder in src folder, productActions.js
create reducers folder in src folder, productReducers.js
4. reducer = (state, action) =>switch LOAD_PTODUCTS: { products: action.payload }
5. export default createStore(reducer, initState)
6. Edit homeScreen.js
7. shopName = useSelector(state=>state.products)
8. const dispatch = useDispatch()
9. useEffect(()=>dispatch({type: LOAD_PRODUCTS, payload: data}))
10. Add store to index.js
*/

//basic store.js to use redux
import { createStore } from 'redux'
import data from "./data";

const initialState = {};

const reducer = (state, action) => {
    return { products: data.products };
}

const store = createStore(reducer, initialState)

export default store

//edit index.js
// import React from 'react';
// import ReactDOM from 'react-dom';
// import { Provider } from 'react-redux';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';
// import store from './store';

ReactDOM.render(
  <Provider store = { store }>
      <React.StrictMode>
    <App />
  </React.StrictMode>,
  </Provider>,
  
  document.getElementById('root')
);

//final store
import {compose, applyMiddleware, createStore, combineReducers } from 'redux'
import thunk from 'redux-thunk';

import { productListReducer } from './reducers/productReducers';

const initialState = {};

const reducer = combineReducers({
    //introduce reducers to reducer store
    productList: productListReducer,
})
//to show store in the console
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
//create store
const store = createStore(reducer, initialState, composeEnhancer(applyMiddleware(thunk)))

export default store

//product constants
//declare three constants here
export const PRODUCT_LIST_REQUEST = 'PRODUCT_LIST_REQUEST';
export const PRODUCT_LIST_SUCCESS = 'PRODUCT_LIST_SUCCESS';
export const PRODUCT_LIST_FAIL = 'PRODUCT_LIST_FAIL';

//product actions
import Axios from "axios"
import { PRODUCT_LIST_FAIL, PRODUCT_LIST_REQUEST, PRODUCT_LIST_SUCCESS } from "../constants/productConstants"

//define actions
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

//product reducers
import { PRODUCT_LIST_FAIL, PRODUCT_LIST_REQUEST, PRODUCT_LIST_SUCCESS } from "../constants/productConstants"

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

//edited homeScreen

import React, {  useEffect } from 'react'

import Product from '../components/Product';
import MessageBox from '../components/MessageBox';
import LoadingBox from '../components/LoadingBox';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../actions/productActions';


function HomeScreen() {
 const dispatch = useDispatch();
  const productList = useSelector(state => state.productList)
  const { loading, error, products } = productList
   useEffect(()=>{
      dispatch(listProducts())
   }, [dispatch] )
    return (
        <div>
          {
          loading? 
          <LoadingBox></LoadingBox>
          :
          error? <MessageBox variant="danger">{error}</MessageBox>
          :
          <div className="row center">
          {
            products.map(product =>(
              <Product key = {product._id} product = {product}></Product>
            ))
          }
      </div>
        }
        
        </div>
    )
}

export default HomeScreen
