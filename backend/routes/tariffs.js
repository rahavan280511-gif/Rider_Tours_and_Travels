const express = require('express');
const router = express.Router();
const { getTariffs, getTariffByCategory } = require('../controllers/tariffController');

router.get('/', getTariffs);
router.get('/:category', getTariffByCategory);

module.exports = router;
