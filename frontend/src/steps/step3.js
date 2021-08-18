// Build product detail screen which include the product, product detail, and the action part to add the product t cart.
// So we build two screens, the homescreen and the details screen
// Use react-router-dom to create routes
//install react-router-dom
// Wrap everything in App.js inside BrowserRouter

import data from './data'
import Product from './components/Product';
import { BrowserRouter } from 'react-router-dom';
function App() {
  return (
    <BrowserRouter>
    <div className="grid-container">
    <header className="row">
        <div>
            <a className="brand" href="/">Amazon</a>
        </div>
        <div>
            <a href="/cart">Cart</a>
            <a href="/signin">Sign In</a>
        </div>
    </header>
    <main>
    <Route path = '/product/:id' component = {ProductScreen} ></Route>
      <Route path = '/' component = {HomeScreen} exact></Route>
        <div className="row center">
          {
            data.products.map(product =>(
              <Product key = {product._id} product = {product}></Product>
            ))
          }
      </div>
            
    </main>
    <footer className="row center">
        All right reserved
    </footer>
</div>
    </BrowserRouter>
   );
}

export default App;

// Move the content of div inside App.js > main, and pasteinside HomeScreen
function HomeScreen() {
  return (
      <div className="row center">
        {
          data.products.map(product =>(
            <Product key = {product._id} product = {product}></Product>
          ))
        }
    </div>
  )
}

export default HomeScreen

//implement ProductScreen
function ProductScreen(props) {
  // set product to read from data.js
  const product = data.products.find(x => x._id === props.match.params.id)
  if(!product){
      return <div>Product not found</div>
  }
  return (
      <div>
          <Link to ="/">Back to result</Link>
         <div className = "row top">
             <div className = "col-2">
                 <img className = "large" src = { product.image } alt = {product.name} />
             </div>
             <div className = "col-1">
                 <ul>
                     <li>
                         <h1>{ product.name }</h1>
                     </li>
                     <li>
                         <Rating
                         rating = {product.rating}
                         numReviews = {product.numReviews}
                         ></Rating>
                     </li>
                     <li>
                         Price: ${product.price}
                     </li>
                     <li>
                         Description:
                         <p>{ product.description }</p>
                     </li>
                 </ul>
             </div>
             <div className = "col-1">
                 <div className = "card card-body">
                     <ul>
                         <li>
                             <div className ="row">
                                 <div>Price</div>
                                 <div className="price">${ product.price }</div>
                             </div>
                         </li>
                         <li>
                             <div className ="row">
                                 <div>Status</div>
                                 <div>
                                     { product.countInStock > 0? (<span className="success">In Stock</span>):
                                     (<span className="error">Unavailable</span>)
                                     }</div>
                             </div>
                         </li>
                         <li>
                             <button className="primary block"> Add to Cart</button>
                         </li>
                     </ul>
                 </div>
             </div>
         </div>
      </div>
  )
}

