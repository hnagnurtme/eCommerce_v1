# Product Management API

This is a Node.js/Express API for product management using MongoDB.

## Features

- Product CRUD operations (Create, Read, Update, Delete)
- Product publishing/unpublishing
- Product search
- Authentication with JWT
- API key validation

## Running the Application

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

The server will run on port 3056 by default.

## Running Tests

Make sure the server is running in a separate terminal window, then run:

```
npm test
```

This will execute all the tests in the `test` directory.

## API Endpoints

### Public Endpoints

- `GET /v1/api/product` - Get all published products
- `GET /v1/api/product/search/:keySearch` - Search for products

### Protected Endpoints (require authentication)

- `POST /v1/api/product` - Create a new product
- `GET /v1/api/product/:id` - Get a product by ID
- `PATCH /v1/api/product/:id` - Update a product
- `DELETE /v1/api/product/:id` - Delete a product
- `POST /v1/api/product/publish/:id` - Publish a product
- `POST /v1/api/product/unpublish/:id` - Unpublish a product
- `GET /v1/api/product/draft/all` - Get all draft products
- `GET /v1/api/product/publish/all` - Get all published products

## Authentication

All protected endpoints require the following headers:
- `x-api-key`: Your API key
- `x-client-id`: Your client ID
- `authorization`: JWT token

## Product Types

The API supports three types of products:

1. **Clothing**
   - Required attributes: brand, size, material

2. **Electronic**
   - Required attributes: manufacturer, model, color

3. **Furniture**
   - Required attributes: brand, material, size
