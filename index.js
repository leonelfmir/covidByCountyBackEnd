const express = require('express');
const cors = require('cors');
const neatCsv = require('neat-csv');
const axios = require('axios');
const memoize = require('memoizee');

const apiUrl = 'https://raw.githubusercontent.com/microsoft/Bing-COVID-19-Data/master/data/Bing-COVID19-Data.csv';

const cache = {
    data: null,
    csvData: null,
    date: null
};

const port = 3030;

const app = express();
app.use(cors());

app.get('/csv', async function (req, res) {
    try {
        if (cache.data === null) {
            const response = await axios.get(apiUrl);
            cache.data = response.data;
            const content = cache.data;
            const csv = await neatCsv(content);
            cache.csvData = csv;
        }
        res.json(cache.csvData);
    }
    catch (ex) {
        console.log(ex);
        res.send(500);
    }
});

app.get('/csv/:county', async function (req, res) {
    const countyName = req.params['county'];
    const county = `${countyName} County`;
    try {
        if (cache.data === null) {
            const response = await axios.get(apiUrl);
            cache.data = response.data;
            const content = cache.data;
            const csv = await neatCsv(content);
            cache.csvData = csv;
        }

        const allData = cache.csvData;
        const casesInCounty = allData.filter(d => d.AdminRegion2 === county);
        res.json(casesInCounty);
    }
    catch (ex) {
        console.log(ex);
        res.send(500);
    }
});



app.listen(port);
console.log(`service started at port ${port}`);
