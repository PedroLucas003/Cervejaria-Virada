import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Cervejas.css';

const API_URL = 'http://localhost:3001';

const Cervejas = ({ cart, addToCart, updateCart, isAuthenticated }) => {
  const [cervejas, setCervejas] = useState([]);
  const [stock, setStock] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  // Função para obter imagem da cerveja por tipo
  const getBeerImage = useCallback((beerType) => {
    const images = {
      'IPA': 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      'Stout': 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      'Weiss': 'https://images.unsplash.com/photo-1600788886242-5c96aabe3757?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      'Pilsen': 'https://images.unsplash.com/photo-1600788886242-5c96aabe3757?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      'Outro': 'https://via.placeholder.com/400x500.png?text=Garrafa+Virada'
    };
    return images[beerType] || images['Outro'];
  }, []);

  // Função para buscar cervejas
  const fetchBeers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/api/beers/public`);
      
      // Verifica se a resposta tem a estrutura esperada
      if (!response.data || !response.data.success || !Array.isArray(response.data.data)) {
        throw new Error('Estrutura de dados inválida');
      }

      // Formata os dados das cervejas
      const formattedBeers = response.data.data.map(beer => ({
        _id: beer._id,
        nome: `Virada ${beer.beerType}`,
        tipo: beer.beerType,
        beerType: beer.beerType,
        descricao: beer.description,
        imagem: getBeerImage(beer.beerType),
        teor: beer.alcoholContent,
        ano: beer.yearCreated,
        price: Number(beer.price) || 0,
        quantity: beer.quantity
      }));

      setCervejas(formattedBeers);

      // Atualiza o estoque usando _id como chave
      const newStock = {};
      response.data.data.forEach(beer => {
        newStock[beer._id] = beer.quantity;
      });
      setStock(newStock);

    } catch (error) {
      console.error('Erro ao carregar cervejas:', error);
      setError('Erro ao carregar as cervejas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [getBeerImage]);

  useEffect(() => {
    fetchBeers();
  }, [fetchBeers]);

  // Função para adicionar ao carrinho
  const handleAddToCart = (cerveja) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/' } });
      return;
    }
    
    if (stock[cerveja._id] <= 0) {
      setError('Esta cerveja está esgotada no momento.');
      return;
    }
    
    addToCart(cerveja);
    setShowCart(true);
  };

  // Função para remover do carrinho
  const handleRemoveFromCart = (id) => {
    const updatedCart = cart.filter(item => item._id !== id);
    updateCart(updatedCart);
  };

  // Função para atualizar quantidade no carrinho
  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(id);
      return;
    }
    
    const updatedCart = cart.map(item =>
      item._id === id ? { ...item, quantity: newQuantity } : item
    );
    updateCart(updatedCart);
  };

  // Calcula total de itens no carrinho
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Calcula preço total
  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      return total + ((item.price || 0) * item.quantity);
    }, 0).toFixed(2);
  };

  // Navega para checkout
  const proceedToCheckout = () => {
    navigate('/checkout');
  };

  return (
    <section id="cervejas-section" className="cervejas-section">
      <h2 className="section-title">Nossas <span className="destaque">Cervejas</span> Históricas</h2>

      {/* Mensagem de erro */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button 
            onClick={() => {
              setError(null);
              fetchBeers();
            }}
            className="retry-button"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Grid de cervejas */}
      <div className="cervejas-grid">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Carregando cervejas...</p>
          </div>
        )}

        {cervejas.map((cerveja) => (
          <div key={cerveja._id} className="cerveja-card">
            <div className="cerveja-imagem-container">
              <img
                src={cerveja.imagem}
                alt={cerveja.nome}
                className="cerveja-imagem"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/400x500.png?text=Garrafa+Virada";
                }}
              />
              <div className="cerveja-detalhes">
                <div className="cerveja-tag">Virada</div>
                <div className="cerveja-ano">{cerveja.ano}</div>
              </div>
              <button
                className={`add-to-cart-btn ${stock[cerveja._id] <= 0 ? 'disabled' : ''}`}
                onClick={() => handleAddToCart(cerveja)}
                disabled={stock[cerveja._id] <= 0}
              >
                <i className="fas fa-shopping-cart"></i>
                {stock[cerveja._id] > 0 ? 'Adicionar' : 'Esgotado'}
              </button>
            </div>
            <div className="cerveja-info">
              <h3>{cerveja.nome}</h3>
              <p className="cerveja-tipo">{cerveja.tipo}</p>
              <p className="cerveja-desc">{cerveja.descricao}</p>
              <div className="cerveja-stock">
                <span className="stock-label">Estoque:</span>
                <span className={`stock-value ${stock[cerveja._id] > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {stock[cerveja._id]} unidades
                </span>
              </div>
              <span className="cerveja-teor">{cerveja.teor}</span>
              <span className="cerveja-price">R$ {(cerveja.price || 0).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Ícone do carrinho */}
      <div className={`cart-icon ${getTotalItems() > 0 ? 'has-items' : ''}`} onClick={() => setShowCart(!showCart)}>
        <i className="fas fa-shopping-cart"></i>
        {getTotalItems() > 0 && <span className="cart-count">{getTotalItems()}</span>}
      </div>

      {/* Sidebar do carrinho */}
      <div className={`cart-sidebar ${showCart ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>Seu Carrinho</h3>
          <button className="close-cart" onClick={() => setShowCart(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <i className="fas fa-shopping-cart"></i>
            <p>Seu carrinho está vazio</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item._id} className="cart-item">
                  <img src={item.imagem} alt={item.nome} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h4>{item.nome}</h4>
                    <p className="cart-item-type">{item.tipo}</p>
                    <div className="cart-item-quantity">
                      <button onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}>
                        <i className="fas fa-minus"></i>
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                        disabled={stock[item._id] <= item.quantity}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-price">
                    R$ {((item.price || 0) * item.quantity).toFixed(2)}
                    <button
                      className="remove-item"
                      onClick={() => handleRemoveFromCart(item._id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="cart-total">
                <span>Total:</span>
                <span>R$ {getTotalPrice()}</span>
              </div>
              <button
                className="checkout-btn"
                onClick={proceedToCheckout}
                disabled={cart.length === 0}
              >
                Finalizar Compra
              </button>
            </div>
          </>
        )}
      </div>
      {showCart && <div className="cart-overlay" onClick={() => setShowCart(false)}></div>}
    </section>
  );
};

export default Cervejas;