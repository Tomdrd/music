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

