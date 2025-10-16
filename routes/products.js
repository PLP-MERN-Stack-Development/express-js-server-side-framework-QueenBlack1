const express = require('express');
const router = express.Router();
const { validateProduct } = require('../middleware/validation');

// In-memory data store (in production, use a database)
let products = [
  {
    id: 1,
    name: 'Laptop',
    price: 999.99,
    category: 'Electronics',
    description: 'High-performance laptop',
    inStock: true,
    createdAt: new Date('2023-01-15')
  },
  {
    id: 2,
    name: 'Smartphone',
    price: 699.99,
    category: 'Electronics',
    description: 'Latest smartphone model',
    inStock: true,
    createdAt: new Date('2023-02-20')
  },
  {
    id: 3,
    name: 'Desk Chair',
    price: 199.99,
    category: 'Furniture',
    description: 'Ergonomic office chair',
    inStock: false,
    createdAt: new Date('2023-03-10')
  }
];

let nextId = 4;

// GET /api/products - Get all products with filtering, pagination, and search
router.get('/', (req, res) => {
  try {
    let filteredProducts = [...products];
    
    // Search by name or description
    if (req.query.q) {
      const searchTerm = req.query.q.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm))
      );
    }
    
    // Filter by category
    if (req.query.category) {
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase() === req.query.category.toLowerCase()
      );
    }
    
    // Filter by inStock
    if (req.query.inStock) {
      const inStock = req.query.inStock === 'true';
      filteredProducts = filteredProducts.filter(product => product.inStock === inStock);
    }
    
    // Filter by price range
    if (req.query.minPrice) {
      const minPrice = parseFloat(req.query.minPrice);
      filteredProducts = filteredProducts.filter(product => product.price >= minPrice);
    }
    
    if (req.query.maxPrice) {
      const maxPrice = parseFloat(req.query.maxPrice);
      filteredProducts = filteredProducts.filter(product => product.price <= maxPrice);
    }
    
    // Sorting
    if (req.query.sort) {
      const sortField = req.query.sort;
      const sortOrder = req.query.order === 'desc' ? -1 : 1;
      
      filteredProducts.sort((a, b) => {
        if (a[sortField] < b[sortField]) return -1 * sortOrder;
        if (a[sortField] > b[sortField]) return 1 * sortOrder;
        return 0;
      });
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit)
      },
      filters: {
        search: req.query.q || null,
        category: req.query.category || null,
        inStock: req.query.inStock || null,
        minPrice: req.query.minPrice || null,
        maxPrice: req.query.maxPrice || null
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id - Get a specific product
router.get('/:id', (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/products - Create a new product
router.post('/', validateProduct, (req, res, next) => {
  try {
    const { name, price, category, description, inStock } = req.body;
    
    const newProduct = {
      id: nextId++,
      name,
      price,
      category,
      description: description || '',
      inStock: inStock !== undefined ? inStock : true,
      createdAt: new Date()
    };
    
    products.push(newProduct);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
    
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id - Update a product
router.put('/:id', validateProduct, (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const { name, price, category, description, inStock } = req.body;
    
    products[productIndex] = {
      ...products[productIndex],
      name,
      price,
      category,
      description: description || products[productIndex].description,
      inStock: inStock !== undefined ? inStock : products[productIndex].inStock,
      updatedAt: new Date()
    };
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: products[productIndex]
    });
    
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const deletedProduct = products.splice(productIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: deletedProduct
    });
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;