import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CheckoutPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const CheckoutPage = ({ cartItems }) => {
  const [deliveryData, setDeliveryData] = useState({
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Validations
      if (!cartItems || cartItems.length === 0) {
        setError('Seu carrinho está vazio');
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Validate required fields
      const requiredFields = ['cep', 'address', 'number', 'city', 'state'];
      const missingFields = requiredFields.filter(field => !deliveryData[field]);

      if (missingFields.length > 0) {
        setError(`Por favor, preencha: ${missingFields.join(', ')}`);
        setIsLoading(false);
        return;
      }

      // Create order
      const response = await axios.post(
        `${API_URL}/api/orders`,
        {
          items: cartItems.map(item => ({
            product: item._id, // Certifique-se que está enviando o ID correto
            name: item.nome,
            type: item.tipo,
            price: item.price,
            quantity: item.quantity,
            image: item.imagem
          })),
          shippingAddress: deliveryData,
          total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 15
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Redirect to success page with the new order ID
      navigate(`/order/${response.data._id}/success`);

    } catch (error) {
      console.error('Erro no checkout:', error);
      setError(
        error.response?.data?.message ||
        'Erro ao finalizar compra. Por favor, tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cep') {
      const numericValue = value.replace(/\D/g, '');
      const formattedValue = numericValue.length > 5
        ? `${numericValue.substring(0, 5)}-${numericValue.substring(5, 8)}`
        : numericValue;
      setDeliveryData(prev => ({ ...prev, [name]: formattedValue }));
    } else if (name === 'state') {
      setDeliveryData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setDeliveryData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="checkout-container">
      <h1>Finalize sua Compra</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="checkout-grid">
        <div className="order-summary">
          <h2>Seu Carrinho</h2>
          {cartItems.length > 0 ? (
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item._id} className="cart-item">
                  <img src={item.imagem} alt={item.nome} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h4>{item.nome}</h4>
                    <p className="cart-item-type">{item.tipo}</p>
                    <p>Quantidade: {item.quantity}</p>
                    <p>R$ {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <div className="cart-shipping">
                <p>Frete: R$ 15,00</p>
              </div>
              <div className="cart-total">
                <p>Total: R$ {(cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 15).toFixed(2)}</p>
              </div>
            </div>
          ) : (
            <p>Seu carrinho está vazio</p>
          )}
        </div>

        <div className="delivery-payment">
          <div className="delivery-form">
            <h2>Informações de Entrega</h2>

            <form>
              <div className="form-group">
                <label htmlFor="cep">CEP *</label>
                <input
                  type="text"
                  id="cep"
                  name="cep"
                  placeholder="00000-000"
                  value={deliveryData.cep}
                  onChange={handleInputChange}
                  maxLength="9"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Endereço *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="Rua, Avenida, etc."
                  value={deliveryData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="number">Número *</label>
                  <input
                    type="text"
                    id="number"
                    name="number"
                    placeholder="Nº"
                    value={deliveryData.number}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="complement">Complemento</label>
                  <input
                    type="text"
                    id="complement"
                    name="complement"
                    placeholder="Apto, Bloco, etc."
                    value={deliveryData.complement}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="neighborhood">Bairro *</label>
                <input
                  type="text"
                  id="neighborhood"
                  name="neighborhood"
                  value={deliveryData.neighborhood}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">Cidade *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={deliveryData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">Estado *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={deliveryData.state}
                    onChange={handleInputChange}
                    maxLength="2"
                    required
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="payment-instructions">
            <h3>Instruções Importantes:</h3>
            <ul>
              <li>Após clicar em "Finalizar Compra", seu pedido será registrado</li>
              <li>Você receberá um e-mail com os detalhes do pedido</li>
              <li>O pagamento será acertado diretamente com a loja</li>
            </ul>
          </div>

          <div className="order-total-section">
            <button
              onClick={handleCheckout}
              disabled={isLoading || !deliveryData.cep || !deliveryData.address ||
                !deliveryData.number || cartItems.length === 0}
              className="checkout-btn"
            >
              {isLoading ? 'Processando...' : 'Finalizar Compra'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;