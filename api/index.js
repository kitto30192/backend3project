import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB, WebsiteTrack } from './db.js';
import dns from 'dns';
import { URL } from 'url';
import serverless from 'serverless-http';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API: POST /shorturl
app.post('/shorturl', async (req, res) => {
  try {
    await connectDB();

    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const hostname = new URL(url).hostname;
    await new Promise((resolve, reject) => {
      dns.lookup(hostname, (err) => (err ? reject(err) : resolve()));
    });

    const count = await WebsiteTrack.countDocuments();
    const shorturl = count + 1;
    const savedEntry = await WebsiteTrack.create({ url, shorturl });

    res.json({ original_url: savedEntry.url, short_url: savedEntry.shorturl });
  } catch (err) {
    res.status(500).json({ error: 'invalid url' });
  }
});

// API: GET /shorturl/:short_url
app.get('/shorturl/:short_url', async (req, res) => {
  try {
    await connectDB();

    const entry = await WebsiteTrack.findOne({ shorturl: parseInt(req.params.short_url) });
    if (!entry) return res.status(404).json({ error: 'No short URL found' });

    res.redirect(entry.url);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default serverless(app);






