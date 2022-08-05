import * as React from "react";
import { withIdleTimer } from 'react-idle-timer'

class IdleTimerComponent extends React.Component {
  render () {
    return (
      <React.Fragment>
        {this.props.children}
      </React.Fragment>
    );
  }
}

export const IdleTimer = withIdleTimer(IdleTimerComponent as any)