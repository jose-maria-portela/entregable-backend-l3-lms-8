'use strict'
const { ValidationError } = require('sequelize')
const models = require('../models')
const Restaurant = models.Restaurant
const Product = models.Product
module.exports = {
  checkProductOwnership: async (req, res, next) => {
    try {
      const product = await Product.findByPk(req.params.productId, { include: { model: Restaurant, as: 'restaurant' } })
      if (req.user.id === product.restaurant.userId) {
        return next()
      } else {
        return res.status(403).send('Not enough privileges. This entity does not belong to you')
      }
    } catch (err) {
      return res.status(500).send(err)
    }
  },
  checkProductRestaurantOwnership: async (req, res, next) => {
    try {
      const restaurant = await Restaurant.findByPk(req.body.restaurantId)
      if (req.user.id === restaurant.userId) {
        return next()
      } else {
        return res.status(403).send('Not enough privileges. This entity does not belong to you')
      }
    } catch (err) {
      return res.status(500).send(err)
    }
  }
}
