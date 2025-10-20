import {getFuzzyMatchedCityNames} from "./apiService.js";

class WeatherApp {
    #coordinatesToSearch = {lat:null, lon:null};
    constructor() {
        this.viewElements = {}
        this.#bindHTMLElements();
        this.viewElements["searchInput"].addEventListener('input', this.generateInputSearchSuggestionList.bind(this))

    }
   #bindHTMLElements(){
        const listOfIds = [...document.querySelectorAll('[id]')].map((elem) => elem.id);
        for(const id of listOfIds){
            this.viewElements[id] = document.getElementById(id);
        }

    }

    async generateInputSearchSuggestionList() {
        const inputValue = this.viewElements.searchInput.value;
        const matchedCityNames = await getFuzzyMatchedCityNames(inputValue);
        this.viewElements.searchInputSuggestionsList.innerHTML = "";
        console.log(matchedCityNames);
        for(let city of matchedCityNames){
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
            })
            this.viewElements?.searchInputSuggestionsList.append(li);
        }
        this.viewElements.searchInputSuggestionsList.style.display = "block";
    }
}


document.addEventListener('DOMContentLoaded', new WeatherApp());