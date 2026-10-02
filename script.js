// ============================================================
// SKYCAST WEATHER APP
// TUGAS RUTIN 5
// ============================================================


// ============================================================
// API KEY
// ============================================================

// GANTI DENGAN API KEY OPENWEATHERMAP KAMU

const API_KEY = "673b0f9ca6e5807c39f624ea60d0013d";


// ============================================================
// STATE
// ============================================================

const state = {

    unit:
        localStorage.getItem("weatherUnit") || "C",

    lastWeather:
        null,

    history:
        JSON.parse(
            localStorage.getItem("weatherHistory") || "[]"
        )

};


// ============================================================
// HELPER ES6
// ============================================================

const $ = (selector) =>
    document.querySelector(selector);


const $$ = (selector) =>
    [...document.querySelectorAll(selector)];


// ============================================================
// DOM
// ============================================================

const elements = {

    form:
        $("#searchForm"),

    cityInput:
        $("#cityInput"),

    searchBtn:
        $("#searchBtn"),

    statusArea:
        $("#statusArea"),

    dashboard:
        $("#weatherDashboard"),

    cityName:
        $("#cityName"),

    dateText:
        $("#dateText"),

    weatherBadge:
        $("#weatherBadge"),

    weatherVisual:
        $("#weatherVisual"),

    temperature:
        $("#temperature"),

    description:
        $("#description"),

    feelsLike:
        $("#feelsLike"),

    humidity:
        $("#humidity"),

    wind:
        $("#wind"),

    pressure:
        $("#pressure"),

    visibility:
        $("#visibility"),

    sunrise:
        $("#sunrise"),

    sunset:
        $("#sunset"),

    weatherTip:
        $("#weatherTip"),

    forecastGrid:
        $("#forecastGrid"),

    historyBtn:
        $("#historyBtn"),

    historySection:
        $("#historySection"),

    historyList:
        $("#historyList"),

    clearHistoryBtn:
        $("#clearHistoryBtn"),

    historyModal:
        $("#historyModal"),

    modalHistoryList:
        $("#modalHistoryList"),

    closeHistoryBtn:
        $("#closeHistoryBtn")

};


// ============================================================
// WEATHER ICON
// ============================================================

const getWeatherIcon = (weather) => {

    const icons = {

        Clear: "☀️",

        Clouds: "☁️",

        Rain: "🌧️",

        Drizzle: "🌦️",

        Thunderstorm: "⛈️",

        Snow: "❄️",

        Mist: "🌫️",

        Smoke: "🌫️",

        Haze: "🌫️",

        Dust: "🌪️",

        Fog: "🌫️",

        Sand: "🌪️",

        Ash: "🌋",

        Squall: "💨",

        Tornado: "🌪️"

    };

    return icons[weather] || "🌤️";

};


// ============================================================
// CELSIUS KE FAHRENHEIT
// ============================================================

const toFahrenheit = (celsius) => {

    return (
        celsius * 9 / 5
    ) + 32;

};


// ============================================================
// DISPLAY TEMPERATURE
// ============================================================

const displayTemperature = (celsius) => {

    const temperature =

        state.unit === "C"

            ? celsius

            : toFahrenheit(celsius);


    return Math.round(temperature);

};


// ============================================================
// FORMAT TANGGAL
// ============================================================

const formatDate = () => {

    return new Intl.DateTimeFormat(
        "id-ID",
        {

            weekday: "long",

            day: "numeric",

            month: "long",

            year: "numeric"

        }

    ).format(
        new Date()
    );

};


// ============================================================
// FORMAT TIME
// ============================================================

const formatTime = (
    unix,
    timezone
) => {

    const localTime =
        new Date(
            (unix + timezone) * 1000
        );


    return new Intl.DateTimeFormat(
        "id-ID",
        {

            hour: "2-digit",

            minute: "2-digit",

            hour12: false,

            timeZone: "UTC"

        }
    ).format(localTime);

};


// ============================================================
// STATUS MESSAGE
// ============================================================

const showStatus = (
    message,
    type = ""
) => {

    if (!message) {

        elements.statusArea.innerHTML = "";

        return;

    }


    const icon =

        type === "loading"

            ? `<span class="spinner"></span>`

            : type === "error"

                ? "⚠️"

                : "✓";


    elements.statusArea.innerHTML = `

        <div class="status ${type}">

            ${icon}

            <span>
                ${message}
            </span>

        </div>

    `;

};


