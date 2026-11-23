import { initNavigation } from "./navigation.js";
import { initReveal } from "./reveal.js";
import { initConstellations } from "./constellation.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const year = document.getElementById("current-year");
if (year) year.textContent = String(new Date().getFullYear());

initNavigation();
initReveal({ reducedMotion });
initConstellations({ reducedMotion });
