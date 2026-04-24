const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const routes = require('./routes');

app
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use(express.static(path.join(__dirname, 'public')))
    .use(cors())
    .use('/', routes);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
