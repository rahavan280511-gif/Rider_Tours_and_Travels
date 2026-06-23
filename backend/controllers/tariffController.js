const Tariff = require('../models/Tariff');

exports.getTariffs = async (req, res) => {
  try {
    const tariffs = await Tariff.find({}).sort({ capacitySeats: 1 });
    res.json({ success: true, count: tariffs.length, data: tariffs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTariffByCategory = async (req, res) => {
  try {
    const param = req.params.category;
    const tariff = await Tariff.findOne({
      $or: [
        { slug: param.toLowerCase() },
        { category: new RegExp(`^${param}$`, 'i') },
      ],
    });

    if (!tariff) {
      return res.status(404).json({ success: false, message: 'Tariff category not found' });
    }

    res.json({ success: true, data: tariff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
