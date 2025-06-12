import React from 'react';

const ErrorPage = () => {
  return (
    <div className="container">
      <h1>Ocorreu um erro no pagamento</h1>
      <p>Por favor, tente novamente ou entre em contato conosco.</p>
      <button onClick={() => window.location.href = "/checkout"}>Tentar novamente</button>
    </div>
  );
};

export default ErrorPage;