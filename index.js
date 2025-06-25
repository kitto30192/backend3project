import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import WebsiteTrack from './db.js';
import dns from 'dns';
import { URL } from 'url';
var app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Add body parser middleware
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/post', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Generate a random number for shorturl (you might want to implement a better system)
    const shorturl = Math.floor(Math.random() * 10000);

    const newEntry = new WebsiteTrack({
      url: url,
      shorturl: shorturl
    });

    const savedEntry = await newEntry.save();

    res.json({ 
      original_url: savedEntry.url,
      short_url: savedEntry.shorturl
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to insert', details: err.message });
  }
});

app.post('/api/shorturl', async (req, res) => {
  try {
    const url = req.body.url;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Parse URL and get hostname
    let hostname;
    try {
      hostname = new URL(url).hostname;
    } catch {
      return res.json({ error: 'invalid url' });
    }

    // ✅ Await DNS lookup
    const valid = await new Promise((resolve, reject) => {
      dns.lookup(hostname, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    // Count existing documents to generate short URL
    const count = await WebsiteTrack.countDocuments();
    const shorturl = count + 1;

    // Insert into MongoDB
    const newEntry = new WebsiteTrack({ url, shorturl });
    const savedEntry = await newEntry.save();

    // Response
    if (req.is('application/x-www-form-urlencoded')) {
      res.send(`<p>Short URL for <b>${savedEntry.url}</b> is: <b>${savedEntry.shorturl}</b></p>`);
    } else {
      res.json({
        original_url: savedEntry.url,
        short_url: savedEntry.shorturl
      });
    }

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'invalid url' });
  }
});



app.get('/api/shorturl/:short_url', async (req, res) => {
  const shortUrlId = parseInt(req.params.short_url);

  try {
    const entry = await WebsiteTrack.findOne({ shorturl: shortUrlId });

    if (!entry) {
      return res.status(404).json({ error: 'No short URL found for given input' });
    }

    // ✅ Redirect to the original URL
    res.redirect(entry.url);
  } catch (err) {
    console.error('Redirection error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});




app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


