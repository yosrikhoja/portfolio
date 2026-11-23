/** Header background on scroll, mobile menu, and active-section highlighting. */

function initHeader() {
  const header = document.getElementById("site-header");
  if (!header) return;
  const update = () => header.classList.toggle("scrolled", window.scrollY > 24);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function initMenu() {
  const menuButton = document.querySelector(".menu-toggle");
  const navLinks = document.getElementById("primary-links");
  if (!menuButton || !navLinks) return;

  const setMenu = open => {
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navLinks.classList.toggle("open", open);
  };

  menuButton.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });

  navLinks.addEventListener("click", event => {
    if (event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && navLinks.classList.contains("open")) {
      setMenu(false);
      menuButton.focus();
    }
  });

  // Reset the menu when leaving the mobile layout.
  const mobileQuery = window.matchMedia("(max-width: 760px)");
  const onBreakpoint = () => { if (!mobileQuery.matches) setMenu(false); };
  if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", onBreakpoint);
  else mobileQuery.addListener(onBreakpoint);
}

function initActiveSection() {
  if (!("IntersectionObserver" in window)) return;
  const navAnchors = [...document.querySelectorAll(".nav-link")];
  const sections = [...document.querySelectorAll("main section[id]")];
  const inBand = new Set();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) inBand.add(entry.target);
      else inBand.delete(entry.target);
    });
    const current = sections.find(section => inBand.has(section));
    const activeHref = current ? `#${current.id}` : null;
    navAnchors.forEach(link => {
      const isActive = link.getAttribute("href") === activeHref;
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
      link.classList.toggle("active", isActive);
    });
  }, { rootMargin: "-25% 0px -65% 0px", threshold: 0 });

  sections.forEach(section => observer.observe(section));
}

export function initNavigation() {
  initHeader();
  initMenu();
  initActiveSection();
}
