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
  const [site, contactInfo] = await Promise.all([
    readJson('site.json'),
    readJson('contact.json')
  ]);

  res.render('contact', {
    title: `Contact ${site.company}`,
    site,
    contactInfo
  });
});

export default router;
