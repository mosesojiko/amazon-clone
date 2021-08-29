// Create sample products in mongodb

/*
1. create models/productModel.js
2. create productSchema and productModel
3. create productRoute
4. Seed sample data 
 */

//product model in models folder under backend
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    image: {type: String, required: true},
    brand: {type: String, required: true},
    category: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    countInStock: {type: Number, required: true},
    rating: {type: Number, required: true},
    numReviews: {type: Number, required: true},
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;

//product router in router folder
import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import data from '../data.js';
const productRouter = express.Router();

//get all products
productRouter.get('/', expressAsyncHandler(async (req, res) =>{
    const products = await Product.find({});
    res.json(products)
}))

//create product
productRouter.get('/seed', expressAsyncHandler(async(req, res)=>{
    await Product.remove({})
  const createdProducts = await Product.insertMany(data.products);
  res.json({ createdProducts })
}))

//get product details
productRouter.get('/:id', expressAsyncHandler( async(req, res) =>{
    const product = await Product.findById(req.params.id);
    if(product){
        console.log(product)
        res.json(product)
    }else{
        res.status(404).send({ message: "Product not found."})
    }
}))


export default productRouter

//modified server.js
import express from 'express';
import mongoose from 'mongoose';

import productRouter from './routers/productRouter.js';
import userRouter from './routers/userRouter.js';


const app = express();
// eslint-disable-next-line no-undef
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/amazona',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/api/users', userRouter)
app.use('/api/products', productRouter)
//test if server is running well
app.get('/', (req, res)=>{
    res.send("Server is ready");
})

//to show errors
app.use((err, req, res, next) =>{
    res.status(500).send({ message: err.message })
    next()
})
// eslint-disable-next-line no-undef
const port = process.env.PORT || 4000
app.listen(port, ()=>{
    console.log(`Serve as http://localhost:${port}`)
})

//modified data.js

import bcrypt from 'bcryptjs';
const data = {
    users: [
        {
            name: 'Moses',
            email: 'moses@gmail.com',
            password: bcrypt.hashSync('1234', 8),
            isAdmin: true
        },
        {
            name: 'Ojiko',
            email: 'ojiko@gmail.com',
            password: bcrypt.hashSync('1234', 8),
            isAdmin: false
        }
    ],
    products: [
        {
            
            name: "Native Atire",
            category: "Shirts",
            image: '/images/product-1.jpg',
            price: 120,
            countInStock: 10,
            brand: "Nike",
            rating: 1.5,
            numReviews: 10,
            description: "High quality product."
        },
        {
            
            name: "Native Atire 2",
            category: "Shirts",
            image: '/images/product-2.jpg',
            price: 200,
            countInStock: 20,
            brand: "Nike 2",
            rating: 2.0,
            numReviews: 8,
            description: "High quality product."
        },
        {
            
            name: "Native Atire 3",
            category: "Shirts",
            image: '/images/product-6.jpg',
            price: 150,
            countInStock: 0,
            brand: "Nike",
            rating: 4.8,
            numReviews: 11,
            description: "High quality product."
        },
        {
            
            name: "Native Atire 4",
            category: "Shirts",
            image: '/images/product-4.jpg',
            price: 300,
            countInStock: 15,
            brand: "Nike",
            rating: 4.9,
            numReviews: 27,
            description: "High quality product."
        },
        {
         
            name: "Native Atire 5",
            category: "Shirts",
            image: '/images/product-5.jpg',
            price: 240,
            countInStock: 5,
            brand: "Nike",
            rating: 5.0,
            numReviews: 34,
            description: "High quality product."
        },
        {

            name: "Native Atire 6",
            category: "Shirts",
            image: '/images/product-6.jpg',
            price: 150,
            countInStock: 12,
            brand: "Nike",
            rating: 4.5,
            numReviews: 7,
            description: "High quality product."
        },
    ]
}

export default data;

//modified home screen
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
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [listProducts] )
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

//modified productScreen.js
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


//product actions
import Axios from "axios"
import { PRODUCT_DETAILS_FAIL, 
    PRODUCT_DETAILS_REQUEST, 
    PRODUCT_DETAILS_SUCCESS, 
    PRODUCT_LIST_FAIL, 
    PRODUCT_LIST_REQUEST, 
    PRODUCT_LIST_SUCCESS } from "../constants/productConstants"

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