# Solara

Award-style solar energy company website built with Node.js, Express, EJS, GSAP, and Three.js.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The site will run on `http://localhost:3000` by default.

## Scripts

- `npm run dev` — runs the app with nodemon
- `npm start` — starts the production server

## Project structure

```text
solara-solar/
├── data/
│   ├── site.json
│   ├── services.json
│   ├── projects.json
│   ├── testimonials.json
│   ├── faq.json
│   ├── stats.json
│   ├── team.json
│   ├── values.json
│   ├── certifications.json
│   ├── contact.json
│   └── submissions.json
├── public/
│   ├── css/
│   ├── js/
│   ├── img/
│   └── favicon.svg
├── routes/
│   ├── index.js
│   ├── about.js
│   └── contact.js
├── views/
│   ├── partials/
│   ├── index.ejs
│   ├── about.ejs
│   ├── contact.ejs
│   ├── 404.ejs
│   └── layout.ejs
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── server.js
└── public/img/placeholder-*.svg
```

## Editing content

Edit the JSON files inside `data/` to update the content displayed across the site. Each page reads from these shared files so you can keep the design and copy easily maintainable.

## Brand replacement

Update the brand name and meta values in `data/site.json`, and replace the placeholder art in `public/img/` with your own branded assets.
