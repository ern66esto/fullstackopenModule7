import axios from "axios"

const baseUrl = 'https://studies.cs.helsinki.fi/restcountries/api/all';
const baseByCountryUrl = 'https://studies.cs.helsinki.fi/restcountries/api/name';

const getAll = () => {
    const request = axios.get(baseUrl);
    return request.then(response => {return response.data})
}

const get = (name) => {
    const request = axios.get(`${baseByCountryUrl}/${name}`);
    return request
            .then(response => {return response.data})
            .catch(error => {
                if (error.response && error.response.status === 404){
                    return null;
                }
                else{
                    throw error;
                }
            });
}

export default {getAll, get}