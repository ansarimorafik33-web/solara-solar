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
  const [site, team, values, certifications] = await Promise.all([
    readJson('site.json'),
    readJson('team.json'),
    readJson('values.json'),
    readJson('certifications.json')
  ]);

  res.render('about', {
    title: `About ${site.company}`,
    site,
    team,
    values,
    certifications
  });
});

export default router;
