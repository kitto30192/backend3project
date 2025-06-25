import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB, WebsiteTrack } from './db.js';
import dns from 'dns';
import { URL } from 'url';
import serverless from 'serverless-http';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// POST /shorturl — create a new short URL
app.post('/shorturl', async (req, res) => {
  try {
    await connectDB();

    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    let hostname;
    try {
      hostname = new URL(url).hostname;
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Timeout-safe DNS check
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('DNS lookup timed out')), 3000);
      dns.lookup(hostname, (err) => {
        clearTimeout(timeout);
        err ? reject(err) : resolve();
      });
    });

    const count = await WebsiteTrack.countDocuments();
    const shorturl = count + 1;
    const savedEntry = await WebsiteTrack.create({ url, shorturl });

    res.json({ original_url: savedEntry.url, short_url: savedEntry.shorturl });
  } catch (err) {
    console.error('POST /shorturl error:', err);
    res.status(500).json({ error: 'Invalid URL or server error' });
  }
});

// GET /shorturl/:short_url — redirect
app.get('/shorturl/:short_url', async (req, res) => {
  try {
    await connectDB();

    const short = parseInt(req.params.short_url);
    if (isNaN(short)) return res.status(400).json({ error: 'Invalid short URL id' });

    const entry = await WebsiteTrack.findOne({ shorturl: short });
    if (!entry) return res.status(404).json({ error: 'No short URL found' });

    res.redirect(entry.url);
  } catch (err) {
    console.error('GET /shorturl/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default serverless(app);







