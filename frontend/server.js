const express = require('express');
const path = require('path');
var cors = require('cors');

const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.use(cors());

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(80, () => {
  console.log('App React déployée sur le port 80');
});
