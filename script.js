const revealElements = document.querySelectorAll(".reveal");

revealElements.forEach((element, index) => {
  element.style.setProperty("--delay", `${index * 90}ms`);
});

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -10% 0px",
  }
);

revealElements.forEach((element) => revealObserver.observe(element));

document.querySelectorAll("[data-panel]").forEach((panel) => {
  panel.addEventListener("pointermove", (event) => {
    const bounds = panel.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    panel.style.setProperty("--glow-x", `${x}%`);
    panel.style.setProperty("--glow-y", `${y}%`);
  });

  panel.addEventListener("pointerleave", () => {
    panel.style.removeProperty("--glow-x");
    panel.style.removeProperty("--glow-y");
  });
});

const servicesToggle = document.querySelector("[data-services-toggle]");
const servicesPanel = document.querySelector("[data-services-panel]");
const servicesLinks = document.querySelectorAll("[data-open-services]");

const setServicesOpen = (isOpen, options = {}) => {
  if (!servicesToggle || !servicesPanel) {
    return;
  }

  const { scrollIntoView = false } = options;

  servicesToggle.setAttribute("aria-expanded", String(isOpen));
  servicesPanel.classList.toggle("is-open", isOpen);
  servicesPanel.setAttribute("aria-hidden", String(!isOpen));

  if (window.history?.replaceState) {
    const nextHash = isOpen ? "#competences-panel" : "#services";
    window.history.replaceState(null, "", nextHash);
  }

  if (isOpen && scrollIntoView) {
    window.setTimeout(() => {
      servicesPanel.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);
  }
};

if (servicesToggle && servicesPanel) {
  servicesToggle.addEventListener("click", () => {
    const isOpen = servicesToggle.getAttribute("aria-expanded") === "true";
    setServicesOpen(!isOpen, { scrollIntoView: !isOpen });
  });

  servicesLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      setServicesOpen(true, { scrollIntoView: true });
    });
  });

  if (window.location.hash === "#competences-panel") {
    setServicesOpen(true);
  }
}
