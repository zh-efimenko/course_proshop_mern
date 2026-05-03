import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import { isFeatureEnabled, parseBucketHeader } from '../utils/featureFlag.js'
import Product from '../models/productModel.js'

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 10
  const page = Number(req.query.pageNumber) || 1

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {}

  const count = await Product.countDocuments({ ...keyword })
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1))

  res.json({ products, page, pages: Math.ceil(count / pageSize) })
})

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (product) {
    const productData = product.toObject()
    productData.reviews = productData.reviews.filter(
      (r) => r.status === 'approved'
    )
    res.json(productData)
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (product) {
    await product.remove()
    res.json({ message: 'Product removed' })
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample name',
    price: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    brand: 'Sample brand',
    category: 'Sample category',
    countInStock: 0,
    numReviews: 0,
    description: 'Sample description',
  })

  const createdProduct = await product.save()
  res.status(201).json(createdProduct)
})

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    brand,
    category,
    countInStock,
  } = req.body

  const product = await Product.findById(req.params.id)

  if (product) {
    product.name = name
    product.price = price
    product.description = description
    product.image = image
    product.brand = brand
    product.category = category
    product.countInStock = countInStock

    const updatedProduct = await product.save()
    res.json(updatedProduct)
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body

  const moderationEnabled = await isFeatureEnabled('reviews_moderation', {
    isAdmin: req.user.isAdmin,
    bucket: parseBucketHeader(req),
  })

  const product = await Product.findById(req.params.id)

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) =>
        r.user.toString() === req.user._id.toString() &&
        r.status !== 'rejected'
    )

    if (alreadyReviewed) {
      res.status(400)
      throw new Error('Product already reviewed')
    }

    const reviewStatus = moderationEnabled ? 'pending' : 'approved'

    const images = req.files
      ? req.files.map((f) => `/${f.path}`)
      : []

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
      status: reviewStatus,
      images,
    }

    product.reviews.push(review)

    const approvedReviews = product.reviews.filter(
      (r) => r.status === 'approved'
    )
    product.numReviews = approvedReviews.length
    product.rating =
      approvedReviews.length > 0
        ? approvedReviews.reduce((acc, item) => item.rating + acc, 0) /
          approvedReviews.length
        : 0

    await product.save()
    res.status(201).json({
      message: moderationEnabled ? 'Review submitted for moderation' : 'Review added',
    })
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3)

  res.json(products)
})

// @desc    Suggest products by name prefix
// @route   GET /api/products/suggest
// @access  Public
const suggestProducts = asyncHandler(async (req, res) => {
  if (!(await isFeatureEnabled('search_autosuggest', {
    isAdmin: req.user?.isAdmin === true,
    bucket: parseBucketHeader(req),
  }))) {
    return res.json([])
  }

  const q = req.query.q
  if (!q || !q.trim()) {
    return res.json([])
  }
  const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const products = await Product.find({
    name: { $regex: escaped, $options: 'i' },
  })
    .select('_id name')
    .limit(6)
  res.json(products)
})

// @desc    Get recommended products (top-rated, excluding given product)
// @route   GET /api/products/recommend/:id
// @access  Public
const getProductRecommendations = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400)
    throw new Error('Invalid product id')
  }

  if (!(await isFeatureEnabled('product_recommendations', {
    isAdmin: req.user?.isAdmin === true,
    bucket: parseBucketHeader(req),
  }))) {
    return res.json([])
  }

  const products = await Product.find({ _id: { $ne: req.params.id } })
    .sort({ rating: -1 })
    .limit(3)
  res.json(products)
})

// @desc    Get all pending reviews (admin)
// @route   GET /api/products/reviews
// @access  Private/Admin
const getPendingReviews = asyncHandler(async (req, res) => {
  const products = await Product.find({ 'reviews.status': 'pending' }).select(
    'name reviews'
  )

  const pending = []
  products.forEach((product) => {
    product.reviews
      .filter((r) => r.status === 'pending')
      .forEach((review) => {
        pending.push({
          productId: product._id,
          productName: product.name,
          review,
        })
      })
  })

  res.json(pending)
})

// @desc    Approve or reject a review (admin)
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private/Admin
const moderateReview = asyncHandler(async (req, res) => {
  const { status } = req.body

  if (!['approved', 'rejected'].includes(status)) {
    res.status(400)
    throw new Error('Invalid status')
  }

  const product = await Product.findById(req.params.id)
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  const review = product.reviews.id(req.params.reviewId)
  if (!review) {
    res.status(404)
    throw new Error('Review not found')
  }

  review.status = status

  const approvedReviews = product.reviews.filter((r) => r.status === 'approved')
  product.numReviews = approvedReviews.length
  product.rating =
    approvedReviews.length > 0
      ? approvedReviews.reduce((acc, r) => r.rating + acc, 0) /
        approvedReviews.length
      : 0

  await product.save()
  res.json({ message: `Review ${status}` })
})

export {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
  suggestProducts,
  getProductRecommendations,
  getPendingReviews,
  moderateReview,
}
