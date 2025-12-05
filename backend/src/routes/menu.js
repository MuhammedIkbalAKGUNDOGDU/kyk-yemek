const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const menuController = require('../controllers/menuController');
const adminController = require('../controllers/adminController');

// Validation
const createMenuValidation = [
  body('cityId').trim().notEmpty().withMessage('Şehir gerekli'),
  body('date').isDate().withMessage('Geçerli bir tarih girin'),
  body('mealType').isIn(['breakfast', 'dinner']).withMessage('Öğün tipi breakfast veya dinner olmalı'),
  body('items').isArray({ min: 1 }).withMessage('En az bir yemek gerekli'),
  body('totalCalories').isInt({ min: 0 }).withMessage('Kalori pozitif bir sayı olmalı')
];

// =============================================
// PUBLIC ROUTES (Kullanıcılara açık)
// =============================================
router.get('/public', menuController.getPublicMenus);
router.get('/public/monthly', menuController.getMonthlyMenu);

// =============================================
// ADMIN ROUTES (Yetki gerekli)
// =============================================
router.use(adminController.requireAdmin);

router.get('/', menuController.getAllMenus);
router.get('/:id', menuController.getMenuById);
router.post('/', createMenuValidation, menuController.createMenu);
router.post('/bulk-upload', menuController.bulkUpload);
router.put('/:id', menuController.updateMenu);
router.post('/:id/publish', menuController.publishMenu);
router.post('/bulk-publish', menuController.bulkPublish);
router.post('/publish-month', menuController.publishMonth);
router.delete('/:id', menuController.deleteMenu);

module.exports = router;

