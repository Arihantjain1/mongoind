const express = require('express');
const Routers = express.Router();
let uri = require('../../config/routes');
let { enums, constants } = require("../utility");


const Usermanagements = require("../api/Usermanagements");

//healthcheck
Routers.get(uri.HEALTH_CHECK, (req, res) => {
   return res.status(200).json({message: "Server is up"})
})

//create user
Routers.post(uri.CREATEUSER,(req, res) => {
    let umc = new Usermanagements(req, res);
    return umc.create();
})

//search user
Routers.post(uri.SEARCHUSER,(req, res) => {
    let umc = new Usermanagements(req, res);
    return umc.search();
})

//get index
Routers.get(uri.GETINDEX,(req, res) => {
    let umc = new Usermanagements(req, res);
    return umc.getIndex();
})

module.exports = Routers;