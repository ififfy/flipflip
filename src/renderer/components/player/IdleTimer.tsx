import { Component } from 'react'
import { withIdleTimer } from 'react-idle-timer'

class IdleTimerComponent extends Component {
  render () {
    return this.props.children
  }
}

export const IdleTimer = withIdleTimer(IdleTimerComponent as any)