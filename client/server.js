const express = require('express');
const favicon = require('express-favicon');
const path = require('path');
const PORT = process.env.PORT || 5000;
const app = express();
// app.use(favicon(__dirname + '/build/favicon.ico'));
// app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', function (req, res) {
 res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.listen(PORT);