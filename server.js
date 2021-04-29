//Install express server
import {environment} from "./src/environments/environment";

const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Create link to Angular build directory
const distDir = __dirname + "/dist/";
app.use(express.static(distDir));

// Pass our application into our routes.
app.get('*', function (req, res) {
  res.sendFile('./dist/index.html'); // load our index.html file
});

// Initialize production config vars.
environment.dartsMatcherApiUrl=process.env.DARTS_MATCHER_API_URL;
environment.dartsMatcherWebsocketUrl=process.env.DARTS_MATCHER_WEBSOCKET_URL;
environment.testString=process.env.TEST_STRING;

// Initialize the app.
const server = app.listen(process.env.PORT || 4200, function () {
  const port = server.address().port;
  console.log("App now running on port", port);
});