// ============================================================
// LOADING STATE
// ============================================================

const setLoading = (loading) => {

    elements.searchBtn.disabled =
        loading;


    elements.searchBtn.innerHTML =

        loading

            ? `
                <span class="spinner"></span>
                Memuat...
              `

            : `
                <span>🔎</span>
                Cari Cuaca
              `;

};


// ============================================================
// FETCH WEATHER
// ============================================================

const fetchWeather = async (city) => {


    if (

        API_KEY ===
        "MASUKKAN_API_KEY_KAMU"

    ) {

        throw new Error(
            "API_KEY_MISSING"
        );

    }


    const currentUrl =

        `https://api.openweathermap.org/data/2.5/weather?` +

        `q=${encodeURIComponent(city)}` +

        `&appid=${API_KEY}` +

        `&units=metric` +

        `&lang=id`;


    const forecastUrl =

        `https://api.openweathermap.org/data/2.5/forecast?` +

        `q=${encodeURIComponent(city)}` +

        `&appid=${API_KEY}` +

        `&units=metric` +

        `&lang=id`;


    try {

        // Async/Await + Fetch API

        const [
            currentResponse,
            forecastResponse
        ] = await Promise.all([

            fetch(currentUrl),

            fetch(forecastUrl)

        ]);


        // 404

        if (

            currentResponse.status === 404 ||

            forecastResponse.status === 404

        ) {

            throw new Error(
                "CITY_NOT_FOUND"
            );

        }


        // API error

        if (

            !currentResponse.ok ||

            !forecastResponse.ok

        ) {

            throw new Error(
                "API_ERROR"
            );

        }


        const [
            current,
            forecast
        ] = await Promise.all([

            currentResponse.json(),

            forecastResponse.json()

        ]);


        return {
            current,
            forecast
        };

    }


    catch (error) {

        if (

            error.message ===
            "CITY_NOT_FOUND"

        ) {

            throw error;

        }


        if (

            error.message ===
            "API_ERROR"

        ) {

            throw error;

        }


        throw new Error(
            "NETWORK_ERROR"
        );

    }

};


// ============================================================
// RENDER CURRENT WEATHER
// ============================================================

const renderCurrentWeather = (data) => {

    const {

        main,

        wind,

        visibility,

        sys,

        timezone,

        weather,

        name

    } = data;


    const condition =
        weather[0];


    // Kota

    elements.cityName.textContent =
        name;


    // Tanggal

    elements.dateText.textContent =
        formatDate();


    // Badge

    elements.weatherBadge.textContent =
        condition.main;


    // Icon

    elements.weatherVisual.textContent =
        getWeatherIcon(
            condition.main
        );


    // Temperature

    elements.temperature.textContent =
        displayTemperature(
            main.temp
        );


    // Description

    elements.description.textContent =
        condition.description;


    // Feels like

    elements.feelsLike.textContent =

        `${displayTemperature(
            main.feels_like
        )}°`;


    // Humidity

    elements.humidity.textContent =
        `${main.humidity}%`;


    // Wind

    elements.wind.textContent =

        `${Math.round(
            wind.speed * 3.6
        )} km/j`;


    // Pressure

    elements.pressure.textContent =

        `${main.pressure} hPa`;


    // Visibility

    elements.visibility.textContent =

        `${(
            visibility / 1000
        ).toFixed(1)} km`;


    // Sunrise

    elements.sunrise.textContent =

        formatTime(
            sys.sunrise,
            timezone
        );


    // Sunset

    elements.sunset.textContent =

        formatTime(
            sys.sunset,
            timezone
        );


    // ========================================================
    // WEATHER TIPS
    // ========================================================

    const tips = {

        Clear:
            "Langit cerah! Waktu yang cocok untuk melakukan aktivitas di luar ruangan.",

        Clouds:
            "Cuaca berawan. Tetap nyaman dan siapkan payung jika kondisi berubah.",

        Rain:
            "Hujan sedang terjadi. Jangan lupa membawa payung atau jas hujan.",

        Drizzle:
            "Gerimis terdeteksi. Sebaiknya siapkan perlindungan dari hujan.",

        Thunderstorm:
            "Badai petir terdeteksi. Hindari area terbuka dan tetap berada di tempat aman.",

        Snow:
            "Cuaca bersalju. Pastikan tubuh tetap hangat.",

        Mist:
            "Kabut dapat mengurangi jarak pandang. Berhati-hati saat bepergian."

    };


    elements.weatherTip.textContent =

        tips[condition.main] ||

        "Periksa kondisi cuaca secara berkala sebelum melakukan aktivitas.";

};


