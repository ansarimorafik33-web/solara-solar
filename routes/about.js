import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

async function readJson(fileName) {
  return JSON.parse(await fs.readFile(path.join(dataDir, fileName), 'utf8'));
}

router.get('/', async (req, res) => {
  const data = await Promise.all([
    readJson('site.json'),
    readJson('services.json'),
    readJson('projects.json'),
    readJson('testimonials.json'),
    readJson('faq.json'),
    readJson('stats.json'),
    readJson('team.json'),
    readJson('values.json')
  ]);

  const [site, services, projects, testimonials, faq, stats, team, values] = data;
  res.render('index', {
    title: `${site.company} | ${site.tagline}`,
    site,
    services,
    projects,
    testimonials,
    faq,
    stats,
    team,
    values
  });
});

export default router;
