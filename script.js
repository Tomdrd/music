/* script.js - versão robusta para header/footer dinâmicos
   - carrega header/footer
   - inicializa tema (localStorage)
   - delega eventos para funcionar mesmo com elementos dinâmicos
   - logs para debug
*/

async function carregarLayout() {
  try {
    // Carrega header e footer (mesma pasta)
    const [hdrResp, ftrResp] = await Promise.all([
      fetch('header.html'),
      fetch('footer.html')
    ]);

    if (!hdrResp.ok) throw new Error('header.html não encontrado (' + hdrResp.status + ')');
    if (!ftrResp.ok) throw new Error('footer.html não encontrado (' + ftrResp.status + ')');

    const headerHTML = await hdrResp.text();
    const footerHTML = await ftrResp.text();

    document.getElementById('header-container').innerHTML = headerHTML;
    document.getElementById('footer-container').innerHTML = footerHTML;

    console.log('Layout carregado: header e footer inseridos no DOM.');
  } catch (err) {
    console.error('Erro ao carregar layout:', err);
  } finally {
    // Sempre inicializa os scripts globais após tentativa de carregar (mesmo se falhar, para tentar recuperar)
    inicializarScriptsGlobais();
  }
}

function inicializarScriptsGlobais() {
  // Seletores dinâmicos (serão buscados no momento do evento quando necessário)
  const metaThemeColor = document.getElementById('meta-theme-color');
  const metaOgImage = document.getElementById('meta-og-image');

  // Funções utilitárias
  function setTemaEscuro() {
    document.body.classList.add('dark-mode');
    updateThemeIcon('moon');
    trocaLogo('imagens/logo-escura.webp');
    if (metaThemeColor) metaThemeColor.setAttribute('content', '#3a2e2a');
    if (metaOgImage) metaOgImage.setAttribute('content', 'imagens/logo-escura.webp');
    localStorage.setItem('tema', 'escuro');
  }

  function setTemaClaro() {
    document.body.classList.remove('dark-mode');
    updateThemeIcon('sun');
    trocaLogo('imagens/logo-clara.webp');
    if (metaThemeColor) metaThemeColor.setAttribute('content', '#f5e6a8');
    if (metaOgImage) metaOgImage.setAttribute('content', 'imagens/logo-clara.webp');
    localStorage.setItem('tema', 'claro');
  }

  function updateThemeIcon(kind) {
    // tenta atualizar o ícone do botão de tema se existir
    const btn = document.getElementById('theme-switcher');
    if (!btn) return;
    const i = btn.querySelector('i');
    if (!i) return;
    i.classList.remove('fa-sun', 'fa-moon');
    i.classList.add(kind === 'moon' ? 'fa-moon' : 'fa-sun');
    btn.setAttribute('aria-label', kind === 'moon' ? 'Alternar para tema claro' : 'Alternar para tema escuro');
  }

  function trocaLogo(path) {
    const logo = document.getElementById('logo');
    if (logo) logo.src = path;
  }

  // Aplica tema salvo (ou padrão claro)
  const temaSalvo = localStorage.getItem('tema') || 'claro';
  if (temaSalvo === 'escuro') setTemaEscuro(); else setTemaClaro();
  console.log('Tema aplicado:', temaSalvo);

  // === Event delegation: trata clicks no documento para elementos dinamicamente inseridos ===
  document.addEventListener('click', (e) => {
    const target = e.target;

    // 1) Botão de alternar tema (#theme-switcher) — aceita clique no botão ou no ícone interno
    if (target.closest && target.closest('#theme-switcher')) {
      const isDark = document.body.classList.contains('dark-mode');
      if (isDark) setTemaClaro(); else setTemaEscuro();
      return;
    }

    // 2) Menu hambúrguer (#menu-toggle)
    if (target.closest && target.closest('#menu-toggle')) {
      const mainNav = document.getElementById('main-nav');
      const menuToggle = document.getElementById('menu-toggle');
      if (!mainNav || !menuToggle) return;
      mainNav.classList.toggle('open');
      const isMenuOpen = mainNav.classList.contains('open');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars', !isMenuOpen);
        icon.classList.toggle('fa-times', isMenuOpen);
      }
      menuToggle.setAttribute('aria-expanded', isMenuOpen ? 'true' : 'false');
      return;
    }

    // 3) Links do menu: fecha o menu em mobile quando clicados
    if (target.closest && target.closest('#main-nav a')) {
      const mainNav = document.getElementById('main-nav');
      const menuToggle = document.getElementById('menu-toggle');
      if (mainNav && menuToggle && window.innerWidth <= 768) {
        mainNav.classList.remove('open');
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
        menuToggle.setAttribute('aria-expanded', 'false');
      }
      return;
    }

    // 4) Se você tiver botões específicos na página (ex: um botão do sobre.html),
    // trate aqui por id ou classe. Exemplo:
    // if (target.closest && target.closest('#meu-botao-sobre')) { ... }
  });

  // === Accessibility: garante que teclas Enter/Space também funcionem para controles via teclado ===
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement) {
      const el = document.activeElement;
      if (el.id === 'theme-switcher' || el.id === 'menu-toggle') {
        el.click();
        e.preventDefault();
      }
    }
  });

  // debug: mostra se os elementos esperados existem agora
  setTimeout(() => {
    console.log('Estado após inicialização: ',
      {
        themeSwitcher: !!document.getElementById('theme-switcher'),
        menuToggle: !!document.getElementById('menu-toggle'),
        mainNav: !!document.getElementById('main-nav'),
        logo: !!document.getElementById('logo')
      }
    );
  }, 200);
}

