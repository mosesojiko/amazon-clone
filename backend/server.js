import express from 'express';
import mongoose from 'mongoose';
import data from './data.js';
import userRouter from './routers/userRouter.js';


const app = express();
// eslint-disable-next-line no-undef
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/amazona',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

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

app.use('/api/users', userRouter)
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