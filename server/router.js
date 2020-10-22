const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/test', controller.api.test);
router.get('/get/allState', controller.get.allState);


module.exports = router;