const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const TOKEN = process.env.ACCESS_TOKEN;

const app = express();
app.use(cors());
const AWS = require('aws-sdk');


app.use(bodyParser.json({ strict: false }));

/**
 * This is a rest endpoint to fetch data from stocktwits API using the
 * key passed in param.
 *
 * @param {string} key - user typed key param
 * @return {json} {key, value}
 */
app.get('/tweets/:key', (req, res) => {
    const params = {
        symbols: req.params.key,
    };

    axios.get(`https://api.stocktwits.com/api/2/streams/symbols.json?access_token=${TOKEN}`, {
        data: params
    })
    .then((response) => {
        res.json(response.data );
    })
    .catch((error) => {
        // handle error
        console.log(error);
        res.status(404).json({ error: 'Symbol not found' });
    });
  
});

module.exports.handler = serverless(app);