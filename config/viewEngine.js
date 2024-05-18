const express = require('express');
const path = require("path")
/**
 * Config view engine for app
 */
let configViewEngine = (app)=> {
    app.use(express.static("public"));
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "../views"));
};

module.exports = configViewEngine;
