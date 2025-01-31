const express = require('express');
const axios = require('axios');  // Import axios for making HTTP requests
const app = express();
const PORT = process.env.PORT || 3000;
const dotenv = require('dotenv');  // Load dotenv package
dotenv.config({ path: './config.env' });

const weatherAccessToken = process.env.WEATHER_API_KEY

// Middleware to parse JSON request body
app.use(express.json());

app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name || 'Guest';
    // let clientIp = req.ip;  // This gives you the IP address of the requester
    
    const accessToken = process.env.ACCESS_TOKEN;

    // Example of checking X-Forwarded-For header for client IP address
    let clientIpp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // console.log(clientIpp)

    // Normalize IPv4-mapped IPv6 address to IPv4 format (if needed)
    /*
    if (clientIp.startsWith('::ffff:')) {
        clientIp = clientIp.substring(7); // Remove the '::ffff:' prefix
    }
    */

    try {
        // Fetch geolocation data based on IP address from ipinfo.io

        const getCity = await axios.get(`http://ip-api.com/json/${clientIpp}?fields=61439`)
        // console.log(getCity)

        const { city } = getCity.data;
        // console.log({'city': city, 'country ': country})

        const apiUrl = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherAccessToken}&units=metric`);
        // console.log(apiUrl)
        

        // Prepare the response object
        let greeting = `Hello, ${visitorName}!, the temperature is ${apiUrl.data.main.temp} degrees Celsius`;
        if (city) {
            greeting += ` in ${city}`;
        }

        const responseData = {
            client_ip: clientIpp,
            location: city || 'Unknown',  // Use city from ipinfo.io response (or default to 'Unknown')
            greeting: greeting
        };

        // Send the response as JSON
        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error fetching IP geolocation:', error);
        res.status(500).json({ error: 'Failed to fetch IP geolocation' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
