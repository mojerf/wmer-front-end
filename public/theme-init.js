// Runs before first paint (kept as an external file so a strict CSP can forbid inline scripts).
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var theme = null;
  try {
    theme = localStorage.getItem('theme');
  } catch (e) {}
  var light =
    theme === 'light' ||
    (theme !== 'dark' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches);
  root.classList.toggle('dark', !light);
})();
