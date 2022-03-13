var apiKey = "b1230e9ae6629f281894dc4555b0c16d";
var currentCity = "";
var lastCity = "";

var currentConditions = function(event) {
    var city = $('#search-city').val();
    currentCity= $('#search-city').val();
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + apiKey;
    fetch(queryURL)
    .then(function(response) {
        return response.json();
    })
    .then(function(response) {
        saveCity(city);
        $('#search-error').text("");
        var currentWeatherIcon="https://openweathermap.org/img/wn/" + response.weather[0].icon + ".png";
        var currentTimeUTC = response.dt;
        var currentTimeZoneOffset = response.timezone;
        var currentTimeZoneOffsetHours = currentTimeZoneOffset;
        var currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);
        loadCities();
        fiveDayForecast(event);
        var currentWeatherHTML = `
            <h3>${response.name} ${currentMoment.format("(MM/DD/YY)")}<img src="${currentWeatherIcon}"></h3>
            <ul class="list-unstyled">
                <li>Temperature: ${response.main.temp}&#8457;</li>
                <li>Humidity: ${response.main.humidity}%</li>
                <li>Wind Speed: ${response.wind.speed} mph</li>
                <li id="uvIndex">UV Index:</li>
            </ul>`;
        $('#current-weather').html(currentWeatherHTML);
        var latitude = response.coord.lat;
        var longitude = response.coord.lon;
        var uvQueryURL = "api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&APPID=" + apiKey;
        uvQueryURL = "https://cors-anywhere.herokuapp.com/" + uvQueryURL;
        fetch(uvQueryURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            var uvIndex = response.value;
            $('#uvIndex').html(`UV Index: <span id="uvVal"> ${uvIndex}</span>`);
            if (uvIndex>=0 && uvIndex<3){
                $('#uvVal').attr("class", "uv-low");
            } else if (uvIndex>=3 && uvIndex<8){
                $('#uvVal').attr("class", "uv-mid");
            } else if (uvIndex>=8){
                $('#uvVal').attr("class", "uv-high");
            }
        });
    })
}

var fiveDayForecast = function(event) {
    var city = $('#search-city').val();
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + apiKey;
    fetch(queryURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
        var fiveDayForecastHTML = `<h2>5-Day Forecast:</h2><div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`;
        for (var i = 0; i < response.list.length; i++) {
            var dayData = response.list[i];
            var dayTimeUTC = dayData.dt;
            var timeZoneOffset = response.city.timezone;
            var timeZoneOffsetHours = timeZoneOffset / 60 / 60;
            var thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
            var iconURL = "https://openweathermap.org/img/wn/" + dayData.weather[0].icon + ".png";

            if (thisMoment.format("HH:mm:ss") === "08:00:00" || thisMoment.format("HH:mm:ss") === "16:00:00" || thisMoment.format("HH:mm:ss") === "24:00:00") {
                fiveDayForecastHTML += `
                <div class="weather-card card m-1 ">
                    <ul class="list-unstyled p-3">
                        <li>${thisMoment.format("MM/DD/YY")}</li>
                        <li class="weather-icon"><img src="${iconURL}"></li>
                        <li>Temp: ${dayData.main.temp}&#8457;</li>
                        <br>
                        <li>Humidity: ${dayData.main.humidity}%</li>
                    </ul>
                </div>`;
            }
        }
        fiveDayForecastHTML += `</div>`;
        $('#five-day-forecast').html(fiveDayForecastHTML);
    })
}

var saveCity = function(newCity) {
    var cityExists = false;
    for (var i = 0; i < localStorage.length; i++) {
        if (localStorage["cities" + i] === newCity) {
            cityExists = true;
        }
    }
    if (cityExists === false) {
        localStorage.setItem('cities' + localStorage.length, newCity);
    }
}

var loadCities = function() {
    $('#city-results').empty();
    if (localStorage.length === 0){
        if (lastCity){
            $('#search-city').attr("value", lastCity);
        } else {
            $('#search-city').attr("value", "Austin");
        }
    } else {
        var lastCityKey="cities"+(localStorage.length-1);
        lastCity=localStorage.getItem(lastCityKey);
        $('#search-city').attr("value", lastCity);
        for (var i = 0; i < localStorage.length; i++) {
            var city = localStorage.getItem("cities" + i);
            var cityEl;
            if (currentCity===""){
                currentCity=lastCity;
            }
            if (city === currentCity) {
                cityEl = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
            } else {
                cityEl = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
            } 
            $('#city-results').append(cityEl);
        }
        if (localStorage.length>0){
            $('#clear-storage').html($('<a id="clear-storage" href="#">clear</a>'));
        } else {
            $('#clear-storage').html('');
        }
    } 
}

$('#search-button').on("click", function(event) {
event.preventDefault();
currentCity = $('#search-city').val();
currentConditions(event);
});

$('#city-results').on("click", function(event) {
    event.preventDefault();
    $('#search-city').val(event.target.textContent);
    currentCity=$('#search-city').val();
    currentConditions(event);
});

$("#clear-storage").on("click", function(event) {
    localStorage.clear();
    loadCities();
});

loadCities();
currentConditions();