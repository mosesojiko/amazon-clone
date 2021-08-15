// Start building the backend
import express from 'express';

const app = express();

app.get('/', (req, res)=>{
    res.send("Server is ready");
})

app.listen(5000, ()=>{
    console.log("Serve as http://localhost:5000")
})

//copy data.js from frontend to backend
import express from 'express';
import data from './data.js';

const app = express();

app.get('/api/products', (req, res) =>{
    res.send(data.products)
})

app.get('/', (req, res)=>{
    res.send("Server is ready");
})
const port = process.env.PORT || 5000
app.listen(port, ()=>{
    console.log(`Serve as http://localhost:${port}`)
})