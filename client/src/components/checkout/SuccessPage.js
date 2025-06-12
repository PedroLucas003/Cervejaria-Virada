import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Verifica o pagamento no backend
        await axios.get(`${API_URL}/api/payments/verify/${paymentId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Redireciona para página de sucesso após alguns segundos
        setTimeout(() => {
          navigate('/order-success');
        }, 3000);

      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
        navigate('/error');
      }
    };

    if (paymentId) {
      verifyPayment();
    } else {
      navigate('/');
    }
  }, [paymentId, navigate]);

  return (
    <div className="payment-status-page">
      <h1>Pagamento Aprovado!</h1>
      <p>Seu pagamento foi processado com sucesso.</p>
      <p>Estamos preparando seu pedido.</p>
      <p>Redirecionando para a página de confirmação...</p>
    </div>
  );
};

export default SuccessPage;