# Product API Test Suite

This test suite validates the functionality of our Product Management API.

## Prerequisites

- Node.js and npm installed
- MongoDB running
- Server running on port 3056

## Test Features

The test suite covers:

1. **Product Creation**
   - Creating products of different types (Clothing, Electronic, Furniture)
   - Validating required fields for each product type

2. **Product Retrieval**
   - Getting product details by ID
   - Listing all draft products
   - Listing all published products

3. **Product Management**
   - Updating product information
   - Publishing/unpublishing products
   - Deleting products

4. **Search Functionality**
   - Searching for products by keywords

## Running the Tests

1. Make sure the server is running:
   ```
   npm start
   ```

2. In another terminal, run the tests:
   ```
   npm test
   ```

## Configuration

- Update the API_KEY, AUTH_TOKEN, and CLIENT_ID constants in the test file with valid values for your environment.
- The tests assume the API is running at http://localhost:3056/v1/api.

## Troubleshooting

If tests fail with connection errors, make sure:
1. The server is running on port 3056
2. MongoDB is running and accessible
3. The API key, client ID, and auth token are valid

## Notes

The tests run sequentially and depend on the results of previous tests. For example, product IDs created in the first tests are used in later tests.
