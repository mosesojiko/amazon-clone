//extract a product component form our app.js
import React from 'react'

function Product(props) {
    const { product } = props
    return (
        <div key = { product._id } className="card">
                <a href={`/product/${product._id}`}>
                     {/* image size should be 680px by 830px */}
                <img className="medium" src = {product.image} alt ={product.name} />

                </a>
                <div className="card-body">
                <a href={`/product/${product._id}`}>
                        <h2>{ product.name }</h2>
                    </a>
                    <div className="rating">
                        <span><i className="fa fa-star"></i></span>
                        <span><i className="fa fa-star"></i></span>
                        <span><i className="fa fa-star"></i></span>
                        <span><i className="fa fa-star"></i></span>
                        <span><i className="fa fa-star"></i></span>
                    </div>
                    <div className="price">${product.price}</div>
                </div>
            </div>

    )
}

export default Product

//Also extract Rating.js from Product.js and modify it.
function Rating(props) {
    const { rating, numReviews } = props
    return (
        <div className="rating">
            {/* render rating conditionally
            <span><i className="fa fa-star"></i></span>
             */}
            <span><i className={ rating >= 1?"fa fa-star": rating >=0.5?"fa fa-star-half-o":"fa fa-star-o"}></i></span>
            <span><i className={ rating >= 2?"fa fa-star": rating >=1.5?"fa fa-star-half-o":"fa fa-star-o"}></i></span>
            <span><i className={ rating >= 3?"fa fa-star": rating >=2.5?"fa fa-star-half-o":"fa fa-star-o"}></i></span>
            <span><i className={ rating >= 4?"fa fa-star": rating >=3.5?"fa fa-star-half-o":"fa fa-star-o"}></i></span>
            <span><i className={ rating >= 5?"fa fa-star": rating >=4.5?"fa fa-star-half-o":"fa fa-star-o"}></i></span>
            <span> { numReviews + ' reviews' } </span>
        </div>
    )
}


