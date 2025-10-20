export const getFuzzyMatchedCityNames =  (cityname) => {
    return fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityname}&count=10`)
        .then(res=>res.json())
        .then(({results:cities}) => {
           return cities.map(({name:name, latitude:lat, longitude:lon, admin1: voivodeship})=> ({name, lat, lon, voivodeship}));
        });
}