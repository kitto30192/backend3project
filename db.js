import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config();

if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
}

const websiteTrackSchema = new mongoose.Schema({
  url: String,
  shorturl: Number
});

const WebsiteTrack = mongoose.models.WebsiteTrack || mongoose.model('WebsiteTrack', websiteTrackSchema, 'websiteTrack');



export default WebsiteTrack;