const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/test', controller.api.test);
router.get('/get/allState', controller.get.allState);

router.post('/check/user_id', controller.check.user_id);
router.post('/check/nickname', controller.check.nickname);


router.post('/add/signup', controller.add.signup);



module.exports = router;