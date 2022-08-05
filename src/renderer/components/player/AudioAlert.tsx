import * as React from "react";
import {animated, useTransition} from "react-spring";
import Timeout = NodeJS.Timeout;

import { Theme, Typography } from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import {grey} from "@mui/material/colors";

import Audio from "../../data/Audio";

const styles = (theme: Theme) => createStyles({
  alert: {
    float: 'left',
    margin: theme.spacing(5),
    display: 'flex',
  },
  thumb: {
    maxHeight: 250,
  },
  infoContainer: {
    display: 'flex',
    position: 'relative',
    flexDirection: 'column-reverse',
  },
  infoBackdrop: {
    position: 'absolute',
    backgroundColor: grey[500],
    opacity: 0.5,
    filter: 'blur(5px)',
    width: '100%',
    height: '100%',
    zIndex: 8,
  },
  info: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    zIndex: 9,
    '&:nth-child(2)': {
      paddingBottom: theme.spacing(4),
      textDecoration: 'underline',
    },
    '&:last-child': {
      paddingTop: theme.spacing(4),
    }
  },
});

class AudioAlert extends React.Component {
  readonly props: {
    classes: any,
    audio: Audio,
  };

  readonly state = {
    visible: false,
  }

  render() {
    const classes = this.props.classes;
    if (!this.props.audio) return <React.Fragment/>;

    return (
      <this.AudioAlertLayer>
        <div className={classes.alert}>
          <img className={classes.thumb} src={this.props.audio.thumb}/>
          <div className={classes.infoContainer}>
            <div className={classes.infoBackdrop}/>
            <Typography variant="h3" className={classes.info}>
              {this.props.audio.name ? this.props.audio.name : this.props.audio.url}
            </Typography>
            {this.props.audio.artist && (
              <Typography variant="h5" className={classes.info}>
                {this.props.audio.artist}
              </Typography>
            )}
            {this.props.audio.album && (
              <Typography variant="h6" className={classes.info}>
                {this.props.audio.album}
              </Typography>
            )}
          </div>
        </div>
      </this.AudioAlertLayer>
    );
  }

  show() {
    this.setState({visible: true});
    this._timeout = setTimeout(this.hide.bind(this), 6000);
  }

  hide() {
    this.setState({visible: false});
  }

  _timeout: Timeout = null;
  componentDidMount() {
    if (this.props.audio) {
      this.show();
    }
  }

  componentDidUpdate(props: any, state: any) {
    if (this.props.audio != props.audio) {
      clearTimeout(this._timeout);
      this.show();
    }
  }

  componentWillUnmount() {
    clearTimeout(this._timeout);
    this._timeout = null;
  }

  AudioAlertLayer = (data: {children: React.ReactNode}) => {
    let fadeDuration = 2000;

    const fadeTransitions: [{item: any, props: any, key: any}] = useTransition(
      this.state.visible,
      (visible: any) => {
        return visible
      },
      {
        from: { // Base values, optional
          opacity: 0
        },
        enter: { // Styles apply for entering elements
          opacity: 1,
        },
        leave: { // Styles apply for leaving elements
          opacity: 0,
        },
        config: {
          duration: fadeDuration,
        },
      }
    );

    return (
      <React.Fragment>
        {fadeTransitions.map(({item, props, key}) => {
          return (
            <animated.div
              key={key}
              style={{
                zIndex: 10,
                position: 'absolute',
                bottom: 0,
                ...props
              }}>
              {item == true && (data.children)}
            </animated.div>
          );
        })}
      </React.Fragment>
    );
  }
}

(AudioAlert as any).displayName="AudioAlert";
export default withStyles(styles)(AudioAlert as any);