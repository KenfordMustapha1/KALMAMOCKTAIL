const express = require('express');
const router = express.Router();
const {
  getDrinks,
  getDrinkById,
  createDrink,
  updateDrink,
  deleteDrink,
} = require('../controllers/drinkController');
const { protect, admin } = require('../middleware/auth');

router.route('/').get(getDrinks).post(protect, admin, createDrink);
router
  .route('/:id')
  .get(getDrinkById)
  .put(protect, admin, updateDrink)
  .delete(protect, admin, deleteDrink);

module.exports = router;
