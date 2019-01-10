import * as React from 'react';
import {remote} from 'electron';
import fs from "fs";

export default class ImageContextMenu extends React.Component {
  readonly root: React.RefObject<HTMLImageElement> = React.createRef();
  readonly props: {
    fileURL: string,
  };
  readonly state = {
    visible: false,
  };

  componentDidMount() {
    document.addEventListener('contextmenu', this._handleContextMenu);
    document.addEventListener('click', this._handleClick);
    document.addEventListener('scroll', this._handleScroll);
  };

  componentWillUnmount() {
    document.removeEventListener('contextmenu', this._handleContextMenu);
    document.removeEventListener('click', this._handleClick);
    document.removeEventListener('scroll', this._handleScroll);
  }

  _handleContextMenu = (event : MouseEvent) => {
    event.preventDefault();

    this.setState({ visible: true });

    const clickX = event.clientX;
    const clickY = event.clientY;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const rootW = this.root.current.offsetWidth;
    const rootH = this.root.current.offsetHeight;

    const right = (screenW - clickX) > rootW;
    const left = !right;
    const top = (screenH - clickY) > rootH;
    const bottom = !top;

    if (right) {
      this.root.current.style.left = `${clickX + 5}px`;
    }

    if (left) {
      this.root.current.style.left = `${clickX - rootW - 5}px`;
    }

    if (top) {
      this.root.current.style.top = `${clickY + 5}px`;
    }

    if (bottom) {
      this.root.current.style.top = `${clickY - rootH - 5}px`;
    }
  };

  _handleClick = (event : MouseEvent) => {
    const { visible } = this.state;
    const wasOutside = !(event.target.contains === this.root);

    if (wasOutside && visible) this.setState({ visible: false, });
  };

  _handleScroll = () => {
    const { visible } = this.state;

    if (visible) this.setState({ visible: false, });
  };

  copy = () => {
    navigator.clipboard.writeText(this.props.fileURL.replace("file:///", ""));
  };

  showInFolder = () => {
    remote.shell.showItemInFolder(this.props.fileURL);
  };

  open = () => {
    remote.shell.openItem(this.props.fileURL);
  };

  delete = () => {
    let fileURL = this.props.fileURL.replace("file:///", "");
    if (confirm("Are you sure you want to delete " + fileURL + "?")) {
      if (fs.existsSync(fileURL)) {
        fs.unlink(fileURL, (err) => {
          if (err) {
            alert("An error ocurred while deleting the file: " + err.message);
            console.log(err);
            return;
          }
        });
      } else {
        alert("This file doesn't exist, cannot delete");
      }
    } else {
      // Do nothing
    }
  };

  render() {
    const isFile = this.props.fileURL.includes('file:///');
    let display = this.props.fileURL;
    if (isFile) {
      display = display.replace("file:///", "");
    }

    return(this.state.visible || null) &&
        <div ref={this.root} className="ContextMenu">
          <div className="ContextMenu--option" onClick={this.copy.bind(this)}>{display}</div>
          <div className="ContextMenu--option" onClick={this.open.bind(this)}>Open</div>
          {isFile && (
            <div>
              <div className="ContextMenu--separator" />
              <div className="ContextMenu--option" onClick={this.showInFolder.bind(this)}>Show In Folder</div>
              <div className="ContextMenu--option" onClick={this.delete.bind(this)}>Delete</div>
            </div>
          )}
          {/* Predefined classes for ContextMenu
          <div className="ContextMenu--option"/>
          <div className="ContextMenu--option ContextMenu--option__disabled"/>
          <div className="ContextMenu--separator" />*/}
        </div>
  };
}