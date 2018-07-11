import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { BrowserRouter } from 'react-router-dom';
import { composeWithDevTools } from 'redux-devtools-extension';
import reduxThunk from 'redux-thunk';
import reducers from 'store/reducers';
import App from './App';
import 'styles/reset.css';
import 'styles/typography.css';
import registerServiceWorker from './registerServiceWorker';
import 'utils/polyfills';

let store = null;

if (process.env.NODE_ENV === 'production') {
  store = createStore(reducers, {}, applyMiddleware(reduxThunk));
} else {
  store = createStore(
    reducers,
    {},
    composeWithDevTools(applyMiddleware(reduxThunk))
  );
}

/* eslint-disable react/jsx-filename-extension */
ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);
registerServiceWorker();
