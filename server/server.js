const express = require('express');
const app = express();
const PORT = process.env.PORT || 4002;

const fileUpload = require('express-fileupload');
const router = require('./router');
const cors = require('cors');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// app.use(session({
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
//   store: new FileStore()
// }));

// app.all('*', function(req, res, next) {
//   res.setHeader("Access-Control-Allow-Origin", 'http://sejun-redux-mall.s3-website.ap-northeast-2.amazonaws.com/');
//   res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
//   res.setHeader("Access-Control-Allow-Credentials", true);
//   next();
// });

// app.set('trust proxy', 1)
// app.enable('trust proxy')

// app.use(session({
//   secret : 'somesecret',
//   store : '',
//   key : 'sid',
//   cookie : {
//       secure : true, // it works without the secure flag (cookie is set)
//       proxy : true,  // tried using this as well, no difference
//       maxAge: 5184000000 // 2 months
//   }
// }));

app.use(express.json());
app.use(cors());

app.use(fileUpload());
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