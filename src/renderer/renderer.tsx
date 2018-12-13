import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {remote} from 'electron';

import Meta from './components/Meta';

import './style.scss';

ReactDOM.render(<Meta />, document.getElementById('app'));