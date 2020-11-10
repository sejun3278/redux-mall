const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

const router = require('./router');
const cors = require('cors');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cookieParser('adas%#$%ASDas51231ASq41WDzx3432s'));
app.use('/', router);

app.listen(PORT, () => {
    console.log(`Server On : http://localhost:${PORT}/`);
  })

app.get('/', (req, res) => {
  res.send('Sejun Node Express Server 구동 완료');
})

app.get('/get/all_cookies', (req, res) => {
  const cookies = req.cookies;

  return res.send(cookies)
})