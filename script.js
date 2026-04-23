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

document.querySelectorAll(".competence-grid--interactive").forEach((grid) => {
  const cards = Array.from(grid.querySelectorAll(".competence-card"));

  if (!cards.length) {
    return;
  }

  const usesFinePointer = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const setSelectedCard = (nextCard) => {
    let hasSelected = false;

    cards.forEach((card) => {
      const isSelected = card === nextCard;
      card.classList.toggle("is-selected", isSelected);
      hasSelected ||= isSelected;
    });

    grid.classList.toggle("has-selection", hasSelected);
  };

  cards.forEach((card) => {
    card.addEventListener("pointerenter", () => {
      if (usesFinePointer()) {
        setSelectedCard(card);
      }
    });

    card.addEventListener("focusin", () => {
      setSelectedCard(card);
    });

    card.addEventListener("click", () => {
      if (usesFinePointer()) {
        return;
      }

      const shouldDeselect = card.classList.contains("is-selected");
      setSelectedCard(shouldDeselect ? null : card);
    });
  });

  grid.addEventListener("pointerleave", () => {
    if (usesFinePointer()) {
      setSelectedCard(null);
    }
  });

  document.addEventListener("click", (event) => {
    if (usesFinePointer()) {
      return;
    }

    if (grid.contains(event.target)) {
      return;
    }

    setSelectedCard(null);
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

const tiltSurfaces = document.querySelectorAll("[data-tilt-surface]");
const canUseTilt = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

tiltSurfaces.forEach((surface) => {
  surface.addEventListener("pointermove", (event) => {
    if (!canUseTilt()) {
      return;
    }

    const bounds = surface.getBoundingClientRect();
    const ratioX = (event.clientX - bounds.left) / bounds.width;
    const ratioY = (event.clientY - bounds.top) / bounds.height;
    const rotateY = (ratioX - 0.5) * 10;
    const rotateX = (0.5 - ratioY) * 10;

    surface.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(
      2
    )}deg) rotateY(${rotateY.toFixed(2)}deg)`;
  });

  surface.addEventListener("pointerleave", () => {
    surface.style.transform = "";
  });
});

const wowArena = document.querySelector("[data-wow-arena]");

if (
  wowArena &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches
) {
  wowArena.classList.add("is-wow-ready");

  const wowCards = wowArena.querySelectorAll(
    ".three-mode-card, .three-gallery-card, .three-pipeline-step, .three-lab-stage"
  );
  wowCards.forEach((card) => card.setAttribute("data-wow-card", ""));

  const magneticTargets = wowArena.querySelectorAll(".three-lab-cta, .tag-row a");
  magneticTargets.forEach((target) => target.setAttribute("data-magnetic", ""));

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let glowX = mouseX;
  let glowY = mouseY;
  let coreX = mouseX;
  let coreY = mouseY;

  const glow = document.createElement("span");
  glow.className = "wow-cursor-glow";
  document.body.appendChild(glow);

  const core = document.createElement("span");
  core.className = "wow-cursor-core";
  document.body.appendChild(core);

  const updateWowLights = (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    const arenaBounds = wowArena.getBoundingClientRect();
    const px = ((event.clientX - arenaBounds.left) / arenaBounds.width) * 100;
    const py = ((event.clientY - arenaBounds.top) / arenaBounds.height) * 100;

    wowArena.style.setProperty("--wow-x", `${px}%`);
    wowArena.style.setProperty("--wow-y", `${py}%`);

    const card = event.target.closest("[data-wow-card]");

    if (card) {
      const bounds = card.getBoundingClientRect();
      const cx = ((event.clientX - bounds.left) / bounds.width) * 100;
      const cy = ((event.clientY - bounds.top) / bounds.height) * 100;
      card.style.setProperty("--spot-x", `${cx}%`);
      card.style.setProperty("--spot-y", `${cy}%`);
    }
  };

  const animateCursor = () => {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    coreX += (mouseX - coreX) * 0.2;
    coreY += (mouseY - coreY) * 0.2;

    glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
    core.style.transform = `translate3d(${coreX}px, ${coreY}px, 0)`;

    requestAnimationFrame(animateCursor);
  };

  requestAnimationFrame(animateCursor);

  document.addEventListener("pointermove", updateWowLights);

  magneticTargets.forEach((target) => {
    target.addEventListener("pointermove", (event) => {
      const bounds = target.getBoundingClientRect();
      const x = event.clientX - bounds.left - bounds.width / 2;
      const y = event.clientY - bounds.top - bounds.height / 2;
      const mx = Math.max(-10, Math.min(10, x * 0.18));
      const my = Math.max(-8, Math.min(8, y * 0.16));
      target.style.setProperty("--mag-x", `${mx}px`);
      target.style.setProperty("--mag-y", `${my}px`);
    });

    target.addEventListener("pointerleave", () => {
      target.style.removeProperty("--mag-x");
      target.style.removeProperty("--mag-y");
    });
  });
}

const threeScenes = document.querySelectorAll("[data-3d-scene]");

threeScenes.forEach((scene) => {
  if (!canUseTilt()) {
    return;
  }

  scene.addEventListener("pointermove", (event) => {
    const bounds = scene.getBoundingClientRect();
    const ratioX = (event.clientX - bounds.left) / bounds.width;
    const ratioY = (event.clientY - bounds.top) / bounds.height;
    const rotateY = (ratioX - 0.5) * 22;
    const rotateX = (0.5 - ratioY) * 18;
    const shiftX = (ratioX - 0.5) * 16;
    const shiftY = (ratioY - 0.5) * 10;

    scene.style.setProperty("--scene-rotate-y", `${rotateY.toFixed(2)}deg`);
    scene.style.setProperty("--scene-rotate-x", `${rotateX.toFixed(2)}deg`);
    scene.style.setProperty("--scene-shift-x", `${shiftX.toFixed(2)}px`);
    scene.style.setProperty("--scene-shift-y", `${shiftY.toFixed(2)}px`);
  });

  scene.addEventListener("pointerleave", () => {
    scene.style.removeProperty("--scene-rotate-y");
    scene.style.removeProperty("--scene-rotate-x");
    scene.style.removeProperty("--scene-shift-x");
    scene.style.removeProperty("--scene-shift-y");
  });
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 820) {
    setMenuOpen(false);
  }
});
