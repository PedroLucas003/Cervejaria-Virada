import React, { useEffect } from 'react';
import './HeroBanner.css'; // Certifique-se que este CSS não está interferindo com overflow ou scroll

const HeroBanner = () => {
  useEffect(() => {
    // Animação inicial do conteúdo do hero banner
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) { // Verifica se o elemento existe antes de manipulá-lo
      heroContent.style.opacity = 0;
      heroContent.style.transform = 'translateY(20px)';

      setTimeout(() => {
        heroContent.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        heroContent.style.opacity = 1;
        heroContent.style.transform = 'translateY(0)';
      }, 100); // Pequeno delay para garantir a aplicação da transição
    } else {
      console.warn("HeroBanner: Elemento .hero-content não encontrado para animação inicial.");
    }
  }, []); // Array de dependências vazio para rodar apenas no mount

  const scrollToCervejas = () => {
    const element = document.getElementById('cervejas-section');
    const button = document.querySelector('.cta-button'); // O botão que foi clicado

    // Log para verificar se o elemento alvo foi encontrado
    console.log('Tentando encontrar o elemento #cervejas-section:', element);

    if (!element) {
      console.error('Elemento com ID "cervejas-section" não foi encontrado no DOM. A rolagem não pode ser executada.');
      // Poderia adicionar um alerta para o usuário ou outra forma de feedback
      // alert('A seção de cervejas ainda não carregou, tente novamente em um instante.');
      return; // Interrompe a função se o elemento não for encontrado
    }

    // Animação do botão (opcional, mas mantida do seu código original)
    if (button) {
      button.classList.add('button-clicked');
      setTimeout(() => {
        button.classList.remove('button-clicked');
      }, 300);
    }

    // Cálculo da posição do elemento de destino
    // getBoundingClientRect().top dá a posição relativa à viewport
    // window.pageYOffset (ou window.scrollY) dá a quantidade de rolagem atual da página
    // Somando os dois, obtemos a posição absoluta do topo do elemento na página.
    const topPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offset = 30; // Ajuste para compensar um header fixo ou dar um espaço acima da seção

    console.log(`Rolando para: ${topPosition - offset} (Elemento top: ${element.getBoundingClientRect().top}, PageYOffset: ${window.pageYOffset})`);

    window.scrollTo({
      top: topPosition - offset,
      behavior: 'smooth'
    });

    // Animação de 'scroll-activated' no elemento de destino (opcional)
    // Adia um pouco para permitir que a rolagem comece/termine
    setTimeout(() => {
      if (element) { // Verifica novamente, pois o estado do DOM pode mudar
        element.classList.add('scroll-activated');
        setTimeout(() => {
          element.classList.remove('scroll-activated');
        }, 1000); // Duração da animação 'scroll-activated'
      }
    }, 700); // Delay para iniciar esta animação após o início da rolagem suave
  };

  return (
    <section className="hero-banner">
      <div className="hero-overlay"></div>
      <div className="hero-content-container">
        <div className="hero-content">
          <div className="brand-name">
            <div className="cervejaria">Cervejaria</div>
            <div className="virada">Vir<span className="inverted-a">a</span>da</div>
          </div>
          <p className="subtitle">Artesanal • Autêntica • Inesquecível</p>
          <button
            className="cta-button"
            onClick={scrollToCervejas}
            aria-label="Conheça nossas cervejas"
          >
            <span className="button-text">Conheça Nossas Cervejas</span>
            <span className="button-icon">↓</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;