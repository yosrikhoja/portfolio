# Yosri Khouja — Portfolio

Static personal portfolio site. No build step and no dependencies: plain HTML, CSS and ES modules.

## Structure

```
.
├── index.html              # Page markup
├── assets/
│   ├── css/styles.css      # All styles (tokens, layout, responsive, reduced motion)
│   ├── img/favicon.svg     # Shield logo favicon
│   └── js/
│       ├── js-detect.js    # Adds the "js" class in <head> (progressive enhancement)
│       ├── main.js         # Entry point (ES module)
│       ├── navigation.js   # Header, mobile menu, active-section highlight
│       ├── reveal.js       # Scroll-in reveal of sections
│       ├── constellation.js# Canvas particle animation
│       └── shapes.js       # Shape masks for the particles
├── vercel.json             # Security headers and URL settings
└── README.md
```

## Run locally

ES modules need to be served over HTTP (opening the file directly won't load them):

```bash
npx serve .
# or
python -m http.server 8000
```

## Deploy (Vercel)

```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production
```

Or push to GitHub and import the repo at vercel.com/new. Framework preset: **Other**, no build command, output directory: root.
