const apiKey = "976f12296a471529d4b72e198ede82ed";
const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search-btn");
const locationBtn = document.querySelector(".location-btn");
const themeToggle = document.querySelector("#themeToggle");
const weatherIcon = document.querySelector(".weather-icon");
async function checkWeather(city) {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${city}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?units=metric&q=${city}&appid=${apiKey}`;

    try {
        const response = await fetch(currentUrl);
        if (response.status === 404) {
            document.querySelector(".error").style.display = "block";
            document.querySelector(".weather").style.display = "none";
            return;
        }

        const data = await response.json();
        updateCurrentWeather(data);

        const forecastRes = await fetch(forecastUrl);
        const forecastData = await forecastRes.json();
        updateForecast(forecastData);

        document.querySelector(".weather").style.display = "grid"; 
        document.querySelector(".error").style.display = "none";
    } catch (err) {
        console.error("Fetch error:", err);
    }
}
async function checkWeatherByCoords(lat, lon) {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=${lat}&lon=${lon}&appid=${apiKey}`;

    try {
        const response = await fetch(currentUrl);
        const data = await response.json();
        updateCurrentWeather(data);

        const forecastRes = await fetch(forecastUrl);
        const forecastData = await forecastRes.json();
        updateForecast(forecastData);

        document.querySelector(".weather").style.display = "grid";
        document.querySelector(".error").style.display = "none";
    } catch (err) {
        console.error("Coords Fetch error:", err);
    }
}
function updateCurrentWeather(data) {
    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

    const condition = data.weather[0].main.toLowerCase();
    if (condition.includes("rain")) weatherIcon.src = "images/rain.png";
    else if (condition.includes("cloud")) weatherIcon.src = "images/clouds.png";
    else if (condition.includes("clear")) weatherIcon.src = "images/clear.png";
    else if (condition.includes("snow")) weatherIcon.src = "images/snow.png";
    else weatherIcon.src = "images/sun.png";
}
function updateForecast(data) {
    const hourlyList = document.querySelector(".hourly-list");
    const dailyList = document.querySelector(".daily-list");

    hourlyList.innerHTML = "";
    dailyList.innerHTML = "";
    data.list.slice(0, 8).forEach(item => {
        const date = new Date(item.dt * 1000);
        const hours = date.getHours().toString().padStart(2, '0') + ":00";
        const temp = Math.round(item.main.temp) + "°C";
        const pop = Math.round(item.pop * 100) + "%";

        hourlyList.innerHTML += `
            <div class="hourly-card">
                <p class="time">${hours}</p>
                <img src="images/${getIconName(item.weather[0].main)}.png" alt="icon">
                <p class="hourly-temp">${temp}</p>
                <p class="pop">💧 ${pop}</p>
            </div>
        `;
    });
    for (let i = 0; i < data.list.length; i += 8) {
        const item = data.list[i];
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const tempMin = Math.round(item.main.temp_min);
        const tempMax = Math.round(item.main.temp_max);
        const pop = Math.round(item.pop * 100) + "%";

        dailyList.innerHTML += `
            <div class="daily-item">
                <span class="day">${dayName}</span>
                <img src="images/${getIconName(item.weather[0].main)}.png" alt="icon">
                <span class="daily-pop">💧 ${pop}</span>
                <span class="daily-temp">${tempMin}°C / ${tempMax}°C</span>
            </div>
        `;
    }
}
function getIconName(condition) {
    const cond = condition.toLowerCase();
    if (cond.includes("rain")) return "rain";
    if (cond.includes("cloud")) return "clouds";
    if (cond.includes("clear")) return "clear";
    if (cond.includes("snow")) return "snow";
    return "clear";
}
themeToggle.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme");
    if (currentTheme === "dark") {
        document.body.removeAttribute("data-theme");
    } else {
        document.body.setAttribute("data-theme", "dark");
    }
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
        alert("Geolocation is not supported by your browser.");
    }
});
searchBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchBtn.click();
});

searchBtn.addEventListener("click", () => {
    if (searchBox.value.trim() !== "") {
        checkWeather(searchBox.value);
    }
});