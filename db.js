import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// models/WebsiteTrack.js


const websiteTrackSchema = new mongoose.Schema({
  url: String,
  shorturl: Number
});

// ✅ Correct in ESM
const WebsiteTrack = mongoose.model('WebsiteTrack', websiteTrackSchema, 'websiteTrack');



export default WebsiteTrack;