// src/controllers/orderController.js

const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, total } = req.body;
    
    // O ID do usuário é adicionado ao `req` pelo seu `authMiddleware`
    const userId = req.userId;

    // 1. Validar se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // 2. Criar um novo pedido com os dados recebidos do frontend
    const newOrder = new Order({
      user: userId,
      userEmail: user.email, // Pegamos o email do usuário encontrado
      
      // Mapeamos os itens do carrinho para o formato do schema
      items: items.map(item => ({
        productId: item._id, // O schema espera `productId`
        name: item.nome,
        type: item.tipo,
        price: item.price,
        quantity: item.quantity,
        image: item.imagem
      })),

      // Mapeamos o endereço de entrega para o formato do schema
      shippingAddress: {
        cep: shippingAddress.cep,
        logradouro: shippingAddress.address, // `address` do frontend -> `logradouro` no schema
        numero: shippingAddress.number,     // `number` do frontend -> `numero` no schema
        complemento: shippingAddress.complement,
        bairro: shippingAddress.neighborhood,
        cidade: shippingAddress.city,
        estado: shippingAddress.state
      },

      // Os valores totais
      total: total,
      subtotal: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      shippingCost: 15.00, // Valor fixo como no seu frontend

      // Status inicial do pedido. 
      // Como o pagamento é "acertado com a loja", definimos como pendente.
      status: 'pending',

      // Informações de pagamento simplificadas (sem gateway)
      paymentInfo: {
        paymentId: `local_${new mongoose.Types.ObjectId()}`, // Um ID de pagamento local/fictício
        paymentMethod: 'other',
        paymentStatus: 'pending' // Pagamento aguardando acerto
      }
    });

    // 3. Salvar o pedido no banco de dados
    const savedOrder = await newOrder.save();

    // 4. Retornar o pedido criado com sucesso
    res.status(201).json(savedOrder);

  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar o pedido.',
      error: error.message 
    });
  }
};