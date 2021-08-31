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

// function to authenticate user that created an order
export const isAuth = (req, res, next) =>{
    const authorization = req.headers.authorization;
    if(authorization) {
        const token = authorization.slice(7, authorization.length) //Bearer xxxxx => xxxxx i.e slcice start from x
        //use jwt to dcrypt the token
        // eslint-disable-next-line no-undef
        jwt.verify(token, process.env.JWT_SECRET || 'somethingsecret', (err, decode) =>{
            if(err) {
                res.status(401).send({message: "Invalid Token"})
            }else{
                req.user = decode; //info about the user
                next()
            }
        })
    }else{
        res.status(401).send({message: "No Token"})
    }
}