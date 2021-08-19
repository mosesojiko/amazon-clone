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
// eslint-disable-next-line no-undef
const port = process.env.PORT || 4000
app.listen(port, ()=>{
    console.log(`Serve as http://localhost:${port}`)
})