'use strict'
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cors = require("cors");
// const { readFileSync } = require("fs");
// const https = require("https");
const morgan = require('morgan')
const { LogSlack } = require("./utils/logger");

// const mongo = require("./database/connect");
// const routes = require("./routes/api");
const { APP_PORT } = process.env;

const app = express();
const PORT = APP_PORT || 8083;

app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('combined'))

const initServer = () => {
  console.log("Starting server please wait...!");
  app.listen(PORT, () => {
    LogSlack(
      "success",
      "Server initialized",
      `Server has started on https://localhost:${PORT}`,
      { icon: ":white_check_mark:" }
    );
    console.log(`Server has started on https://localhost:${PORT}`);
  })
}

initServer()