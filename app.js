const apiKey = "e54c97994d83a02a432f27fd439d0230"; 
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const apiGeoUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric";

const searchBox = document.querySelector("#cityInput");
const searchBtn = document.querySelector("#searchBtn");
const locationBtn = document.querySelector("#locationBtn");
const historyContainer = document.querySelector("#history");
const weatherIcon = document.querySelector(".weather-icon");
let map; 


let searchHistory = JSON.parse(localStorage.getItem('weatherHistory')) || [];
renderHistory();


async function checkWeather(city) {
    try {
        const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
        
        if (response.status == 404) {
            document.querySelector(".error").style.display = "block";
            document.querySelector(".weather").style.display = "none";
        } else {
            const data = await response.json();
            updateUI(data);
            saveToHistory(data.name);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}


async function checkWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(`${apiGeoUrl}&lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const data = await response.json();
        updateUI(data);
        saveToHistory(data.name);
    } catch (error) {
        alert("Unable to fetch location weather");
    }
}


function updateUI(data) {
    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
    document.querySelector(".desc").innerHTML = data.weather[0].description;

   
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    
    const mainWeather = data.weather[0].main.toLowerCase();
    updateBackground(mainWeather);

    
    updateMap(data.coord.lat, data.coord.lon, data.name);

    document.querySelector(".weather").style.display = "block";
    document.querySelector(".error").style.display = "none";
}


function updateMap(lat, lon, cityName) {
    // 1. Initialize or Move Map
    if (!map) {
        map = L.map('map').setView([lat, lon], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);
    } else {
        map.flyTo([lat, lon], 10);
    }
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
    // -------------------------

    // 2. Add Marker
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    
    L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>${cityName}</b>`)
        .openPopup();
}

function updateBackground(weather) {
    let imageUrl = "";
    if (weather.includes("clear")) {
        imageUrl = "https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=2000&q=80"; // Sunny
    } else if (weather.includes("clouds")) {
        imageUrl = "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2000&q=80"; // Cloudy
    } else if (weather.includes("rain") || weather.includes("drizzle")) {
        imageUrl = "https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=2000&q=80"; // Rain
    } else if (weather.includes("mist") || weather.includes("haze")) {
        imageUrl = "https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?auto=format&fit=crop&w=2000&q=80"; // Fog
    } else {
        imageUrl = "https://images.unsplash.com/photo-1516912481808-54063b47e43b?auto=format&fit=crop&w=2000&q=80"; // Default
    }
    document.body.style.backgroundImage = `url('${imageUrl}')`;
}


function saveToHistory(city) {
    // Avoid duplicates and limit to 3 items
    if (!searchHistory.includes(city)) {
        searchHistory.unshift(city);
        if (searchHistory.length > 3) searchHistory.pop();
        localStorage.setItem('weatherHistory', JSON.stringify(searchHistory));
        renderHistory();
    }
}

function renderHistory() {
    historyContainer.innerHTML = "";
    searchHistory.forEach(city => {
        const chip = document.createElement("div");
        chip.classList.add("history-chip");
        chip.textContent = city;
        chip.addEventListener("click", () => checkWeather(city));
        historyContainer.appendChild(chip);
    });
}

// --- Event Listeners ---
searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
});

searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkWeather(searchBox.value);
});

locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                checkWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                alert("Location access denied or unavailable.");
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});