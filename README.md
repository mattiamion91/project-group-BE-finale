# Project Group E-commerce Backend

This is the backend part of a full-stack e-commerce application for Italian agri-food products, with specialties from each region.

## Project Structure

- `/` - Backend Express application
  - `app.js` - Main entry point
  - `/routers` - API route definitions
  - `/controllers` - Request handlers
  - `/middlewares` - Custom middleware functions
  - `/data` - Database connection setup
  - `/public` - Static files (product images)

## Features

- RESTful API for:
  - Products
  - Regions
  - Checkout
  - Orders
  - Discounts
  - Shipping
  - Wishlist
- MySQL database integration using `mysql2`
- CORS enabled for frontend development
- Static file serving for product images
- Custom middleware for error handling, 404 routes, and image path processing
- Environment-based configuration

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PWD=your_db_password
   DB_NAME=your_database_name
   ```

3. Ensure MySQL is running and the specified database exists.

## Available Scripts

- `npm start` - Start the Express server in production mode
- `npm run watch` - Start the Express server with auto-reload on file changes (development)
- `npm test` - Placeholder for test script (currently outputs error message)

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update product by ID
- `DELETE /api/products/:id` - Delete product by ID

### Regions
- `GET /api/regions` - Get all regions
- `GET /api/regions/:id` - Get region by ID
- `POST /api/regions` - Create a new region
- `PUT /api/regions/:id` - Update region by ID
- `DELETE /api/regions/:id` - Delete region by ID

### Checkout
- `GET /api/checkout` - Get checkout information
- `POST /api/checkout` - Process checkout

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id` - Update order by ID
- `DELETE /api/orders/:id` - Delete order by ID

### Discounts
- `GET /api/discounts` - Get all discounts
- `GET /api/discounts/:id` - Get discount by ID
- `POST /api/discounts` - Create a new discount
- `PUT /api/discounts/:id` - Update discount by ID
- `DELETE /api/discounts/:id` - Delete discount by ID

### Shipping
- `GET /api/shipping` - Get shipping options
- `POST /api/shipping` - Calculate shipping costs

### Wishlist
- `GET /api/wishlist` - Get wishlist items
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist/:id` - Remove item from wishlist

## Middleware

- `cors` - Enables Cross-Origin Resource Sharing (configured for `http://localhost:5173`)
- `express.json()` - Parses JSON request bodies
- `express.static('public')` - Serves static files from the public directory
- `imagePath` - Custom middleware for processing image paths
- `notFound` - Handles 404 routes
- `errorsHandler` - Centralized error handling middleware

## Database Connection

The database connection is established in `data/db.js` using the `mysql2` package. Connection parameters are read from environment variables.

## Development

The backend is designed to work with a React frontend running on `http://localhost:5173` (default Vite port). The frontend should be located in a sibling `client` directory as per the project structure.

## License

ISC

## Author

Gruppo 1