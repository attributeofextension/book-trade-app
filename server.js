//Book Trading App - https://www.freecodecamp.org/challenges/manage-a-book-trading-club
//Configure Express
const express = require("express");
const app = express();

app.use(express.static('public'));
//PORT========================================================================
var listener = app.listen(8080,function() {
    console.log("Your app is listening on port " + listener.address().port);
});