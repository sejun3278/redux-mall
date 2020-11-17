const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/test', controller.api.test);
router.get('/get/allState', controller.get.allState);
router.get('/get/admin_check', controller.get.admin_check);

router.get('/add/admin_check', controller.add.admin_check);

//////////////////////////////////////////////////

router.post('/get/user_info', controller.get.user_info);
router.post('/get/admin_info', controller.get.admin_info);

router.post('/check/user_id', controller.check.user_id);
router.post('/check/nickname', controller.check.nickname);

router.post('/add/signup', controller.add.signup);
router.post('/add/goods', controller.add.goods);

router.post('/api/login', controller.api.login);
router.post('/api/send_mail', controller.api.send_mail);
router.post('/api/save_file', controller.api.save_file);
router.post('/api/upload_file', controller.api.upload_file);


router.post('/update/user_info', controller.update.user_info);

router.post('/remove/cookie', controller.remove.cookie);


module.exports = router;