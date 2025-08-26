const express = require('express');
const goldAdvisorController = require('../controllers/goldAdvisorController');

const router = express.Router();

router.post("/", goldAdvisorController);

module.exports = router;
