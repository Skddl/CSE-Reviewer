const root = document.documentElement;
const themeToggle = document.querySelector('#themeToggle');
const year = document.querySelector('#year');

try {
  const savedTheme = localStorage.getItem('skddl-portfolio-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') root.dataset.theme = savedTheme;
} catch {
  // The portfolio still works if browser storage is unavailable.
}

themeToggle?.setAttribute('aria-label', `Switch to ${root.dataset.theme === 'dark' ? 'light' : 'dark'} theme`);

themeToggle?.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  themeToggle.setAttribute('aria-label', `Switch to ${nextTheme === 'dark' ? 'light' : 'dark'} theme`);
  try {
    localStorage.setItem('skddl-portfolio-theme', nextTheme);
  } catch {
    // Theme switching remains available for this visit.
  }
});

if (year) year.textContent = new Date().getFullYear();

