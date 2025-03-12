  
import express from "express";  
import axios from "axios";  
import OpenAI from "openai";  
import dotenv from "dotenv";  

dotenv.config();  
const app = express();  
const PORT = process.env.PORT || 3000;  

const openai = new OpenAI({  
    baseURL: "https://models.inference.ai.azure.com",  
    apiKey: process.env.GITHUB_TOKEN  
});  

// Weather API Configuration  
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;  
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";  

// News API Configuration (AdaDerana RSS)  
const NEWS_API_URL = "https://www.adaderana.lk/rss.php";  

app.use(express.json());  

// Function to fetch weather  
async function getWeather(city) {  
    try {  
        const response = await axios.get(WEATHER_API_URL, {  
            params: { q: city, appid: WEATHER_API_KEY, units: "metric" }  
        });  
        const { temp } = response.data.main;  
        const { description } = response.data.weather[0];  
        return `The weather in ${city} is ${temp}°C with ${description}.`;  
    } catch (error) {  
        return "Sorry, I couldn't fetch the weather.";  
    }  
}  

// Function to fetch news  
async function getNews() {  
    try {  
        const response = await axios.get(NEWS_API_URL);  
        return "Latest news: " + response.data.slice(0, 300) + "...";  
    } catch (error) {  
        return "Sorry, I couldn't fetch the news.";  
    }  
}  

app.post("/chat", async (req, res) => {  
    const userMessage = req.body.message.toLowerCase();  

    if (userMessage.includes("weather")) {  
        const city = userMessage.split("in ")[1] || "Colombo";  
        const weather = await getWeather(city);  
        return res.json({ response: weather });  
    }  

    if (userMessage.includes("news")) {  
        const news = await getNews();  
        return res.json({ response: news });  
    }  

    // Default AI response  
    const response = await openai.chat.completions.create({  
        messages: [  
            { role: "system", content: "You are a helpful assistant." },  
            { role: "user", content: userMessage }  
        ],  
        model: "gpt-4o",  
        temperature: 1,  
        max_tokens: 4096,  
        top_p: 1  
    });  

    res.json({ response: response.choices[0].message.content });  
});  

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  
