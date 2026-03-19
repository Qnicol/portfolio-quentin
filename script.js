const pageKey = document.body.dataset.page || "home";

const getInitialActiveNavKey = () => {
  if (pageKey === "portfolio") {
    return "portfolio";
  }

  if (pageKey === "expertises") {
    return "expertises";
  }

  if (pageKey === "about") {
    return "about";
  }

  if (pageKey === "contact") {
    return "contact";
  }

  if (window.location.hash === "#projets") {
    return "portfolio";
  }

  return null;
};

const revealElements = document.querySelectorAll(".reveal");
const topbar = document.querySelector(".topbar");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const navLinks = document.querySelectorAll("[data-nav-link]");

const setActiveNavLink = (key) => {
  document.querySelectorAll("[data-nav-key]").forEach((link) => {
    if (key && link.dataset.navKey === key && link.dataset.navKey !== "cv") {
      link.setAttribute("aria-current", "page");
      return;
    }

    link.removeAttribute("aria-current");
  });
};

setActiveNavLink(getInitialActiveNavKey());

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
    threshold: 0.1,
    rootMargin: "200px 0px",
  }
);

revealElements.forEach((element) => {
  const containsMediaGallery = element.querySelector?.(
    "[data-image-collection], [data-video-collection]"
  );

  if (window.innerWidth < 768 && containsMediaGallery) {
    element.classList.add("is-visible");
    return;
  }

  revealObserver.observe(element);
});

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

document.querySelectorAll("[data-hover-preview-panel]").forEach((panel) => {
  const previewSurface = panel.querySelector("[data-preview-surface]");
  const previewCards = Array.from(panel.querySelectorAll("[data-preview-image]"));

  if (!previewSurface || !previewCards.length) {
    return;
  }

  const defaultCard = previewCards[0];

  const setPreview = (card) => {
    const image = card?.dataset.previewImage;
    const position = card?.dataset.previewPosition || "center center";

    if (!image) {
      return;
    }

    previewSurface.style.backgroundImage = `url("${image}")`;
    previewSurface.style.backgroundPosition = position;
    panel.classList.add("has-preview");

    previewCards.forEach((item) => {
      item.classList.toggle("is-preview-active", item === card);
    });
  };

  setPreview(defaultCard);

  previewCards.forEach((card) => {
    card.addEventListener("pointerenter", () => setPreview(card));
    card.addEventListener("focusin", () => setPreview(card));
  });

  panel.addEventListener("pointerleave", () => {
    if (window.matchMedia("(hover: hover)").matches) {
      setPreview(defaultCard);
    }
  });
});

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
  document.body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
};

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    const key = link.dataset.navKey;

    if (!href) {
      setMenuOpen(false);
      return;
    }

    if (href.startsWith("#")) {
      const target = document.querySelector(href);

      if (!target) {
        return;
      }

      event.preventDefault();
      setMenuOpen(false);

      if (key) {
        setActiveNavLink(key);
      }

      smoothScrollToElement(target);

      if (window.history?.replaceState) {
        window.history.replaceState(null, "", href);
      }

      return;
    }

    setMenuOpen(false);
  });
});

if (topbar) {
  const overlayNav = topbar.querySelector(".topnav");

  if (overlayNav) {
    overlayNav.addEventListener("click", (event) => {
      if (event.target === overlayNav) {
        setMenuOpen(false);
      }
    });
  }
}

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
