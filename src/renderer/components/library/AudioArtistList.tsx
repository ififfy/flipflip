import * as React from "react";
import clsx from "clsx";

import { Avatar, Theme, Typography } from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import AudiotrackIcon from "@mui/icons-material/Audiotrack";

import Audio from "../../data/Audio";

const styles = (theme: Theme) => createStyles({
  emptyMessage: {
    textAlign: 'center',
    marginTop: '25%',
  },
  emptyMessage2: {
    textAlign: 'center',
  },
  media: {
    height: 0,
    paddingTop: "56.25%" // 16:9
  },
  mediaIcon: {
    width: '100%',
    height: 'auto',
  },
  underlineTitle: {
    textDecoration: 'underline',
  },
  shadow: {
    boxShadow: theme.shadows[10],
  },
  artistContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  artist: {
    paddingTop: 0,
    textAlign: 'center',
    cursor: 'pointer',
  },
  trackArtist: {
    maxWidth: theme.spacing(20),
  },
  large: {
    width: theme.spacing(20),
    height: theme.spacing(20),
    borderStyle: "double",
    borderColor: theme.palette.text.primary,
    borderWidth: 2,
  },
});

class AudioArtistList extends React.Component {
  readonly props: {
    classes: any,
    sources: Array<Audio>,
    showHelp: boolean,
    onClickArtist(artist: string): void,
  };

  readonly state = {
    artists: this.getArtists(),
    hover: null as any,
  };

  render() {
    const classes = this.props.classes;
    if (this.state.artists.size == 0) {
      return (
        <React.Fragment>
          <Typography component="h1" variant="h3" color="inherit" noWrap className={classes.emptyMessage}>
            乁( ◔ ౪◔)「
          </Typography>
          <Typography component="h1" variant="h4" color="inherit" noWrap className={classes.emptyMessage2}>
            Nothing here
          </Typography>
          {this.props.showHelp && (
            <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.emptyMessage2}>
              Add tracks by going to the "Songs" tab and clicking the +
            </Typography>
          )}
        </React.Fragment>

      );
    }

    const artists = Array.from(this.state.artists.keys());
    const width = window.innerWidth - 104; // 72px drawer + 2x18px padding
    const numIcons = Math.floor(width / 178); // 160xp width + 2x9px padding
    const remainingWidth = width - (numIcons * 178);
    const padding = Math.floor(remainingWidth / numIcons / 2) + 6;
    return (
      <div className={classes.artistContainer}>
        {artists.map((a) => {
          let thumb: string = this.state.artists.get(a);
          if (thumb) thumb = thumb.replace(/\\/g,"/");
          return (
            <div key={a} className={classes.artist}
                  style={{padding: padding}}
                  onClick={this.props.onClickArtist.bind(this, a)}
                  onMouseEnter={this.onMouseEnter.bind(this, a)}
                  onMouseLeave={this.onMouseLeave.bind(this)}>
              <Avatar alt={a} src={thumb} className={clsx(classes.large, this.state.hover == a && classes.shadow)}>
                {thumb == null && (
                  <AudiotrackIcon className={classes.mediaIcon}/>
                )}
              </Avatar>
              <Typography
                display={"block"}
                className={clsx(classes.trackArtist, this.state.hover == a && classes.underlineTitle)}
                variant={"h6"}>
                {a}
              </Typography>
            </div>
          )
        })}
      </div>
    );
  }

  componentDidUpdate(props: any) {
    if (props.sources != this.props.sources) {
      this.setState({artists: this.getArtists()});
    }
  }

  onMouseEnter(artist: string) {
    this.setState({hover: artist});
  }

  onMouseLeave() {
    this.setState({hover: null});
  }

  getArtists(): Map<string, string> {
    const artistsMap = new Map<string, string>();
    const songs = Array.from(this.props.sources).sort((a, b) => {
      if (a.artist > b.artist) {
        return 1;
      } else if (a.artist < b.artist) {
        return -1;
      } else {
        const reA = /^(A\s|a\s|The\s|the\s)/g
        const aValue = a.name.replace(reA, "");
        const bValue = b.name.replace(reA, "");
        return aValue.localeCompare(bValue, 'en', { numeric: true });
      }
    });
    for (let song of songs) {
      if (song.artist && (!artistsMap.has(song.artist) || !artistsMap.get(song.artist))) {
        artistsMap.set(song.artist, song.thumb);
      }
    }
    return artistsMap;
  }
}

(AudioArtistList as any).displayName="AudioArtistList";
export default withStyles(styles)(AudioArtistList as any);