const express = require('express');
const router = express.Router();
const { postFood, getAvailableFood, claimFood, getMyFood, getFoodById, deleteFood } = require('../controllers/foodController');
const { protect } = require('../middleware/auth');

router.route('/')
    .get(getAvailableFood)
    .post(protect, postFood);

router.route('/:id')
    .get(getFoodById)
    .delete(protect, deleteFood);

router.post('/claim/:id', protect, claimFood);
router.get('/my', protect, getMyFood);

module.exports = router;
