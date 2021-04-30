// Install Express Server
const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Create link to Angular build directory
const distDir = __dirname + "/dist";
app.use(express.static(distDir));

// Pass our application into our routes.
app.get('*', function (req, res) {
  res.sendFile(`${distDir}/index.html`); // load our index.html file
});

// Initialize the app.
const server = app.listen(process.env.PORT || 4200, function () {
  const port = server.address().port;
  console.log("App now running on port", port);
});
