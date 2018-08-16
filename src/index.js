import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import WrappedApp from "./WrappedApp";

ReactDOM.render(<WrappedApp />, document.getElementById('root'));
registerServiceWorker();
