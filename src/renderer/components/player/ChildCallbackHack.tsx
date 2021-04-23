/**
 * Stupid hack to let Player ask ImagePlayer to advance when user hits right arrow
 * and history is already at the present.
 *
 * Normally a parent React component shouldn't be able to do anything to its children
 * other than pass new values. But I just wanted a quick way to call ImagePlayer.advance()
 * at a weird time, so the Player creates one of these, and ImagePlayer sets its own
 * method as the listener.
 */
export default class ChildCallbackHack {
  listener?: (args?: any[]) => void;
  args?: any[];

  fire() {
    if (this.listener) this.listener(this.args);
  }
}