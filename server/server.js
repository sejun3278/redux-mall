const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;
const db = require('./config/db');

app.listen(PORT, () => {
    console.log(`Server On : http://localhost:${PORT}/`);
  })

  
app.get('/', (req, res) => {
  res.send('Sejun Node Express Server 구동 완료');
})

app.get('/test', (req, res) => {
  res.send('테스트 화면입니다.');
})

app.get('/data', (req, res) => {
  res.send({ result : '서버 통신 완료' });
})

app.get('/get/db_data', (req, res) => {
  db.query("select * from test", (err, data) => {
      if(!err) {
          res.send(data);

      } else {
          console.log(err);
          res.send(err);
      }
  })
})