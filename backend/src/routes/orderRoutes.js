const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware'); // Verifique se este arquivo exporta uma função de middleware

// Aplica o middleware de autenticação para todas as rotas de pedido
// Qualquer requisição a /api/orders/* precisará de um token válido
router.use(authMiddleware);

// Rota para um usuário buscar seus próprios pedidos
// GET /api/orders/myorders
router.get('/myorders', orderController.getUserOrders);

// Rota para o admin buscar TODOS os pedidos.
// GET /api/orders/
// Primeiro, o 'adminMiddleware' é executado para verificar se o usuário é admin.
router.get('/', adminMiddleware, orderController.getAllOrders);

module.exports = router;
