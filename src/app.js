const navigation = document.querySelector('.site-nav');
const menu = document.querySelector('.menu-toggle');
const theme = document.querySelector('.theme-toggle');
const systemDark = matchMedia('(prefers-color-scheme: dark)');

function setMenu(open) {
  navigation.dataset.open = String(open);
  menu.setAttribute('aria-expanded', String(open));
}
navigation.dataset.menuReady = 'true';
menu.hidden = false;
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
navigation
  .querySelectorAll('a')
  .forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});
matchMedia('(min-width: 641px)').addEventListener('change', () => setMenu(false));

function syncTheme() {
  const dark = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === 'dark'
    : systemDark.matches;
  theme.setAttribute('aria-pressed', String(dark));
  theme.textContent = dark ? 'Ljust läge' : 'Mörkt läge';
}
try {
  const stored = localStorage.getItem('byggbart-theme');
  if (['light', 'dark'].includes(stored)) document.documentElement.dataset.theme = stored;
} catch {
  /* Systemtemat fungerar även om lokal lagring är blockerad. */
}
theme.hidden = false;
theme.addEventListener('click', () => {
  const next = theme.getAttribute('aria-pressed') === 'true' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem('byggbart-theme', next);
  } catch {
    /* Ingen lagring krävs. */
  }
  syncTheme();
});
systemDark.addEventListener('change', syncTheme);
syncTheme();
