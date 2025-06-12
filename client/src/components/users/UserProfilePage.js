import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserProfilePage.css';

const UserProfilePage = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    cpf: '',
    dataNascimento: '',
    telefone: '',
    enderecos: []
  });
const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(''); // <-- ADICIONADO
  const [activeTab, setActiveTab] = useState('info');

 const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
 
  useEffect(() => {
    if (user) {
      setFormData({
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        cpf: user.cpf,
        dataNascimento: user.dataNascimento ? new Date(user.dataNascimento).toISOString().split('T')[0] : '',
        telefone: user.telefone,
        enderecos: user.enderecos || []
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e, index) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      enderecos: prev.enderecos.map((endereco, i) =>
        i === index ? { ...endereco, [name]: value } : endereco
      )
    }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    // // Defina a URL base da sua API aqui
    // const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        nomeCompleto: formData.nomeCompleto,
        email: formData.email,
        dataNascimento: formData.dataNascimento,
        telefone: formData.telefone.replace(/\D/g, ''),
        enderecos: formData.enderecos.map(addr => ({
          cep: addr.cep.replace(/\D/g, ''),
          logradouro: addr.logradouro,
          numero: addr.numero,
          complemento: addr.complemento || '',
          bairro: addr.bairro,
          cidade: addr.cidade,
          estado: addr.estado.toUpperCase(),
          principal: addr.principal || false
        }))
      };

      const response = await axios.put(
        `${API_URL}/api/auth/${user._id}`, // URL corrigida e completa
        payload,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      onUpdateUser(response.data.user);
      setSuccessMessage('Perfil atualizado com sucesso!');
      
      // Volta para o modo de visualização após 2 segundos
      setTimeout(() => {
        setEditing(false);
        setSuccessMessage('');
      }, 2000);

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Ocorreu um erro ao atualizar o perfil.';
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const addNewAddress = () => {
    setFormData(prev => ({
      ...prev,
      enderecos: [
        ...prev.enderecos,
        {
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: '',
          principal: false
        }
      ]
    }));
  };

  const removeAddress = (index) => {
    if (formData.enderecos.length <= 1) return;

    setFormData(prev => ({
      ...prev,
      enderecos: prev.enderecos.filter((_, i) => i !== index)
    }));
  };

  const togglePrincipalAddress = (index) => {
    setFormData(prev => ({
      ...prev,
      enderecos: prev.enderecos.map((endereco, i) => ({
        ...endereco,
        principal: i === index
      }))
    }));
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <div className="profile-loading">
            <div className="spinner"></div>
            <p>Carregando dados do usuário...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <h2>Meu Perfil</h2>
          <div className="profile-avatar">
            <i className="fas fa-user-circle"></i>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Informações
          </button>
          <button
            className={`tab-btn ${activeTab === 'address' ? 'active' : ''}`}
            onClick={() => setActiveTab('address')}
          >
            Endereços
          </button>
        </div>

        {errors.submit && (
          <div className="error-message">
            {errors.submit}
          </div>
        )}
        {successMessage && <div className="success-message">{successMessage}</div>}
        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          {activeTab === 'info' && (
            <div className="profile-section">
              <h3>Informações Pessoais</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>Nome Completo</label>
                  {editing ? (
                    <input
                      type="text"
                      name="nomeCompleto"
                      value={formData.nomeCompleto}
                      onChange={handleChange}
                      required
                    />
                  ) : (
                    <p className="profile-info">{formData.nomeCompleto}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Email</label>
                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  ) : (
                    <p className="profile-info">{formData.email}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>CPF</label>
                  <p className="profile-info">
                    {formData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                  </p>
                </div>

                <div className="form-group">
                  <label>Data de Nascimento</label>
                  {editing ? (
                    <input
                      type="date"
                      name="dataNascimento"
                      value={formData.dataNascimento}
                      onChange={handleChange}
                      required
                    />
                  ) : (
                    <p className="profile-info">
                      {new Date(formData.dataNascimento).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label>Telefone</label>
                  {editing ? (
                    <input
                      type="tel"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      required
                    />
                  ) : (
                    <p className="profile-info">
                      {formData.telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'address' && (
            <div className="profile-section">
              <h3>Endereços</h3>

              {formData.enderecos.map((endereco, index) => (
                <div key={index} className={`address-card ${endereco.principal ? 'principal' : ''}`}>
                  <div className="address-header">
                    <h4>Endereço {index + 1}</h4>
                    {endereco.principal && <span className="principal-badge">Principal</span>}

                    {editing && (
                      <div className="address-actions">
                        <button
                          type="button"
                          onClick={() => togglePrincipalAddress(index)}
                          disabled={endereco.principal}
                          className="action-btn"
                        >
                          Tornar Principal
                        </button>
                        {formData.enderecos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAddress(index)}
                            className="action-btn remove"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="address-grid">
                    <div className="form-group">
                      <label>CEP</label>
                      {editing ? (
                        <input
                          type="text"
                          name="cep"
                          value={endereco.cep}
                          onChange={(e) => handleAddressChange(e, index)}
                          required
                        />
                      ) : (
                        <p className="address-info">{endereco.cep.replace(/(\d{5})(\d{3})/, '$1-$2')}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Logradouro</label>
                      {editing ? (
                        <input
                          type="text"
                          name="logradouro"
                          value={endereco.logradouro}
                          onChange={(e) => handleAddressChange(e, index)}
                          required
                        />
                      ) : (
                        <p className="address-info">{endereco.logradouro}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Número</label>
                      {editing ? (
                        <input
                          type="text"
                          name="numero"
                          value={endereco.numero}
                          onChange={(e) => handleAddressChange(e, index)}
                          required
                        />
                      ) : (
                        <p className="address-info">{endereco.numero}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Complemento</label>
                      {editing ? (
                        <input
                          type="text"
                          name="complemento"
                          value={endereco.complemento || ''}
                          onChange={(e) => handleAddressChange(e, index)}
                        />
                      ) : (
                        <p className="address-info">{endereco.complemento || '-'}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Bairro</label>
                      {editing ? (
                        <input
                          type="text"
                          name="bairro"
                          value={endereco.bairro}
                          onChange={(e) => handleAddressChange(e, index)}
                          required
                        />
                      ) : (
                        <p className="address-info">{endereco.bairro}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Cidade</label>
                      {editing ? (
                        <input
                          type="text"
                          name="cidade"
                          value={endereco.cidade}
                          onChange={(e) => handleAddressChange(e, index)}
                          required
                        />
                      ) : (
                        <p className="address-info">{endereco.cidade}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Estado</label>
                      {editing ? (
                        <input
                          type="text"
                          name="estado"
                          value={endereco.estado}
                          onChange={(e) => handleAddressChange(e, index)}
                          maxLength="2"
                          required
                        />
                      ) : (
                        <p className="address-info">{endereco.estado}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {editing && (
                <button
                  type="button"
                  onClick={addNewAddress}
                  className="add-address-btn"
                >
                  <i className="fas fa-plus"></i> Adicionar Novo Endereço
                </button>
              )}
            </div>
          )}

          <div className="profile-actions">
  {editing ? (
    <>
      <button
        type="button"  // Note que agora é type="button"
        onClick={handleSubmit}
        className="btn-save"
        disabled={loading}
      >
        {loading ? (
          <>
            <i className="fas fa-spinner fa-spin"></i> Salvando...
          </>
        ) : (
          <>
            <i className="fas fa-save"></i> Salvar Alterações
          </>
        )}
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="btn-cancel"
      >
        <i className="fas fa-times"></i> Cancelar
      </button>
    </>
  ) : (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="btn-edit"
    >
      <i className="fas fa-edit"></i> Editar Perfil
    </button>
  )}
</div>
        </form>
      </div>
    </div>
  );
};

export default UserProfilePage;