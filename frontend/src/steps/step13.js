// Connect to Mongodb

/* 
1. npm install mongoose in root foler not frontend
2. connect to mongodb
3. create config.js
4. npm install dotenv
5. export MONGODB_URL
6. create models/userModel.js
7. create userSchema and userModel
8. create models/productModel
9. create productSchema and productModel
10. create userRoute
11. Send sample data
 */

//userModel in models under backend
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String, required: true
    },
    email: {
        type: String, required: true, unique: true
    },
    password: {
        type: String, required: true
    },
    isAdmin: {
        type: Boolean, default: false, required: true
    },
    },
    {
        timestamps: true,
    }
    )

const User = mongoose.model('User', userSchema)
export default User

//userRouter in routers under backend
import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import data from '../data.js';
import User from '../models/userModel.js';

const userRouter = express.Router()
//wrapping this whole function inside express async handler will let us get error messages on the frontend
userRouter.get('/seed', expressAsyncHandler(async (req, res) => {
    //to remove all users before creating new ones
    //await User.remove({})
    const createdUsers = await User.insertMany(data.users);
    res.send({ createdUsers })

}))

export default userRouter

//modify data.js
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
            _id: '1',
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
            _id: '2',
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
            _id: '6',
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
            _id: '4',
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
            _id: '5',
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
            _id: '6',
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

//modify server.js
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