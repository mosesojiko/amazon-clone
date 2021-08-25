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