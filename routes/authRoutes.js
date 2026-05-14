const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  registerWorker,
  loginCustomer,
  loginWorker,
  loginAdmin,
} = require('../controllers/authController');

router.post('/register/customer', registerCustomer);
router.post('/register/worker',   registerWorker);
router.post('/login/customer',    loginCustomer);
router.post('/login/worker',      loginWorker);
router.post('/login/admin',       loginAdmin);

module.exports = router;
