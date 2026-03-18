const pageKey = document.body.dataset.page || "home";
const isHomePage = pageKey === "home";

const getInitialActiveNavKey = () => {
  if (pageKey === "portfolio") {
    return "portfolio";
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

  if (window.location.hash === "#competences-panel") {
    return "expertises";
  }

  if (window.location.hash === "#apropos") {
    return "about";
  }

  if (window.location.hash === "#contact-section") {
    return "contact";
  }

  return null;
};

const buildSharedNavigation = () => {
  const navSlot = document.querySelector("[data-site-nav]");

  if (!navSlot) {
    return;
  }

  const activeKey = getInitialActiveNavKey();
  const brandHref = isHomePage ? "#accueil" : "index.html";
  const navItems = [
    {
      key: "portfolio",
      label: "Portfolio",
      href: isHomePage ? "#projets" : "experience-professionnelle.html",
    },
    {
      key: "expertises",
      label: "Expertises",
      href: isHomePage ? "#competences-panel" : "index.html#competences-panel",
      openServices: isHomePage,
    },
    {
      key: "about",
      label: "\u00c0 propos",
      href: isHomePage ? "#apropos" : "certification.html",
    },
    {
      key: "contact",
      label: "Contact",
      href: isHomePage ? "#contact-section" : "contact.html",
    },
    {
      key: "cv",
      label: "CV",
      href: "docs/quentin-nicol-cv.pdf",
      cta: true,
      external: true,
    },
  ];

  const linksMarkup = navItems
    .map((item) => {
      const classes = item.cta ? ' class="topnav__cta"' : "";
      const activeAttr =
        !item.cta && activeKey && item.key === activeKey ? ' aria-current="page"' : "";
      const externalAttrs = item.external ? ' target="_blank" rel="noreferrer"' : "";
      const servicesAttr = item.openServices ? " data-open-services" : "";

      return `
        <a
          ${classes}
          href="${item.href}"
          data-nav-link
          data-nav-key="${item.key}"${servicesAttr}${activeAttr}${externalAttrs}
        >
          ${item.label}
        </a>
      `;
    })
    .join("");

  navSlot.innerHTML = `
    <header class="topbar reveal" data-mobile-nav>
      <div class="topbar__primary">
        <a class="brand" href="${brandHref}" aria-label="Retour \u00e0 l'accueil">
          <span class="brand__mark">QN</span>
          <span class="brand__text">
            <strong>Nicol Quentin</strong>
            <span>Portfolio num\u00e9rique</span>
          </span>
        </a>

        <button
          class="menu-toggle"
          type="button"
          aria-expanded="false"
          aria-controls="site-nav"
          aria-label="Ouvrir le menu"
          data-menu-toggle
        >
          <span class="menu-toggle__line"></span>
          <span class="menu-toggle__line"></span>
          <span class="menu-toggle__line"></span>
        </button>
      </div>

      <nav class="topnav" id="site-nav" aria-label="Navigation principale">
        ${linksMarkup}
      </nav>
    </header>
  `;
};

buildSharedNavigation();

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
  document.body.classList.toggle("menu-open", isOpen);
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

  if (isHomePage) {
    setActiveNavLink(isOpen ? "expertises" : getInitialActiveNavKey());
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
    if (link.dataset.navKey) {
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
    const key = link.dataset.navKey;

    if (!href) {
      setMenuOpen(false);
      return;
    }

    if (link.hasAttribute("data-open-services")) {
      event.preventDefault();
      setMenuOpen(false);
      setActiveNavLink("expertises");
      setServicesOpen(true, { scrollIntoView: true });
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
