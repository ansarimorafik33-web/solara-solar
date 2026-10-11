import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import morgan from 'morgan';
import indexRouter from './routes/index.js';
import aboutRouter from './routes/about.js';
import contactRouter from './routes/contact.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 3000);
const isProd = process.env.NODE_ENV === 'production';
const submissionsPath = path.join(__dirname, 'data', 'submissions.json');

async function readJson(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch {
    return [];
  }
}

async function ensureFiles() {
  const dataDir = path.join(__dirname, 'data');
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(submissionsPath);
  } catch {
    await fs.writeFile(submissionsPath, JSON.stringify([], null, 2));
  }
}

await ensureFiles();
const SITE = await readJson(path.join(__dirname, 'data', 'site.json'));

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please wait a moment and try again.' }
});

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}

function sanitizeString(value) {
  if (typeof value !== 'string') return '';
  return escapeHtml(value.trim());
}

function createSubmission(type, payload) {
  return {
    id: globalThis.crypto && globalThis.crypto.randomUUID ? globalThis.crypto.randomUUID() : `sub-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    name: sanitizeString(payload.name),
    email: sanitizeString(payload.email).toLowerCase(),
    phone: sanitizeString(payload.phone),
    propertyType: sanitizeString(payload.propertyType),
    message: sanitizeString(payload.message),
    createdAt: new Date().toISOString()
  };
}

async function appendSubmission(type, payload) {
  const entries = await readJson(submissionsPath);
  entries.push(createSubmission(type, payload));
  await fs.writeFile(submissionsPath, JSON.stringify(entries, null, 2));
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan(isProd ? 'combined' : 'dev'));

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: isProd ? '7d' : 0,
  etag: true,
  lastModified: true
}));

app.use('/vendor', express.static(path.join(__dirname, 'node_modules'), {
  maxAge: '7d',
  etag: true,
  index: false,
  redirect: false
}));

app.use((req, res, next) => {
  res.locals.site = SITE;
  res.locals.currentYear = new Date().getFullYear();
  res.locals.path = req.path;
  next();
});

const quoteValidators = [
  body('name').trim().isLength({ min: 2 }).withMessage('Your name is required.'),
  body('email').isEmail().withMessage('Please enter a valid email address.'),
  body('phone').optional({ values: 'falsy' }).isLength({ min: 7 }).withMessage('A valid phone number is required.'),
  body('propertyType').trim().notEmpty().withMessage('Please select a property type.'),
  body('message').trim().isLength({ min: 12 }).withMessage('Tell us a little more about your project.'),
  body('honeypot').optional({ values: 'falsy' }).isEmpty().withMessage('Invalid submission.')
];

const contactValidators = [
  body('name').trim().isLength({ min: 2 }).withMessage('Your name is required.'),
  body('email').isEmail().withMessage('Please enter a valid email address.'),
  body('message').trim().isLength({ min: 10 }).withMessage('Please add a short message.'),
  body('honeypot').optional({ values: 'falsy' }).isEmpty().withMessage('Invalid submission.')
];

app.post('/api/quote', formLimiter, quoteValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((error) => ({ field: error.path, message: error.msg }))
    });
  }

  try {
    await appendSubmission('quote', req.body);
    console.log('[quote-submission]', JSON.stringify({ name: req.body.name, email: req.body.email }));
    return res.status(200).json({ success: true, message: 'Thanks — your solar consultation request has been received.' });
  } catch (error) {
    console.error('[quote-submission-error]', error);
    return res.status(500).json({ success: false, error: 'Unable to save your quote request right now.' });
  }
});

app.post('/api/contact', formLimiter, contactValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((error) => ({ field: error.path, message: error.msg }))
    });
  }

  try {
    await appendSubmission('contact', req.body);
    console.log('[contact-submission]', JSON.stringify({ name: req.body.name, email: req.body.email }));
    return res.status(200).json({ success: true, message: 'Thanks — our team will be in touch within one business day.' });
  } catch (error) {
    console.error('[contact-submission-error]', error);
    return res.status(500).json({ success: false, error: 'Unable to send your message right now.' });
  }
});

app.use('/', indexRouter);
app.use('/about', aboutRouter);
app.use('/contact', contactRouter);

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n');
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/</loc></url>
  <url><loc>https://example.com/about</loc></url>
  <url><loc>https://example.com/contact</loc></url>
</urlset>`);
});

app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page not found',
    site: SITE
  });
});

app.listen(port, () => {
  console.log(`Solara server running at http://localhost:${port}`);
});

export default app;