// ============================================================
// MEMBANGUN FORECAST
// ARRAY METHOD:
// filter()
// map()
// slice()
// ============================================================

const buildForecast = (forecastData) => {

    const forecast =

        forecastData.list

            // FILTER

            .filter(
                (item) =>
                    item.dt_txt.includes(
                        "12:00:00"
                    )
            )

            // SLICE

            .slice(0, 5)

            // MAP

            .map(
                (item) => ({

                    date:
                        item.dt,

                    day:
                        new Intl.DateTimeFormat(
                            "id-ID",
                            {
                                weekday: "short"
                            }
                        ).format(
                            new Date(
                                item.dt * 1000
                            )
                        ),

                    icon:
                        getWeatherIcon(
                            item.weather[0].main
                        ),

                    description:
                        item.weather[0].description,

                    temp:
                        displayTemperature(
                            item.main.temp
                        ),

                    humidity:
                        item.main.humidity

                })
            );


    return forecast;

};


// ============================================================
// RENDER FORECAST
// ============================================================

const renderForecast = (forecastData) => {

    const forecast =
        buildForecast(
            forecastData
        );


    elements.forecastGrid.innerHTML =

        forecast

            .map(
                (day, index) => `

                <div
                    class="
                        forecast-item
                        ${index === 0
                            ? "today"
                            : ""}
                    "
                >

                    <div class="forecast-day">

                        ${
                            index === 0
                                ? "HARI INI"
                                : day.day.toUpperCase()
                        }

                    </div>


                    <div class="forecast-icon">

                        ${day.icon}

                    </div>


                    <div class="forecast-temp">

                        ${day.temp}°

                        <span>
                            ${day.humidity}%
                        </span>

                    </div>


                    <div class="forecast-desc">

                        ${day.description}

                    </div>

                </div>

            `
            )

            .join("");

};


// ============================================================
// LOCAL STORAGE
// ============================================================

const saveHistory = (city) => {

    const cleanCity =
        city.trim();


    // Hindari duplikat

    state.history = [

        cleanCity,

        ...state.history.filter(

            (item) =>

                item.toLowerCase() !==
                cleanCity.toLowerCase()

        )

    ].slice(0, 8);


    localStorage.setItem(

        "weatherHistory",

        JSON.stringify(
            state.history
        )

    );


    renderHistory();

};


// ============================================================
// RENDER HISTORY
// ============================================================

const renderHistory = () => {

    if (!state.history.length) {

        elements.historySection
            .classList
            .add("hidden");


        elements.modalHistoryList.innerHTML = `

            <p
                style="
                    color:#91a1b9;
                    font-size:12px;
                "
            >
                Belum ada riwayat pencarian.
            </p>

        `;

        return;

    }


    elements.historySection
        .classList
        .remove("hidden");


    elements.historyList.innerHTML =

        state.history

            .map(
                (city) => `

                    <button
                        class="history-item"
                        data-history-city="${city}"
                        type="button"
                    >
                        📍 ${city}
                    </button>

                `
            )

            .join("");


    elements.modalHistoryList.innerHTML =

        state.history

            .map(
                (city) => `

                    <div
                        class="modal-history-item"
                    >

                        <span>
                            📍 ${city}
                        </span>

                        <button
                            type="button"
                            data-history-city="${city}"
                        >
                            Lihat cuaca
                        </button>

                    </div>

                `
            )

            .join("");

};


// ============================================================
// ERROR HANDLING
// ============================================================

