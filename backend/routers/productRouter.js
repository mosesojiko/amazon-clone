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