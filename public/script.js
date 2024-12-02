document.getElementById('getWeather').addEventListener('click', getWeather);

async function getWeather() {
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value.trim().toLowerCase();
    const apiKey = '74aaa6ec9464d3af867774fd0ffe318d'; 
    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`;
    
    let geoResponse; 
    let lat; 
    let lon; 
    let geoData;
    let match;
    try {
        geoResponse = await fetch(geoUrl);
        if (!geoResponse.ok) {
            throw new Error('City not found'); 
        }
        geoData = await geoResponse.json();

        if (state) {
            match = geoData.find(
                loc => loc.state && loc.state.toLowerCase() === state
            );

            if (!match) {
                document.getElementById('weather').innerText = "No matching city in the specified state!";
                return;
            }
        } else {
            match = geoData[0]; // Default to the first result if no state is provided
        }

        lat = match.lat;
        lon = match.lon;
        console.log(geoData);
    } catch (error) {
        document.getElementById('weather').innerText = "City not found!";
        return; 
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Unable to retrieve weather data'); 
        }
        const data = await response.json(); 
        displayWeather(data, geoData, match); 
    } catch (error) {
        document.getElementById('weather').innerText = error.message; 
    }
}

function displayWeather(data, geoData, match) {
    const weatherResult = document.getElementById('weather');
    console.log(data);
    weatherResult.innerHTML = `
        <h2>Weather in ${data.name}, ${match.state}</h2>
        <p>Temperature: ${data.main.temp} °F</p>
        <p>Weather: ${data.weather[0].description}</p>
    `;
}
