// Create Sign-in Backend
/* 
1. create /signin api
2. check email and password
3. generate token
4. install json web token
5. install dotenv
6. return token and data
7. test it using postman
*/

//Create signin route in userRouter
import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import {generateToken} from '../utils/utils.js'

import data from '../data.js';
import User from '../models/userModel.js';

const userRouter = express.Router()
//wrapping this whole function inside express async handler will let us get error messages on the frontend
userRouter.get('/seed', expressAsyncHandler(async (req, res) => {
    //to remove all users before creating new ones
    //await User.remove({})
    const createdUsers = await User.insertMany(data.users);
    res.send({ createdUsers })

}));

// signin router
userRouter.post('/signin', expressAsyncHandler( async (req, res) =>{
    const user = await User.findOne({ email: req.body.email});
    if(user){
        if(bcrypt.compareSync(req.body.password, user.password)){
            res.send({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user)
            })
            return
        }
    }
    res.status(401).send({ message: 'Invalid email or password'})
}))

export default userRouter

//create utils folfer in backend, and util.js file
import jwt from 'jsonwebtoken'

export const generateToken = (user) =>{
    return jwt.sign({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin}, 
        // eslint-disable-next-line no-undef
        process.env.JWT_SECRET || 'somethingsecret',
        {
            expiresIn: '30d',
        }
        )
}

//create .env file in root folder
JWT_SECRET=

//modify server.js, and test with postman
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import productRouter from './routers/productRouter.js';
import userRouter from './routers/userRouter.js';

dotenv.config();
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
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