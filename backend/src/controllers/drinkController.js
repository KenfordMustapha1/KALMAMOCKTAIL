const Drink = require('../models/Drink');

const getDrinks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.available === 'true') {
      filter.availability = true;
    }
    const drinks = await Drink.find(filter).sort({ createdAt: -1 });
    res.json(drinks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDrinkById = async (req, res) => {
  try {
    const drink = await Drink.findById(req.params.id);
    if (!drink) {
      return res.status(404).json({ message: 'Drink not found' });
    }
    res.json(drink);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDrink = async (req, res) => {
  try {
    const drink = await Drink.create(req.body);
    res.status(201).json(drink);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateDrink = async (req, res) => {
  try {
    const drink = await Drink.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!drink) {
      return res.status(404).json({ message: 'Drink not found' });
    }
    res.json(drink);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteDrink = async (req, res) => {
  try {
    const drink = await Drink.findByIdAndDelete(req.params.id);
    if (!drink) {
      return res.status(404).json({ message: 'Drink not found' });
    }
    res.json({ message: 'Drink removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDrinks,
  getDrinkById,
  createDrink,
  updateDrink,
  deleteDrink,
};
