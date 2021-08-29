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