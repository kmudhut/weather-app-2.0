import {getFuzzyMatchedCityNames} from "./apiService.js";

class WeatherApp {
    constructor() {
        this.viewElements = {}
        this.#bindHTMLElements();
    }
    #bindHTMLElements(){
        const listOfIds = [...document.querySelectorAll('[id]')].map((elem) => elem.id);
        for(const id of listOfIds){
            this.viewElements[id] = document.getElementById(id);
        }
        console.log(this.viewElements);
    }
}


document.addEventListener('DOMContentLoaded', new WeatherApp());