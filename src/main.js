import {getCurrentWeatherByCoordinates, getFuzzyMatchedCityNames} from "./apiService.js";

class WeatherApp {
    #coordinatesToSearch = {lat: null, lon: null};

    constructor() {
        this.viewElements = {}
        this.#bindHTMLElements();
        this.#setupListeners()
    }

    #bindHTMLElements() {
        const listOfIds = [...document.querySelectorAll('[id]')].map((elem) => elem.id);
        for (const id of listOfIds) {
            this.viewElements[id] = document.getElementById(id);
        }
    }
    #setupListeners() {
        this.viewElements["searchInput"].addEventListener('input', this.generateInputSearchSuggestionList.bind(this));
        this.viewElements["searchInput"].addEventListener('keydown', (e) => {
            if (e.key === "Enter") {
                getCurrentWeatherByCoordinates(this.#coordinatesToSearch).then(data => {
                    this.displayWeatherInfo(data);
                });
            }
        });
        this.viewElements["searchButton"].addEventListener('click', () => {
            getCurrentWeatherByCoordinates(this.#coordinatesToSearch).then(data => {
                this.displayWeatherInfo(data);
            });
        })
        this.viewElements["returnToSearchViewBtn"].addEventListener('click', this.toggleView.bind(this))
    }
    swapViewsWithAnimation(parentElement, childToRemove, childToShow, childToShowDisplayProperty = "initial") {
        const onAnimationEnd = () => {
            parentElement.style.display = "none";
            parentElement.classList.remove('animate__animated', 'animate__bounceOut');
            childToRemove.style.display = "none"
            parentElement.removeEventListener('animationend', onAnimationEnd);
            childToShow.style.display = childToShowDisplayProperty;
            parentElement.style.removeProperty("display");
            parentElement.classList.add('animate__animated', 'animate__bounceIn');
        }
        parentElement.classList.add('animate__animated', 'animate__bounceOut');
        parentElement.addEventListener('animationend', onAnimationEnd);
    }
    toggleView() {
        if (this.viewElements["weatherSearchView"].style.display !== "none") {
            this.swapViewsWithAnimation(this.viewElements["mainContainer"], this.viewElements["weatherSearchView"], this.viewElements["weatherForecastView"]);
        } else if (this.viewElements["weatherForecastView"].style.display !== "none") {
            this.swapViewsWithAnimation(this.viewElements["mainContainer"], this.viewElements["weatherForecastView"], this.viewElements["weatherSearchView"], "flex");
        }
    }
    displayWeatherInfo(data) {
        this.toggleView();
        this.viewElements["weatherCity"].innerText = data?.location?.name;
        this.viewElements["weatherIcon"].src = data?.current?.condition?.icon;
        this.viewElements["weatherIcon"].alt = data?.current?.condition?.text;
        this.viewElements["weatherCurrentTemperature"].innerText = `Temperature: ${data?.current?.temp_c} °C`;
        this.viewElements["weatherAirPressure"].innerText = `Air pressure: ${data?.current?.pressure_mb} hPa`;
        this.viewElements["weatherHumidity"].innerText = `Humidity: ${data?.current?.humidity}%`;
    }
    async generateInputSearchSuggestionList() {
        const inputValue = this.viewElements.searchInput.value;
        const matchedCityNames =  await getFuzzyMatchedCityNames(inputValue);
        this.viewElements.searchInputSuggestionsList.innerHTML = "";
        for (let city of matchedCityNames) {
            let li = document.createElement("li");
            let span = document.createElement("span");
            span.innerText = city?.voivodeship;
            li.innerText = city?.name;
            li.appendChild(span);
            li.dataset.cityName = city?.name;
            li.dataset.lat = city?.lat;
            li.dataset.lon = city?.lon;

            li.addEventListener("click", (e) => {
                this.#coordinatesToSearch.lat = e.target?.dataset.lat;
                this.#coordinatesToSearch.lon = e.target?.dataset.lon;
                this.viewElements["searchInput"].value = e.target?.dataset.cityName;
                this.viewElements["searchInput"].focus();
                this.viewElements.searchInputSuggestionsList.style.display = "none";
            })
            this.viewElements?.searchInputSuggestionsList.append(li);
        }
        this.viewElements.searchInputSuggestionsList.style.display = "block";
    }
}


document.addEventListener('DOMContentLoaded', new WeatherApp());