const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');

// Validation
const loginValidation = [
  body('email').isEmail().withMessage('Geçerli bir e-posta adresi girin'),
  body('password').notEmpty().withMessage('Şifre gerekli')
];

// Routes
router.post('/login', loginValidation, adminController.login);
router.post('/logout', adminController.logout);
router.get('/me', adminController.getMe);

// İlk admin oluşturma (production'da kaldırılmalı)
router.post('/setup', adminController.createFirstAdmin);

module.exports = router;

