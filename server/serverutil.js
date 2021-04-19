const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Router = require('../src/route');
require('dotenv').config();
let app = express();
let morgan = require('morgan')
const fs = require('fs')
let path = require('path')

const port = process.env.PORT || 4430;

let accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms',{ stream: accessLogStream }));


app.listen(port, function() {
    let info = 'Server Started on ' + port
    console.log('info', info)
});

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true,
    limit: '10mb'
}));

app.use(bodyParser.json());


app.use('/api', Router);