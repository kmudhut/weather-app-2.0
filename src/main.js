import {getCurrentWeatherByCoordinates, getFuzzyMatchedCityNames} from "./apiService.js";
import {debounced} from "./utils.js"

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
    async handleSearchCity(e){
        this.viewElements.searchInputSuggestionsList.style.display = "none";
        this.viewElements["searchInputErrorTooltip"].classList.remove("weather-info__error-tooltip--visible");
        this.viewElements["searchInput"].style.borderColor = "";

        if(e.currentTarget.value.length < 2){
            this.viewElements["searchInputSuggestionsList"].style.display = "none";
        }
        else this.generateInputSearchSuggestionList()
    }
    async handleSearchWeather(){
        if(this.#coordinatesToSearch.lon && this.#coordinatesToSearch.lat) {
            this.viewElements["searchInput"].style.borderColor = "";
            this.viewElements["searchInputErrorTooltip"].classList.remove("weather-info__error-tooltip--visible")
            try{
                const data = await getCurrentWeatherByCoordinates(this.#coordinatesToSearch);
                this.displayWeatherInfo(data)
            }
            catch(err){
                if(err.type==="API_ERROR"){
                    this.viewElements["searchInput"].style.borderColor = "red";
                    this.viewElements["searchInputErrorTooltip"].innerText = "Wystąpił problem z API pogodowym. To nie twoja wina."
                    this.viewElements["searchInputErrorTooltip"].classList.add("weather-info__error-tooltip--visible");
                }
                throw err;
            }

        }
        else{
            this.viewElements["searchInput"].style.borderColor = "red";
            this.viewElements["searchInputErrorTooltip"].innerText = "Wpisz nazwę miasta, a następnie wybierz je z listy.";
            this.viewElements["searchInputErrorTooltip"].classList.add("weather-info__error-tooltip--visible")
        }
    }
    #setupListeners() {
        const throttledHandleSearchCity = debounced(200, this.handleSearchCity.bind(this));
        this.viewElements["searchInput"].addEventListener('input', throttledHandleSearchCity);
        this.viewElements["searchInput"].addEventListener('keydown', (e) => {
            if (e.key === "Enter") {
                this.handleSearchWeather()
            }
        });
        this.viewElements["searchButton"].addEventListener('click',this.handleSearchWeather.bind(this))
        this.viewElements["returnToSearchViewBtn"].addEventListener('click', () => {
            this.#coordinatesToSearch = {};
            this.viewElements["searchInput"].value = "";
            this.viewElements["searchInput"].parentElement.parentElement.parentElement.addEventListener("animationend", () => {
                this.viewElements["searchInput"].focus()
            }, {once: true})
            this.toggleView();
        })
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

    selectCity(city) {
        this.viewElements.searchInputSuggestionsList.style.display = "none";
        this.#coordinatesToSearch.lat = city.lat;
        this.#coordinatesToSearch.lon = city.lon;

        this.viewElements["searchInput"].value = city.name;
        this.viewElements["searchInput"].focus();
    }

    async generateInputSearchSuggestionList() {
        this.#coordinatesToSearch = {lat: null, lon: null}
        const inputValue = this.viewElements.searchInput.value;
        let matchedCityNames;
        try{
            matchedCityNames = await getFuzzyMatchedCityNames(inputValue);
        }
        catch(err){
            this.viewElements["searchInput"].style.borderColor = "red";
            this.viewElements["searchInputErrorTooltip"].classList.add("weather-info__error-tooltip--visible");
            switch(err.type){
                case "API_ERROR":
                    this.viewElements["searchInputErrorTooltip"].innerHTML = "Wystąpił błąd API. To nie twoja wina.";
                    break;
                case "CITY_NOT_FOUND":
                    this.viewElements["searchInputErrorTooltip"].innerHTML = "Nie odnaleziono takiego miasta.";
                    break;
                    default:
                        this.viewElements["searchInputErrorTooltip"].innerHTML = "Wystąpił inny błąd.";
            }
            this.viewElements.searchInputSuggestionsList.style.display = "none";
            return;
        }

        this.viewElements.searchInputSuggestionsList.innerHTML = "";
        for (let city of matchedCityNames) {
            let li = document.createElement("li");
            let span = document.createElement("span");

            span.innerText = city?.voivodeship;
            li.innerText = city?.name;
            li.appendChild(span);
            li.setAttribute("tabindex", "0");

            li.addEventListener("click", () => {
                this.selectCity(city);
            });

            li.addEventListener("keydown", (e) => {
                if (e.key === 'Enter') {
                    this.selectCity(city);
                }
            });

            this.viewElements?.searchInputSuggestionsList.append(li);
        }
        this.viewElements.searchInputSuggestionsList.style.display = "block";
    }
}


document.addEventListener('DOMContentLoaded', new WeatherApp());