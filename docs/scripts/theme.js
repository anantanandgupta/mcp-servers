const STORAGE_KEY = "theme";
const LIGHT = "mcp";
const DARK = "mcpdark";

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === DARK ? DARK : LIGHT;
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    // Storage can be unavailable in private modes; the theme still applies for this page.
  }
  const button = document.getElementById("theme-toggle");
  if (button) button.setAttribute("aria-pressed", theme === DARK ? "true" : "false");
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("theme-toggle");
  if (!button) return;
  button.setAttribute("aria-pressed", currentTheme() === DARK ? "true" : "false");
  button.addEventListener("click", () => {
    applyTheme(currentTheme() === DARK ? LIGHT : DARK);
  });
});
