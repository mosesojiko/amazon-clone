//Load Products from backend

/* 
0. setting proxy in package.json file inside frontend folder, just after the name of the folder. redirects request to the backend
1. edit HomeScreen.js
2. define products, loading, and errors
3. create useEffect
4. define async fetchData and call it
5. install axios in frontend folder
6. get data from api/products
7. show them in the list
8. create loading component
9. create message box component
10. use them in homeScreen
*/


//modified homeScreen.js
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Product from '../components/Product';
import MessageBox from '../components/MessageBox';
import LoadingBox from '../components/LoadingBox';

//removed the exports to avoid conflict while importing modules directly
function HomeScreen() {
  //get products from backend
   const [products, setProducts] = useState([])
   //hook for loading, what happens when we wait for products to load
   const [ loading, setLoading ] = useState(false)
   const [ error, setError ] = useState(false)
   useEffect(()=>{
    // define a function to fetch data
    const fetchData = async () =>{
      try {
      setLoading(true)
      const { data } = await axios.get('/api/products');
      setLoading(false)
      setProducts(data)
      } catch (error) {
        setError(error.message);
        setLoading(false)
      }
    }
    fetchData()
   }, [])
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



//LoadingBox component
import React from 'react'

function LoadingBox() {
    return (
        <div>
            <i className = "fa fa-spinner fa-spin"></i> Loading...
        </div>
    )
}




//MessageBox component
import React from 'react'

function MessageBox(props) {
    return (
        <div className = {`alert alert-${props.variant || 'info'}`}>
            {props.children} {/* children shows the content of the MessageBox */}
        </div>
    )
}


