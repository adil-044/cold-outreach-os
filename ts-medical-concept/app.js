(() => {
  const tabs = [...document.querySelectorAll(".path-tab")];
  const panels = [...document.querySelectorAll(".path-panel")];

  function activate(path) {
    tabs.forEach((tab) => {
      const on = tab.dataset.path === path;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach((panel) => {
      const on = panel.dataset.panel === path;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activate(tab.dataset.path));
  });
})();
