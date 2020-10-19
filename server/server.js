const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;
const db = require('./config/db');

app.listen(PORT, () => {
    console.log(`Server On : http://localhost:${PORT}/`);
  })