// Implement remove from cart action

/* 
1. create removeFromCart constants, actions and reducers
2. add reducer to store.js
3. use action in CartScreen.js
*/

//create remove form cart constant
export const CART_ADD_ITEM = 'CART_ADD_ITEM';
export const CART_REMOVE_ITEM = "CART_REMOVE_ITEM"

//create remove from cart action
import Axios from "axios"
import { CART_ADD_ITEM, CART_REMOVE_ITEM } from "../constants/cartConstants"

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

//remove from cart reducer
import { CART_ADD_ITEM, CART_REMOVE_ITEM } from "../constants/cartConstants";

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
            

        default:
            return state
    }
}

//modify CartScreen.js
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { addToCart, removeFromCart } from '../actions/cartActions';
import MessageBox from '../components/MessageBox';

function CartScreen(props) {
    const productId = props.match.params.id 
    //finding qty
    const qty = props.location.search? Number(props.location.search.split('=')[1]) : 1;

    //get cart from redux store
    const cart = useSelector(state => state.cart);
    const { cartItems } = cart;
    
     const dispatch = useDispatch()
    useEffect(() =>{
        if(productId){
            dispatch(addToCart(productId, qty))
        }

    }, [dispatch, productId, qty])

    //delete function
    const removeFromCartHandler = (id) => {
        //delete action
        dispatch(removeFromCart(id))
    }

    //proceed to checkout
    const checkoutHandler = () =>{
        props.history.push('/signin?redirect=shipping')
    }
    return (
        <div className = "row top">
            <div className ="col-2">
                <h1>Shopping Cart</h1>
                {
                    cartItems.length === 0? 
                    <MessageBox>Cart is empty. <Link to="/">Go Shopping</Link> </MessageBox>:
                    (
                        <ul>
                            {
                                cartItems.map((item) =>(
                                    <li key = { item.product }>
                                        <div className ="row">
                                            <div>
                                                <img src = { item.image } alt = { item.name } className="small"></img>
                                            </div>
                                            <div className ="min-30">
                                                <Link to = {`/product/${item.product}`}>{item.name}</Link>
                                            </div>
                                            <div>
                                                <select value = { item.qty } onChange = {e =>
                                                dispatch(addToCart(item.product, Number(e.target.value)))
                                                }>
                                                   
                                                 {
                                                     [...Array(item.countInStock).keys()].map((x) =>(
                                                         <option key={x + 1} value = {x + 1}>{x + 1}</option>
                                                     ))
                                                 }   
                                                </select>
                                            </div>
                                            <div>
                                                {item.price}
                                            </div>
                                            <div>
                                                <button type="button" onClick = {() => removeFromCartHandler(item.product)}>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            }
                        </ul>
                    )
                }
            </div>
            <div className = "col-1">
                <div className="card card-body">
                    <ul>
                        <li>
                            <h2>
                                Subtotal ({ cartItems.reduce((a, c)=> a + c.qty, 0)} items) :
                                ${ cartItems.reduce((a,c) => a + c.price * c.qty, 0)}
                            </h2>
                        </li>
                        <li>
                            <button type = "button" onClick = {checkoutHandler} className="primary block"
                            disabled = { cartItems.length === 0}>
                                Proceed to checkout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default CartScreen
