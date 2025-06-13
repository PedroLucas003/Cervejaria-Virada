// src/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware para proteger a rota

// Rota para criar um novo pedido.
// Usamos o `authMiddleware` para garantir que apenas usuários logados possam criar pedidos.
router.post('/', authMiddleware, orderController.createOrder);


module.exports = router;