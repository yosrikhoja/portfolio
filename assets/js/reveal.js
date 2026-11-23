/** Fades sections in as they enter the viewport. */
export function initReveal({ reducedMotion }) {
  const items = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window) || reducedMotion) {
    items.forEach(item => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });

  items.forEach(item => observer.observe(item));
}
