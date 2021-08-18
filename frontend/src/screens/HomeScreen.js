import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Product from '../components/Product';
import MessageBox from '../components/MessageBox';
import LoadingBox from '../components/LoadingBox';


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

export default HomeScreen
