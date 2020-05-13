const express = require('express');
const cors = require('cors');
const neatCsv = require('neat-csv');
const axios = require('axios');
const memoize = require('memoizee');
const uniq = require('lodash/uniq');

const apiUrl = 'https://raw.githubusercontent.com/microsoft/Bing-COVID-19-Data/master/data/Bing-COVID19-Data.csv';

const port = 3030;

const app = express();
app.use(cors());

app.get('/csv', async function (req, res) {
    try {
        const csvData = await getDataMemo()
        res.json(csvData);
    }
    catch (ex) {
        console.log(ex);
        res.send(500);
    }
});

app.get('/csv/county/:county', async function (req, res) {
    const countyName = req.params['county'];
    // const county = `${countyName} County`;
    const county = countyName;
    try {
        const csvData = await getDataMemo()
        const casesInCounty = csvData.filter(d => d.AdminRegion2 === county);
        res.json(casesInCounty);
    }
    catch (ex) {
        console.log(ex);
        res.send(500);
    }
});

app.get('/csv/counties', async function (req, res) {
    try {
        const csvData = await getDataMemo()
        const counties = uniq(csvData.map(d => d.AdminRegion2));
        res.json(counties);
    }
    catch (ex) {
        console.log(ex);
        res.send(500);
    }
});




app.listen(port);
console.log(`service started at port ${port}`);

async function getData() {
    const response = await axios.get(apiUrl);
    const content = response.data;
    const csv = await neatCsv(content);
    return csv;
}

const saveTime = 1000 * 60 * 60 * 10;
const getDataMemo = memoize(getData, {maxAge: saveTime});