const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/test', controller.api.test);
router.get('/get/allState', controller.get.allState);

router.post('/get/user_info', controller.get.user_info);
router.post('/get/admin_info', controller.get.admin_info);

router.post('/check/user_id', controller.check.user_id);
router.post('/check/nickname', controller.check.nickname);

router.post('/add/signup', controller.add.signup);

router.post('/api/login', controller.api.login);

router.post('/update/user_info', controller.update.user_info);


module.exports = router;