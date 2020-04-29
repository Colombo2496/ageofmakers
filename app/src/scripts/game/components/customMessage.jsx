/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {Component} from 'react';
import ReactMarkdown from 'react-markdown';
import {connect} from 'react-redux';

import { mdRenderers } from '../../_reactUtils';

class CustomMessage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={`aom-${this.props.type}`}>
        <ReactMarkdown
          source={this.props.children}
          renderers={ mdRenderers }
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    quests: state.quests,
  };
};

export default connect(mapStateToProps)(CustomMessage);