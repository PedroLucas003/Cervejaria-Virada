const Order = require('../models/Order');

// Handler para obter os pedidos do usuário logado
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate('items.productId', 'nome preco imagem')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar pedidos do usuário.',
      error: error.message
    });
  }
};

// Handler para o admin obter TODOS os pedidos de TODOS os usuários
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}) // Busca todos os pedidos sem filtro de usuário
      .populate('user', 'nomeCompleto email')
      .populate('items.productId', 'nome preco imagem')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Erro ao buscar todos os pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar todos os pedidos.',
      error: error.message
    });
  }
};