const axios = require('axios');
const { expect } = require('chai');
const mongoose = require('mongoose');
const { database } = require('../src/configs/config.mongodb');

// Test configuration
const API_URL = 'http://localhost:3056/v1/api';
const API_KEY = 'f0418c2e0a4372a604776450b131062b04f046f00e39a2f44e894c3f730c309e'; // Replace with your API key
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODUwMDI4MmM5MDNlZGM3NDFlMjA2OGMiLCJlbWFpbCI6InRydW5nYW5oMTRAZ21haWwuY29tIiwiaWF0IjoxNzUwNDk3NzM3LCJleHAiOjE3NTA2NzA1Mzd9.b7PJzSKXaksO56aJbuYW1E4BgQ6kS-9WixJyClMmZTA'; // Replace with a valid token
const CLIENT_ID = '68500282c903edc741e2068c'; // Replace with your client ID

// Test data
const productSamples = {
  clothing: {
    product_name: "Test Clothing Product",
    product_thumb: "https://example.com/clothing.jpg",
    product_description: "A test clothing product",
    product_price: 199,
    product_quantity: 50,
    product_type: "Clothing",
    product_attributes: {
      brand: "Test Brand",
      size: "M",
      material: "Cotton"
    }
  },
  electronic: {
    product_name: "Test Electronic Product",
    product_thumb: "https://example.com/electronic.jpg",
    product_description: "A test electronic product",
    product_price: 999,
    product_quantity: 20,
    product_type: "Electronic",
    product_attributes: {
      manufacturer: "Test Manufacturer",
      model: "Test Model",
      color: "Black"
    }
  },
  furniture: {
    product_name: "Test Furniture Product",
    product_thumb: "https://example.com/furniture.jpg",
    product_description: "A test furniture product",
    product_price: 599,
    product_quantity: 10,
    product_type: "Furniture",
    product_attributes: {
      brand: "Test Furniture Brand",
      material: "Wood",
      size: "200x100x75 cm"
    }
  }
};

// Helper for making API requests
const apiRequest = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  }
});

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

