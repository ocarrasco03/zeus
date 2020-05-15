"use strict";
const express = require("express");
const router = express.Router();
const { graphql, buildSchema } = require("graphql");
const graphqlExpress = require("express-graphql");
const { readFileSync } = require("fs");
const { join } = require("path");
const resolvers = require('../lib/resolvers')

const API_BASE = "/api/v1";

const schema = buildSchema(
  readFileSync(join(__basedir, 'lib', "companiesSchema.graphql"), 'utf-8')
);
router.use(
  `${API_BASE}/`,
  graphqlExpress({
    schema: schema,
    rootValue: resolvers,
    graphiql: true,
  })
);

router.get("/", function (req, res) {
  res.send("hello, world!");
});



module.exports = router;