// Inicia o carregamento do layout (chama inicializarScriptsGlobais ao final)
carregarLayout();

// Mostrar o footer apenas quando o usuário chega perto do final
window.addEventListener('scroll', () => {
  const footer = document.querySelector('footer');
  if (!footer) return;

  const scrollPos = window.scrollY + window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;

  // Quando o usuário chega a 90% do fim da página
  if (scrollPos >= docHeight * 0.9) {
    footer.classList.add('visivel');
  } else {
    footer.classList.remove('visivel');
  }
});

/* Substitua o bloco DOMContentLoaded antigo pelo seguinte no seu script.js */

document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('audio-player');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const seekSlider = document.getElementById('seek-bar');
  const currentTimeContainer = document.getElementById('current-time');
  const durationContainer = document.getElementById('duration');
  const downloadBtn = document.getElementById('download-btn');
  const icon = playPauseBtn ? playPauseBtn.querySelector('i') : null;

  if (!audio || !playPauseBtn || !seekSlider || !icon) {
      console.warn("Player de áudio não encontrado ou elementos essenciais ausentes.");
      return; // Sai da função se os elementos não existirem
  }
  
  // --- Funções de Ajuda ---

  // Converte segundos para formato MM:SS
  const formatTime = (secs) => {
      const minutes = Math.floor(secs / 60);
      const seconds = Math.floor(secs % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  
  // Atualiza a barra de progresso (a cor antes do thumb)
  const updateSeekStyle = (value, max) => {
      const percentage = (value / max) * 100;
      // Define o background customizado para simular a cor "preenchida"
      // Usa a variável CSS --cor-link para o preenchimento
      seekSlider.style.background = `linear-gradient(to right, var(--cor-link) 0%, var(--cor-link) ${percentage}%, var(--cor-fundo-secundario) ${percentage}%, var(--cor-fundo-secundario) 100%)`;
  }

  // --- Event Listeners ---

  // 1. Botão Play/Pause
  playPauseBtn.addEventListener('click', () => {
      if (audio.paused) {
          audio.play();
          icon.classList.replace('fa-play', 'fa-pause');
      } else {
          audio.pause();
          icon.classList.replace('fa-pause', 'fa-play');
      }
  });

  // 2. Quando o áudio pode ser reproduzido (metadados carregados)
  audio.addEventListener('loadedmetadata', () => {
      const duration = Math.floor(audio.duration);
      // Define a duração máxima da barra
      seekSlider.max = duration;
      // Exibe a duração total
      if (durationContainer) durationContainer.textContent = formatTime(duration);
      // Inicializa o estilo da barra
      updateSeekStyle(0, duration);
  });

  // 3. Atualiza o tempo e a barra enquanto a música toca
  audio.addEventListener('timeupdate', () => {
      const current = Math.floor(audio.currentTime);
      // Atualiza o valor do input range
      seekSlider.value = current;
      // Atualiza o tempo atual na tela
      if (currentTimeContainer) currentTimeContainer.textContent = formatTime(current);
      // Atualiza o estilo da barra (progresso de cor)
      updateSeekStyle(current, seekSlider.max);
  });

  // 4. Pular para um ponto específico (arrastando a barra)
  seekSlider.addEventListener('input', () => {
      // Atualiza o estilo da barra e o tempo enquanto o usuário arrasta
      updateSeekStyle(seekSlider.value, seekSlider.max);
      if (currentTimeContainer) currentTimeContainer.textContent = formatTime(seekSlider.value);
  });

  // Quando o usuário solta o "thumb" na barra de progresso
  seekSlider.addEventListener('change', () => {
      // Move o áudio para a nova posição
      audio.currentTime = seekSlider.value;
  });

  // 5. Quando a música termina
  audio.addEventListener('ended', () => {
      icon.classList.replace('fa-pause', 'fa-play');
      audio.currentTime = 0; // Volta para o início
      seekSlider.value = 0;
      updateSeekStyle(0, seekSlider.max);
  });
  
  // 6. Download
  if (downloadBtn) {
    downloadBtn.addEventListener('click', (e) => {
      // Previne que o clique dispare outros eventos no player
      e.preventDefault(); 
      
      const link = document.createElement('a');
      link.href = audio.src;
      // Nome do arquivo para download. Você pode customizar!
      link.download = 'musica-a-estrutura-basica.mp3'; 
      link.click();
    });
  }

});