describe('Product API Tests', function() {
  this.timeout(10000); // Increase timeout for slower test environments
  
  // Store created product IDs for later tests
  const createdProducts = {
    clothing: null,
    electronic: null,
    furniture: null
  };

  // Test: Create Products
  describe('Product Creation', () => {
    it('should create a Clothing product', async () => {
      const response = await authApiRequest.post('/product', productSamples.clothing);
      
      expect(response.status).to.equal(200);
      expect(response.data.statusCode).to.equal(200);
      expect(response.data.message).to.equal('Create product successfully');
      expect(response.data.metadata).to.have.property('_id');
      expect(response.data.metadata.product_type).to.equal('Clothing');
      expect(response.data.metadata.isDraft).to.equal(true);
      expect(response.data.metadata.isPublished).to.equal(false);
      
      createdProducts.clothing = response.data.metadata._id;
    });

    it('should create an Electronic product', async () => {
      const response = await authApiRequest.post('/product', productSamples.electronic);
      
      expect(response.status).to.equal(200);
      expect(response.data.statusCode).to.equal(200);
      expect(response.data.message).to.equal('Create product successfully');
      expect(response.data.metadata).to.have.property('_id');
      expect(response.data.metadata.product_type).to.equal('Electronic');
      
      createdProducts.electronic = response.data.metadata._id;
    });

    it('should create a Furniture product', async () => {
      const response = await authApiRequest.post('/product', productSamples.furniture);
      
      expect(response.status).to.equal(200);
      expect(response.data.statusCode).to.equal(200);
      expect(response.data.message).to.equal('Create product successfully');
      expect(response.data.metadata).to.have.property('_id');
      expect(response.data.metadata.product_type).to.equal('Furniture');
      
      createdProducts.furniture = response.data.metadata._id;
    });

    it('should fail to create a Furniture product without brand', async () => {
      const invalidFurniture = {
        ...productSamples.furniture,
        product_attributes: {
          material: "Wood",
          size: "200x100x75 cm"
          // Missing brand
        }
      };

      try {
        await authApiRequest.post('/product', invalidFurniture);
        // If we reach here, the test should fail
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).to.equal(404);
        expect(error.response.data).to.have.property('message');
        expect(error.response.data.message).to.equal('Thiếu thông tin thương hiệu hoặc chất liệu cho nội thất');
      }
    });
  });

  // Test: Get Product Details
  describe('Get Product Details', () => {
    it('should get Clothing product details', async () => {
      const response = await authApiRequest.get(`/product/${createdProducts.clothing}`);
      
      expect(response.status).to.equal(200);
      expect(response.data.statusCode).to.equal(200);
      expect(response.data.message).to.equal('Get product detail successfully');
      expect(response.data.metadata._id).to.equal(createdProducts.clothing);
      expect(response.data.metadata.product_type).to.equal('Clothing');
    });
  });

  // Test: Update Products
  describe('Update Products', () => {
    it('should update a Clothing product', async () => {
      const updateData = {
        product_name: "Updated Clothing Product",
        product_price: 249,
        product_quantity: 60,
        product_type: "Clothing",
        product_attributes: {
          brand: "Updated Brand",
          size: "L",
          material: "Premium Cotton"
        }
      };

      const response = await authApiRequest.patch(`/product/${createdProducts.clothing}`, updateData);
      
      expect(response.status).to.equal(200);
      expect(response.data.statusCode).to.equal(200);
      expect(response.data.message).to.equal('Update product successfully');
      expect(response.data.metadata.product_name).to.equal("Updated Clothing Product");
      expect(response.data.metadata.product_price).to.equal(249);
    });
  });

  // Test: Publish/Unpublish Products
  describe('Publish/Unpublish Products', () => {
    it('should publish a product', async () => {
      const response = await authApiRequest.post(`/product/publish/${createdProducts.clothing}`);
      
      expect(response.status).to.equal(200);
      expect(response.data.statusCode).to.equal(200);
      expect(response.data.message).to.equal('Publish product successfully');
      expect(response.data.metadata.isDraft).to.equal(false);
      expect(response.data.metadata.isPublished).to.equal(true);
    });

    it('should unpublish a product', async () => {
      const response = await authApiRequest.post(`/product/unpublish/${createdProducts.clothing}`);
      
      expect(response.status).to.equal(200);
      expect(response.data.statusCode).to.equal(200);
      expect(response.data.message).to.equal('Unpublish product successfully');
      expect(response.data.metadata.isDraft).to.equal(true);
      expect(response.data.metadata.isPublished).to.equal(false);
    });
  });

  // Test: List Products
  describe('List Products', () => {
    it('should list all draft products', async () => {
      const response = await authApiRequest.get('/product/draft/all');
      
      expect(response.status).to.equal(200);
      expect(response.data.statusCode).to.equal(200);
      expect(response.data.message).to.equal('Fetch all draft product successfully');
      expect(response.data.metadata).to.be.an('array');
    });

    it('should list all published products', async () => {
      // First publish a product
      await authApiRequest.post(`/product/publish/${createdProducts.electronic}`);
      
      const response = await authApiRequest.get('/product/publish/all');
      
      expect(response.status).to.equal(200);
      expect(response.data.statusCode).to.equal(200);
      expect(response.data.message).to.equal('Fetch all publish product successfully');
      expect(response.data.metadata).to.be.an('array');
    });
  });

  // Test: Search Products
  describe('Search Products', () => {
    it('should search for products', async () => {
      // Note: Search functionality may need to be improved in the API
      const response = await apiRequest.get('/product');
      
      expect(response.status).to.equal(200);
      expect(response.data.statusCode).to.equal(200);
      expect(response.data.message).to.equal('Search product successfully');
      expect(response.data.metadata).to.be.an('array');
    });
  });

  // Test: Delete Products
  describe('Delete Products', () => {
    it('should delete products', async () => {
      // Delete all created products
      for (const type in createdProducts) {
        if (createdProducts[type]) {
          const response = await authApiRequest.delete(`/product/${createdProducts[type]}`);
          
          expect(response.status).to.equal(200);
          expect(response.data.statusCode).to.equal(200);
          expect(response.data.message).to.equal('Delete product successfully');
          expect(response.data.metadata).to.have.property('_id');
        }
      }
    });
  });
});