import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './OrderSuccessPage.css';

const OrderSuccessPage = ({ clearCart }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;

  useEffect(() => {
    if (clearCart) {
      clearCart();
    }
  }, [clearCart]);

  return (
    <div className="order-success-container">
      <h1>Pedido Realizado com Sucesso!</h1>
      <p>Obrigado por comprar na Cervejaria Virada!</p>
      {orderId && (
        <p className="order-number">Número do pedido: #{orderId}</p>
      )}
      <div className="success-actions">
        <button 
          className="back-to-home"
          onClick={() => navigate('/')}
        >
          Voltar para a página inicial
        </button>
        <button 
          className="view-orders"
          onClick={() => navigate('/my-orders')}
        >
          Ver meus pedidos
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessPage;