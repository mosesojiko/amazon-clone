// Implement add to cart in product details

/*
 Handle add to cart button
 1. Handle Add to cart in ProductScreen.js
 2. Create CartScreen.js
*/

import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Rating from '../components/Rating'
import MessageBox from '../components/MessageBox'
import LoadingBox from '../components/LoadingBox'
import { detailsProduct } from '../actions/productActions'


function ProductScreen(props) {
    const dispatch = useDispatch()
    const productId = props.match.params.id;
    const [qty, setQty] = useState(1)
    // set product to read from product details in reducer store
    const productDetails = useSelector(state => state.productDetails)
    const { loading, error, product } = productDetails
    
    useEffect(() =>{
        dispatch(detailsProduct(productId))
    }, [dispatch, productId])

    //add to cart function, redirect user to cart screen
    const addToCartHandler = () =>{
        props.history.push(`/cart/${productId}?qty=${qty}`)
    }
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
                           {
                               product.countInStock > 0 && (
                                   <>
                                   <li>
                                      <div className="row">
                                          <div>Qty</div> 
                                          <div>
                                              <select value= {qty} onChange = {(e) => setQty(e.target.value)}>
                                                  {
                                                     
                                                      [...Array(product.countInStock).keys()].map((x) =>(
                                                          <option key={x + 1} value = {x + 1}>{x + 1}</option>
                                                      ))
                                                  }
                                              </select>
                                        </div> 
                                    </div>
                                   </li>
                                   <li>
                                <button onClick={addToCartHandler} className="primary block"> Add to Cart</button>
                                  </li>
                                   </>
                                

                               )
                           }
                           
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


//cart screen

function CartScreen(props) {
    const productId = props.match.params.id 
    //finding qty
    const qty = props.location.search? Number(props.location.search.split('=')[1]) : 1
    return (
        <div>
            <h1>Cart Screen</h1>
            <p>ADD TO CART : ProductID: { productId} Qty : {qty}</p>
        </div>
    )
}

export default CartScreen

//modify app.js

import { BrowserRouter, Route } from 'react-router-dom';
import CartScreen from './screens/CartScreen';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';


function App() {
  return (
    <BrowserRouter>
    <div className="grid-container">
    <header className="row">
        <div>
            <a className="brand" href="/">Amazon</a>
        </div>
        <div>
            <a href="/cart">Cart</a>
            <a href="/signin">Sign In</a>
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


