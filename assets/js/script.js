// define variables
var apiKey = "b1230e9ae6629f281894dc4555b0c16d";
var currentPanel = $("#current-weather");
var fiveDayForecast = $("#five-day-forecast");
var searchBtn = $('#search-button')
var searchCity = $('#search-city')
var cityHistory = $('#city-results')
var citySaved = []
var displayPanel = $('.form-control')
var searchCityLabel = $("search-city-label")
var pastCity = $(".pastCities")
var displayRight = $('#content-right')
var city;
var noCity = $('.no-city')

$(document).ready(function() { 
    // load past search history
    if (localStorage.getItem('searchedCity')!==null) {
        var storage = JSON.parse(localStorage.getItem("searchedCity"))
        citySaved.push(...storage);
        loadSearchHistory();
    }   
    // if statement to check for valid input
    searchBtn.on("click",function(event) {
        event.preventDefault();
        if (searchCity.val() == '') {
            noCity.text("Please enter a city.")
            setTimeout(function(){
                noCity.text('')
            }, 1000)
        } else {
            city = $(searchCity).val();
            citySaved.unshift(city)
            searchCity.val('')
            currentPanel.empty();
            fiveDayForecast.empty();
            saveLocalStorage();
            currentWeather();
        }
    })
})    

// fetch current weather data
function currentWeather(){
    var queryURL = "https://api.openweathermap.org/geo/1.0/direct?q="+city+"&appid="+apiKey
    fetch(queryURL)
        .then(function(response){
            if (response.ok) {
                response.json()
                .then(function(data) { 
                    if (data.length > 0) {
                        var lat = data[0].lat
                        var lon = data[0].lon
                        currentCity = data[0].name
                        var weatherData = "https://api.openweathermap.org/data/2.5/onecall?lat="+ lat +"&lon="+ lon + "&units=imperial&appid="+ apiKey
                        fetch(weatherData)
                            .then(function(res) {
                                if (res.ok) {
                                    res.json()
                                    .then(function(response) {
                                        // build current weather display
                                        displayRight.css("display", "")
                                        var icon = response.current.weather[0].icon
                                        var dayPanel = $('<div class="dayPanel">').css({"display":"flex", "justify-content":"space-between"})
                                        var cityName = $('<h3 class="cityName">').text(currentCity).css("margin-top", "32px")
                                        var date = $('<h2 class="date">').text(moment.unix(response.current.dt).format("dddd MM/DD/YYYY"))
                                        date.css({"margin":"32px 20px 0 20px", "font-size":"24px"})
                                        var img = $('<img class="img">').attr("src", "https://openweathermap.org/img/wn/"+icon+"@2x.png")
                                        img.attr("alt", "weather display icon")
                                        cityName.appendTo(dayPanel)
                                        img.appendTo(dayPanel)
                                        date.appendTo(dayPanel)
                                        dayPanel.appendTo(currentPanel)
                                        // add text to current weather display
                                        var temp = $('<p>').text("Temp: " + response.current.temp + " °F")
                                        var wind = $('<p>').text("Wind: " + response.current.wind_speed + " mph")
                                        var humidity = $('<p>').text("Humidity: " + response.current.humidity + " %")
                                        var uvIndex = $('<p>').text("UV Index: ")
                                        var uvi = $('<span>').text(response.current.uvi)
                                        temp.appendTo(currentPanel)
                                        wind.appendTo(currentPanel)
                                        humidity.appendTo(currentPanel)
                                        uvIndex.appendTo(currentPanel)
                                        uvi.appendTo(uvIndex)
                                        var uv = response.current.uvi;
                                        // if statement to color code uv index
                                        if (uv<=2) {
                                            uvi.css("background-color", "green")
                                        } else if (uv>2 && uv<=5) {
                                            uvi.css("background-color", "yellow")
                                        } else if (uv>5 && uv<=7) {
                                            uvi.css("background-color", "orange")
                                        } else {
                                            uvi.css("background-color", "red")
                                        }

                                        // five day forecast styling
                                        var fiveDayHeader = $('<h3 class="five-day">').text("5-Day Forecast").css("margin-left", "5px")
                                        var forecastDiv = $('<div class= "row">').css({"display":"flex", "margin-left":"10px"})
                                        // loop to create weather cards
                                        for (var i = 1; i < 6; i++) {
                                            var fiveDayIcon = response.daily[i].weather[0].icon
                                            var daily = $('<div class="col-11 col-md-3 col-sm-4">').css({"border":"solid 2px grey", "border-radius":"5px", "background-color":"beige", "margin":"5px 10 px 5px 0"})
                                            var dailyTemp = $('<p>').text("Temp: " + (response.daily[i].temp.day) + " °F")
                                            var iconimg = $('<img>').attr("src", "https://openweathermap.org/img/wn/"+fiveDayIcon+"@2x.png")
                                            iconimg.attr("alt", "weather display icon")
                                            var dailyDate = $('<p>').text(moment.unix(response.daily[i].dt).format("MM/DD/YYYY"))
                                            var dailyhumidity = $('<p>').text("Humidity: " + (response.daily[i].humidity) + " %")
                                            var dailyWind = $('<p>').text("Wind: " + (response.daily[i].wind_speed) + " mph")
                                            dailyDate.appendTo(daily)
                                            iconimg.appendTo(daily)
                                            dailyTemp.appendTo(daily)
                                            dailyWind.appendTo(daily)
                                            dailyhumidity.appendTo(daily)
                                            daily.appendTo(forecastDiv)
                                            fiveDayHeader.appendTo(fiveDayForecast)
                                            forecastDiv.appendTo(fiveDayForecast)
                                        }
                                    })
                                // response to invaild inputs
                                } else {
                                    var error = $("<p>").text("Search had no results, try again!").css("color", "red")
                                    displayRight.css("display","")
                                    error.appendTo(currentPanel)
                                    setTimeout(function() {
                                        error.text("")
                                    }, 1000)
                                }
                            })
                            // catch error when unable to connect to OpenWeather API
                            .catch(function(error) {
                                var catchError = $("<p>").text("Unable to connect to OpenWeather One Call API.Check your internet connection.").css("color", "red")
                                displayRight.css("display","")
                                catchError.appendTo(currentPanel)
                                setTimeout(function() {
                                    catchError.text("")
                                }, 2000)
                            })
                    } else {
                        var error = $("<p>").text("Search had no results, try again!").css("color", "red")
                        displayRight.css("display","")
                        error.appendTo(currentPanel)
                        setTimeout(function() {
                            error.text("")
                        }, 1000)
                    }       
                    })
            
            } else {
                var error = $("<p>").text("Search had no results, try again!").css("color", "red")
                displayRight.css("display","")
                error.appendTo(currentPanel)
                setTimeout(function() {
                    error.text("")
                }, 1000)
            }
        })
        .catch(function(error) {
            var catchError = $("<p>").text("Unable to connect to OpenWeather One Call API.Check your internet connection.").css("color", "red")
            displayRight.css("display","")
            catchError.appendTo(currentPanel)
            setTimeout(function() {
                catchError.text("")
            }, 2000)
        })
}

// save to local storage
var saveLocalStorage = function() {
    pastCity.empty()
    localStorage.setItem('searchedCity', JSON.stringify(citySaved));
    
    loadSearchHistory();
}

// loop to create search history list
function loadSearchHistory() {
    var searchHistoryArray = JSON.parse(localStorage.getItem('searchedCity'))
    for (j = 0; j < searchHistoryArray.length; j++){       
    var searchHistory = $("<button class='col-12 btn btn-secondary btn-sm'>").text(searchHistoryArray[j]);
        searchHistory.attr("id","#search"+ [j])
        searchHistory.css({"border-radius":"5px", "font-size":"15px", "margin":"5px 0 5px 0"})
        searchHistory.appendTo(pastCity);
    }
}

// identify which button was clicked in search history
$("ul").on("click", "button", function(event) {
    event.preventDefault();
    city = $(this).text();
    currentPanel.empty();
    fiveDayForecast.empty();
    currentWeather();
})

// clear button
$("#clear").click(function(event){
    event.preventDefault();
    event.stopPropagation();
    displayRight.css("display","none")
    pastCity.empty();
    localStorage.clear();
    citySaved=[];
});