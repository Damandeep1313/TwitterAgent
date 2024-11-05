const express = require('express');
const { TwitterApi } = require('twitter-api-v2'); // Make sure to install this package
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Middleware to validate Bearer Token
const validateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract the token from "Bearer <token>"
    if (!token) {
        return res.status(401).json({ message: "Invalid access token." });
    }

    // Instantiate Twitter client with the access token
    req.twitterClient = new TwitterApi(token); // Use the access token
    next();
};

// Route to post a tweet
app.post('/post-tweet', validateToken, async (req, res) => {
    const { text } = req.body; // Use 'text' instead of 'status' as per Twitter API v2

    if (!text) {
        return res.status(400).json({ message: "Text is required." });
    }

    try {
        // Post the tweet using the Twitter API v2 endpoint
        const tweet = await req.twitterClient.v2.tweet(text);
        res.json({ message: "Tweet posted successfully!", data: { tweetId: tweet.data.id } });
    } catch (error) {
        res.status(500).json({ message: "Error posting tweet", error: error.message });
    }
});

// Route to fetch recent tweets from the authenticated user's timeline
app.get('/fetch-tweets', validateToken, async (req, res) => {
    try {
        const tweets = await req.twitterClient.v2.userTimeline('your-twitter-user-id'); // Replace with actual user ID
        res.json({ message: "Tweets fetched successfully", tweets: tweets.data });
    } catch (error) {
        res.status(500).json({ message: "Error fetching tweets", error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
