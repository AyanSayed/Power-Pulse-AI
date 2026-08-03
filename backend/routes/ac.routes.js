const express = require("express");

const router = express.Router();

const {
  calculateACTonnage,
} = require("../utils/acSizing");

router.post("/analyze", (req, res) => {

  const result =
    calculateACTonnage(req.body);

  res.json(result);

});

module.exports = router;