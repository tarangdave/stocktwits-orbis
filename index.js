const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const axios = require('axios');

const app = express();
const AWS = require('aws-sdk');


app.use(bodyParser.json({ strict: false }));

/**
 * This is a rest endpoint to fetch data from db using the
 * key passed in param.
 *
 * @param {string} key - user typed key param
 * @return {json} {key, value}
 */
app.get('/tweets/:key', (req, res) => {
    console.log(req.params.key)
    const params = {
        symbols: req.params.key,
    };

    axios.get(`https://api.stocktwits.com/api/2/streams/symbols.json?access_token=e941ade3a6646cc861360a3d2f5d907b0be32546`, {
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