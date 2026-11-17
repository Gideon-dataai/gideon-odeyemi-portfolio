(() => {
  "use strict";
  const menuToggle = document.getElementById("menuToggle");
  const navigation = document.getElementById("navigation");

  const closeMenu = () => {
    if (!menuToggle || !navigation) return;
    navigation.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    menuToggle.textContent = "☰";
  };

  if (menuToggle && navigation) {
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    menuToggle.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("active");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
      menuToggle.textContent = isOpen ? "×" : "☰";
    });
    navigation.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });
    document.addEventListener("click", e => {
      if (navigation.classList.contains("active") && !navigation.contains(e.target) && !menuToggle.contains(e.target)) closeMenu();
    });
  }

  const grid = document.getElementById("projectGrid");
  const buttons = [...document.querySelectorAll("[data-filter]")];
  const feedback = document.getElementById("filterFeedback");
  if (grid && buttons.length) {
    const cards = [...grid.querySelectorAll("[data-category]")];
    const update = filter => {
      let visible = 0;
      cards.forEach(card => {
        const show = filter === "all" || card.dataset.category === filter;
        card.hidden = !show;
        if (show) visible++;
      });
      buttons.forEach(button => {
        const selected = button.dataset.filter === filter;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      if (feedback) feedback.textContent = visible + (visible === 1 ? " project shown." : " projects shown.");
    };
    buttons.forEach(button => button.addEventListener("click", () => update(button.dataset.filter)));
    update("all");
  }
  const yearElement = document.getElementById("year");
  if (yearElement) yearElement.textContent = String(new Date().getFullYear());
})();
