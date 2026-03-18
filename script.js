const revealElements = document.querySelectorAll(".reveal");
const topbar = document.querySelector(".topbar");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const navLinks = document.querySelectorAll("[data-nav-link]");

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

const getScrollOffset = () => {
  if (!topbar) {
    return 24;
  }

  return topbar.getBoundingClientRect().height + 22;
};

const smoothScrollToElement = (element) => {
  if (!element) {
    return;
  }

  const nextTop = window.scrollY + element.getBoundingClientRect().top - getScrollOffset();

  window.scrollTo({
    top: Math.max(nextTop, 0),
    behavior: "smooth",
  });
};

const setMenuOpen = (isOpen) => {
  if (!menuToggle || !mobileNav) {
    return;
  }

  mobileNav.classList.toggle("is-nav-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
};

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
      smoothScrollToElement(servicesPanel);
    }, 120);
  }
};

if (servicesToggle && servicesPanel) {
  servicesToggle.addEventListener("click", () => {
    const isOpen = servicesToggle.getAttribute("aria-expanded") === "true";
    setServicesOpen(!isOpen, { scrollIntoView: !isOpen });
  });

  servicesLinks.forEach((link) => {
    if (link.hasAttribute("data-nav-link")) {
      return;
    }

    link.addEventListener("click", (event) => {
      event.preventDefault();
      setServicesOpen(true, { scrollIntoView: true });
    });
  });

  if (window.location.hash === "#competences-panel") {
    setServicesOpen(true);
  }
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");

    if (!href) {
      setMenuOpen(false);
      return;
    }

    if (link.hasAttribute("data-open-services")) {
      event.preventDefault();
      setServicesOpen(true, { scrollIntoView: true });
      setMenuOpen(false);
      return;
    }

    if (href.startsWith("#")) {
      const target = document.querySelector(href);

      if (!target) {
        return;
      }

      event.preventDefault();
      smoothScrollToElement(target);

      if (window.history?.replaceState) {
        window.history.replaceState(null, "", href);
      }
    }

    setMenuOpen(false);
  });
});

document.addEventListener("click", (event) => {
  if (!mobileNav || !mobileNav.classList.contains("is-nav-open")) {
    return;
  }

  if (mobileNav.contains(event.target)) {
    return;
  }

  setMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuOpen(false);
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 820) {
    setMenuOpen(false);
  }
});
