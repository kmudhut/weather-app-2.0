export const getFuzzyMatchedCityNames =  (cityname) => {
    return fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityname}&count=10`)
        .then(res => {
            if(res.status !== 200) {
                throw {type:"API_ERROR"}
            }
            return res.json();
        })
        .then(({results:cities}) => {
            if(!cities) {
                throw {type:"CITY_NOT_FOUND"}
            }
           return cities.map(({name:name, latitude:lat, longitude:lon, admin1: voivodeship})=> ({name, lat, lon, voivodeship}));
        })
        .catch((err)=>{
            throw err;
        });
}

export const  getCurrentWeatherByCoordinates =  ({lat,lon}) => {
    return fetch(`https://api.weatherapi.com/v1/current.json?key=${import.meta.env.VITE_WEATHERAPI_COM_API_KEY}&q=${lat},${lon}&aqi=no`)
        .then(res=>res.json())
        .then((res) => res)
        .catch((err)=>{throw {error:err, type:"API_ERROR"}});
}
