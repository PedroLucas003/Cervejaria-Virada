import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserOrdersPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const UserOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_URL}/api/orders/my-orders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          setError(response.data.message || 'Erro ao carregar pedidos');
        }
      } catch (error) {
        setError(error.response?.data?.message || error.message || 'Erro ao carregar pedidos');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (loading) {
    return <div className="loading">Carregando seus pedidos...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="user-orders-container">
      <h1>Meus Pedidos</h1>
      
      {orders.length === 0 ? (
        <p className="no-orders">Você ainda não fez nenhum pedido.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card" onClick={() => navigate(`/orders/${order._id}`)}>
              <div className="order-header">
                <span className="order-id">Pedido #{order._id}</span>
                <span className="order-date">{formatDate(order.createdAt)}</span>
                <span className={`order-status ${order.status}`}>
                  {order.status === 'pending' && 'Pendente'}
                  {order.status === 'processing' && 'Processando'}
                  {order.status === 'shipped' && 'Enviado'}
                  {order.status === 'delivered' && 'Entregue'}
                  {order.status === 'cancelled' && 'Cancelado'}
                </span>
              </div>
              
              <div className="order-summary">
                <div className="order-items">
                  {order.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="order-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div className="more-items">+{order.items.length - 2} itens</div>
                  )}
                </div>
                
                <div className="order-total">
                  Total: {formatCurrency(order.total)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrdersPage;