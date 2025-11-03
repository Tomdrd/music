const themeButton = document.getElementById('theme-switcher');
const body = document.body;
const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');
const themeIcon = themeButton.querySelector('i');
const logo = document.getElementById('logo');

// 🧩 Novos: meta tags dinâmicas
const metaThemeColor = document.getElementById('meta-theme-color');
const metaOgImage = document.getElementById('meta-og-image');

// 🌓 Função para aplicar o tema
function aplicarTema(tema) {
    if (tema === 'escuro') {
        body.classList.add('dark-mode');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        themeButton.setAttribute('aria-label', 'Alternar para tema claro');
        logo.src = 'imagens/logo-escura.webp';
        metaThemeColor.setAttribute('content', '#3a2e2a');
        metaOgImage.setAttribute('content', 'imagens/logo-escura.webp');
    } else {
        body.classList.remove('dark-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        themeButton.setAttribute('aria-label', 'Alternar para tema escuro');
        logo.src = 'imagens/logo-clara.webp';
        metaThemeColor.setAttribute('content', '#f5e6a8');
        metaOgImage.setAttribute('content', 'imagens/logo-clara.webp');
    }
    localStorage.setItem('tema', tema);
}

// 🔄 Carregar preferência salva
const temaSalvo = localStorage.getItem('tema');
if (temaSalvo) {
    aplicarTema(temaSalvo);
} else {
    aplicarTema('claro');
}

// 🖱️ Alternar Tema
themeButton.addEventListener('click', () => {
    const novoTema = body.classList.contains('dark-mode') ? 'claro' : 'escuro';
    aplicarTema(novoTema);
});

// 🍔 Menu hambúrguer
menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    const isMenuOpen = mainNav.classList.contains('open');
    menuToggle.querySelector('i').classList.toggle('fa-bars', !isMenuOpen);
    menuToggle.querySelector('i').classList.toggle('fa-times', isMenuOpen);
    menuToggle.setAttribute('aria-expanded', isMenuOpen);
});

// 📱 Fechar menu ao clicar em link (mobile)
mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            mainNav.classList.remove('open');
            menuToggle.querySelector('i').classList.remove('fa-times');
            menuToggle.querySelector('i').classList.add('fa-bars');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
});
