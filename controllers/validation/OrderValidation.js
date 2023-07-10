const { check } = require('express-validator')
const models = require('../../models')
const Product = models.Product
const Order = models.Order
const Restaurant = models.Restaurant

const checkOrderPending = async (value, { req }) => {
  try {
    const order = await Order.findByPk(req.params.orderId,
      {
        attributes: ['startedAt']
      })
    if (order.startedAt) {
      return Promise.reject(new Error('The order has already been started'))
    } else {
      return Promise.resolve('ok')
    }
  } catch (err) {
    return Promise.reject(err)
  }
}
const checkOrderCanBeSent = async (value, { req }) => {
  try {
    const order = await Order.findByPk(req.params.orderId,
      {
        attributes: ['startedAt', 'sentAt']
      })
    if (!order.startedAt) {
      return Promise.reject(new Error('The order is not started'))
    } else if (order.sentAt) {
      return Promise.reject(new Error('The order has already been sent'))
    } else {
      return Promise.resolve('ok')
    }
  } catch (err) {
    return Promise.reject(err)
  }
}
const checkOrderCanBeDelivered = async (value, { req }) => {
  try {
    const order = await Order.findByPk(req.params.orderId,
      {
        attributes: ['startedAt', 'sentAt', 'deliveredAt']
      })
    if (!order.startedAt) {
      return Promise.reject(new Error('The order is not started'))
    } else if (!order.sentAt) {
      return Promise.reject(new Error('The order is not sent'))
    } else if (order.deliveredAt) {
      return Promise.reject(new Error('The order has already been delivered'))
    } else {
      return Promise.resolve('ok')
    }
  } catch (err) {
    return Promise.reject(err)
  }
}

const checkRestaurantExists = async (restaurantId) => {
  try {
    const restaurant = await Restaurant.findByPk(restaurantId)
    if (restaurant){
      return Promise.resolve()
    } else{
      return Promise.reject(new Error('The restaurantId in the body must correspond to one which exists.'))
    }
  } catch (error) {
    return Promise.reject(new Error(error))
  }
}

const checkMinValueOfProducts = async (products) => {
  for (const {productId, quantity} of products) {
    if (productId <=0) {
      return Promise.reject(new Error(`There can not be productId with id: ${productId}`))
    } else if(quantity <= 0){
      return Promise.reject(new Error(`There can not be a quantity of: ${quantity}`))
    }
  }
  return Promise.resolve()
}

const checkProductsAreAvailable = async (productsBody) => {
  for (const { productId } of productsBody) {
    const product = await Product.findByPk(productId, { attributes: ['availability'] })
    if (!product.availability) {
      return Promise.reject(new Error(`The product ${product.name} must be available, or you can not ask for it`))
    }
  }
  return Promise.resolve()
}

const checkProductsBelongToSameRestaurant = async (productsBody, restaurantIdOfOrder) => {
  const allRestaurantIds = []
  for (const { productId } of productsBody) {
    const product = await Product.findByPk(productId, { attributes: ['restaurantId'] })
    allRestaurantIds.push(product.restaurantId)
  }
  if (allRestaurantIds.filter( id => id === restaurantIdOfOrder).length < allRestaurantIds.length) {
    return Promise.reject(new Error('The products must belong to the same restaurant.'))
  } else {
    return Promise.resolve()
  }
}

module.exports = {
  // TODO: Include validation rules for create that should:
  // 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
  // 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
  // 3. Check that products are available
  // 4. Check that all the products belong to the same restaurant
  create: [
    check('restaurantId').exists().custom((value, { req }) => {
      return checkRestaurantExists(value)
    }),
    check('products').notEmpty().custom((value, { req }) => {
      return checkMinValueOfProducts(value, req.body.products)
    }),
    check('products').custom((value, { req }) => {
      return checkProductsAreAvailable(req.body.products)
    }),
    check('products').custom((value, { req }) => {
      return checkProductsBelongToSameRestaurant(req.body.products, req.body.restaurantId)
    })
  ],
  // TODO: Include validation rules for update that should:
  // 1. Check that restaurantId is NOT present in the body.
  // 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
  // 3. Check that products are available
  // 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
  // 5. Check that the order is in the 'pending' state.
  update: [

  ],
  // TODO: Include validation rules for destroying an order that should check if the order is in the 'pending' state
  destroy:[

  ],
  confirm: [
    check('startedAt').custom(checkOrderPending)
  ],
  send: [
    check('sentAt').custom(checkOrderCanBeSent)
  ],
  deliver: [
    check('deliveredAt').custom(checkOrderCanBeDelivered)
  ]
}
