const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Informações do usuário
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },

  // Itens do pedido
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Beer',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    image: String
  }],

  // Endereço de entrega
  shippingAddress: {
    cep: {
      type: String,
      required: true
    },
    logradouro: {
      type: String,
      required: true
    },
    numero: {
      type: String,
      required: true
    },
    complemento: String,
    bairro: {
      type: String,
      required: true
    },
    cidade: {
      type: String,
      required: true
    },
    estado: {
      type: String,
      required: true,
      maxlength: 2
    }
  },

  // Informações de pagamento
  paymentInfo: {
    paymentId: { // ID do pagamento no Mercado Pago
      type: String,
      required: true
    },
    preferenceId: { // ID da preferência de pagamento
      type: String
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'boleto', 'pix', 'other']
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'approved', 'authorized', 'in_process', 'rejected', 'cancelled', 'refunded', 'charged_back'],
      default: 'pending'
    },
    paymentDetails: { // Detalhes completos da resposta do MP
      type: Object
    },
    mercadoPagoFee: { // Taxa do Mercado Pago
      type: Number
    },
    netReceivedAmount: { // Valor líquido recebido
      type: Number
    }
  },

  // Valores financeiros
 subtotal: {
  type: Number // Removido 'required: true'
},
shippingCost: {
  type: Number,
  default: 15.00
},
total: {
  type: Number // Removido 'required: true'
},

  // Status e tracking
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingCode: String,
  trackingUrl: String,

  // Datas importantes
  createdAt: {
    type: Date,
    default: Date.now
  },
  paidAt: Date,
  shippedAt: Date,
  deliveredAt: Date,

  // Observações e metadados
  notes: String,
  internalNotes: String,
  metadata: Object // Para informações adicionais flexíveis
}, {
  timestamps: true, // Cria automaticamente createdAt e updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Método para atualizar status do pagamento
orderSchema.methods.updatePaymentStatus = async function(status, paymentDetails = {}) {
  this.paymentInfo.paymentStatus = status;
  this.paymentInfo.paymentDetails = paymentDetails;
  
  if (status === 'approved') {
    this.paidAt = new Date();
    this.status = 'processing'; // Muda status do pedido quando pagamento é aprovado
  }
  
  return this.save();
};

// Virtual para status completo
orderSchema.virtual('fullStatus').get(function() {
  return {
    order: this.status,
    payment: this.paymentInfo.paymentStatus
  };
});

// Pré-save para calcular totais
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isNew) {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.total = this.subtotal + this.shippingCost;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);