const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

// Validation rules
const registerValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Ad soyad 3-100 karakter olmalı'),
  body('nickname')
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Kullanıcı adı 3-50 karakter, sadece harf, rakam ve _ içerebilir'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir e-posta adresi girin'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalı'),
  body('cityId')
    .trim()
    .notEmpty()
    .withMessage('Şehir seçimi zorunlu')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir e-posta adresi girin'),
  body('password')
    .notEmpty()
    .withMessage('Şifre gerekli')
];

const updateProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Ad soyad 3-100 karakter olmalı'),
  body('nickname')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Kullanıcı adı 3-50 karakter, sadece harf, rakam ve _ içerebilir'),
  body('cityId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Geçerli bir şehir seçin'),
  body('avatarId')
    .optional()
    .trim()
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mevcut şifre gerekli'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Yeni şifre en az 6 karakter olmalı')
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.put('/profile', updateProfileValidation, authController.updateProfile);
router.put('/password', changePasswordValidation, authController.changePassword);

// Kullanıcı aktiviteleri
router.get('/my-comments', authController.getMyComments);
router.get('/my-votes', authController.getMyVotes);
router.get('/my-stats', authController.getMyStats);

module.exports = router;

