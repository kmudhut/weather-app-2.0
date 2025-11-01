import {getCurrentWeatherByCoordinates, getFuzzyMatchedCityNames} from "./apiService.js";

class WeatherApp {
    #coordinatesToSearch = {lat: null, lon: null};
    constructor() {
        this.viewElements = {}
        this.#bindHTMLElements();
        this.#setupListeners()

    }

    fadeInOut(parentElement, childToRemove, childToShow) {
        const onAnimationEnd = () => {
            parentElement.style.display = "none";
            parentElement.classList.remove('animate__animated', 'animate__bounceOut');
            childToRemove.style.display = "none"
            parentElement.removeEventListener('animationend', onAnimationEnd);
            childToShow.style.display = "flex"
            parentElement.style.display = "initial";
            parentElement.classList.add('animate__animated', 'animate__bounceIn');
        }
        parentElement.classList.add('animate__animated', 'animate__bounceOut');
        parentElement.addEventListener('animationend', onAnimationEnd);
    }

    switchView() {
        if (this.viewElements["weatherSearchView"].style.display !== "none") {
            this.fadeInOut(this.viewElements["mainContainer"], this.viewElements["weatherSearchView"], this.viewElements["weatherForecastView"]);
        } else if (this.viewElements["weatherForecastView"].style.display !== "none") {
            this.fadeInOut(this.viewElements["mainContainer"], this.viewElements["weatherForecastView"], this.viewElements["weatherSearchView"]);
        }
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
                getCurrentWeatherByCoordinates(this.#coordinatesToSearch);
                console.log("ENTER HIT");

            }
        });
        this.viewElements["searchButton"].addEventListener('click', e => {
            this.switchView();
        })
        this.viewElements["returnToSearchViewBtn"].addEventListener('click', this.switchView.bind(this))
    }

    async generateInputSearchSuggestionList() {
        const inputValue = this.viewElements.searchInput.value;
        const matchedCityNames = await getFuzzyMatchedCityNames(inputValue);
        this.viewElements.searchInputSuggestionsList.innerHTML = "";
        console.log(matchedCityNames);
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
                this.viewElements.searchInputSuggestionsList.style.display = "none";
            })
            this.viewElements?.searchInputSuggestionsList.append(li);
        }
        this.viewElements.searchInputSuggestionsList.style.display = "block";
    }
}


document.addEventListener('DOMContentLoaded', new WeatherApp());