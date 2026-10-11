import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');

async function readJson(fileName) {
  return JSON.parse(await fs.readFile(path.join(dataDir, fileName), 'utf8'));
}

router.get('/', async (req, res) => {
  try {
    const [site, services, projects, testimonials, faq, stats] = await Promise.all([
      readJson('site.json'),
      readJson('services.json'),
      readJson('projects.json'),
      readJson('testimonials.json'),
      readJson('faq.json'),
      readJson('stats.json')
    ]);

    res.render('index', {
      title: `${site.company} | ${site.tagline}`,
      site,
      services,
      projects,
      testimonials,
      faq,
      stats
    });
  } catch (error) {
    console.error('Failed to load homepage content:', error);
    res.status(500).render('404', { site: req.app.locals.site, title: 'Content unavailable' });
  }
});

export default router;
