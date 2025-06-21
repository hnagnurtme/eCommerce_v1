const axios = require('axios');
const { expect } = require('chai');
const mongoose = require('mongoose');
const { database } = require('../src/configs/config.mongodb');

// Test configuration
const API_URL = 'http://localhost:3056/v1/api';
const API_KEY = 'f0418c2e0a4372a604776450b131062b04f046f00e39a2f44e894c3f730c309e'; // Replace with your API key
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODUwMDI4MmM5MDNlZGM3NDFlMjA2OGMiLCJlbWFpbCI6InRydW5nYW5oMTRAZ21haWwuY29tIiwiaWF0IjoxNzUwNTAxMTIxLCJleHAiOjE3NTA2NzM5MjF9.5wPt9n61nOUoIv45sksdOmoOKcUxOwGalcQQhiygZzs'
const CLIENT_ID = '68500282c903edc741e2068c';
// Add authentication headers for protected routes
const authApiRequest = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    'x-client-id': CLIENT_ID,
    'authorization': AUTH_TOKEN
  }
});

describe('Discount API Tests', function() {
  this.timeout(10000); // Increase timeout for slower test environments
  
  // Test data
  // Important: These field names need to match what the controller expects, not the internal model fields
  const discountData = {
    name: "Summer Sale",
    description: "Summer discount for all products",
    type: "percentage", // or "fixed_amount" - case sensitive
    value: 10, // 10% off
    code: "SUMMER10",
    start_date: new Date(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    max_uses: 100,
    uses_count: [], // Add this as it seems to be expected
    max_uses_per_user: 1,
    min_order_value: 50,
    applies_to: "all", // or "specific"
    product_ids: [] // Only required if applies_to is "specific"
  };

  let createdDiscountCode;

  // Test: Create Discount
  describe('Discount Creation', () => {
    it('should create a discount code', async () => {
      try {
        const response = await authApiRequest.post('/discount', discountData);
        
        expect(response.status).to.equal(201);
        expect(response.data.statusCode).to.equal(201);
        expect(response.data.message).to.equal('Discount code created successfully');
        expect(response.data.metadata).to.have.property('_id');
        expect(response.data.metadata.discount_code).to.equal(discountData.code);
        
        createdDiscountCode = response.data.metadata.discount_code;
      } catch (error) {
        console.error('Error response:', error.response?.data || error.message);
        throw error;
      }
    });
  });

  // Test: Get All Discount Codes
  describe('Get All Discount Codes', () => {
    it('should get all discount codes for the shop', async () => {
      const response = await authApiRequest.get('/discount');
      
      expect(response.status).to.equal(200);
      expect(response.data.statusCode).to.equal(200);
      expect(response.data.message).to.equal('Get discount codes successfully');
      expect(response.data.metadata).to.be.an('array');
      expect(response.data.metadata.length).to.be.at.least(1);
    });
  });

  // Test: Get Discount by Code
  describe('Get Discount by Code', () => {
    it('should get discount information and applicable products', async () => {
      const response = await authApiRequest.get(`/discount/product/${createdDiscountCode}/${CLIENT_ID}`);
      
      expect(response.status).to.equal(200);
      expect(response.data.statusCode).to.equal(200);
      expect(response.data.message).to.equal('Get discount by code successfully');
      expect(response.data.metadata).to.have.property('discount');
      expect(response.data.metadata).to.have.property('products');
      expect(response.data.metadata.discount.discount_code).to.equal(createdDiscountCode);
    });
  });

  // Test: Get Discount Amount
  describe('Get Discount Amount', () => {
    it('should calculate the discount amount for products', async () => {
      // Create a sample product first
      const productData = {
        product_name: "Test Product for Discount",
        product_thumb: "https://example.com/test.jpg",
        product_description: "A test product",
        product_price: 100,
        product_quantity: 10,
        product_type: "Clothing",
        product_attributes: {
          brand: "Test Brand",
          size: "M",
          material: "Cotton"
        }
      };
      
      const productResponse = await authApiRequest.post('/product', productData);
      const productId = productResponse.data.metadata._id;
      
      // Calculate discount
      const discountRequest = {
        code: createdDiscountCode,
        shopId: CLIENT_ID,
        products: [
          {
            productId: productId,
            quantity: 1,
            price: 100
          }
        ]
      };
      
      const response = await authApiRequest.post('/discount/amount', discountRequest);
      
      expect(response.status).to.equal(200);
      expect(response.data.statusCode).to.equal(200);
      expect(response.data.message).to.equal('Get discount amount successfully');
      expect(response.data.metadata).to.have.property('totalOrderValue');
      expect(response.data.metadata).to.have.property('discount');
      expect(response.data.metadata).to.have.property('totalPrice');
      expect(response.data.metadata.totalOrderValue).to.equal(100);
      
      // Clean up - delete the test product
      await authApiRequest.delete(`/product/${productId}`);
    });
  });

  // Test: Delete Discount
  describe('Delete Discount', () => {
    it('should delete a discount code', async () => {
      const response = await authApiRequest.delete(`/discount/${createdDiscountCode}`);
      
      expect(response.status).to.equal(200);
      expect(response.data.statusCode).to.equal(200);
      expect(response.data.message).to.equal('Delete discount code successfully');
      expect(response.data.metadata.discount_code).to.equal(createdDiscountCode);
    });
  });
});