const showError = (error) => {

    const messages = {

        API_KEY_MISSING:

            `
            API Key belum dimasukkan.
            Buka <b>script.js</b> dan masukkan
            API Key OpenWeatherMap kamu.
            `,


        CITY_NOT_FOUND:

            `
            Kota tidak ditemukan <b>(404)</b>.
            Periksa kembali ejaan nama kota.
            `,


        API_ERROR:

            `
            Terjadi masalah pada server API.
            Silakan coba kembali beberapa saat lagi.
            `,


        NETWORK_ERROR:

            `
            <b>Network Error</b>.
            Periksa koneksi internet kamu
            dan coba lagi.
            `

    };


    showStatus(

        messages[error.message] ||

        `
            Terjadi kesalahan.
            Silakan coba lagi.
        `,

        "error"

    );

};


// ============================================================
// SEARCH WEATHER
// ============================================================

const searchWeather = async (city) => {

    const cleanCity =
        city.trim();


    if (!cleanCity) {

        return;

    }


    // Loading

    setLoading(true);


    showStatus(

        "Mengambil data cuaca...",

        "loading"

    );


    try {

        // Fetch API

        const data =
            await fetchWeather(
                cleanCity
            );


        // Simpan state

        state.lastWeather =
            data;


        // Render data

        renderCurrentWeather(
            data.current
        );


        renderForecast(
            data.forecast
        );


        // LocalStorage

        saveHistory(
            data.current.name
        );


        // Tampilkan dashboard

        elements.dashboard
            .classList
            .remove("hidden");


        // Success

        showStatus(

            `
            Data cuaca
            <b>${data.current.name}</b>
            berhasil dimuat.
            `,

            "success"

        );


    }


    catch (error) {

        console.error(error);


        elements.dashboard
            .classList
            .add("hidden");


        showError(error);

    }


    finally {

        setLoading(false);

    }

};


// ============================================================
// UNIT °C / °F
// ============================================================

const updateUnit = (unit) => {

    state.unit =
        unit;


    localStorage.setItem(

        "weatherUnit",

        state.unit

    );


    $$(".unit").forEach(

        (button) => {

            button.classList.toggle(

                "active",

                button.dataset.unit ===
                state.unit

            );

        }

    );


    if (
        state.lastWeather
    ) {

        renderCurrentWeather(
            state.lastWeather.current
        );


        renderForecast(
            state.lastWeather.forecast
        );

    }

};


// ============================================================
// SEARCH FORM EVENT
// ============================================================

elements.form.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        searchWeather(
            elements.cityInput.value
        );

    }
);


// ============================================================
// QUICK CITY EVENT
// ============================================================

$$(".city-chip").forEach(

    (button) => {

        button.addEventListener(

            "click",

            () => {

                const city =
                    button.dataset.city;


                elements.cityInput.value =
                    city;


                searchWeather(city);

            }

        );

    }

);


// ============================================================
// UNIT EVENT
// ============================================================

$$(".unit").forEach(

    (button) => {

        button.addEventListener(

            "click",

            () => {

                updateUnit(
                    button.dataset.unit
                );

            }

        );

    }

);


// ============================================================
// HISTORY BUTTON
// ============================================================

elements.historyBtn.addEventListener(

    "click",

    () => {

        elements.historyModal
            .classList
            .remove("hidden");


        renderHistory();

    }

);


// ============================================================
// CLOSE MODAL
// ============================================================

elements.closeHistoryBtn.addEventListener(

    "click",

    () => {

        elements.historyModal
            .classList
            .add("hidden");

    }

);


// ============================================================
// MODAL EVENT
// ============================================================

elements.historyModal.addEventListener(

    "click",

    (event) => {


        // Close ketika klik background

        if (

            event.target ===
            elements.historyModal

        ) {

            elements.historyModal
                .classList
                .add("hidden");

        }


        // History item

        const button =
            event.target.closest(
                "[data-history-city]"
            );


        if (button) {

            const city =
                button.dataset.historyCity;


            elements.cityInput.value =
                city;


            elements.historyModal
                .classList
                .add("hidden");


            searchWeather(city);

        }

    }

);


// ============================================================
// CLEAR HISTORY
// ============================================================

elements.clearHistoryBtn.addEventListener(

    "click",

    () => {

        state.history = [];


        localStorage.removeItem(
            "weatherHistory"
        );


        renderHistory();

    }

);


// ============================================================
// INITIALIZATION
// ============================================================

updateUnit(
    state.unit
);


renderHistory();