import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import './css/origin.css';

import { Provider } from 'react-redux';
import Store from './Store';

import App from './App';
// import Config from '../src/page/config/config';

import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

ReactDOM.render(
  <Provider store={Store}>
    <BrowserRouter>
      {/* <Config /> */}
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
