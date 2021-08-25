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