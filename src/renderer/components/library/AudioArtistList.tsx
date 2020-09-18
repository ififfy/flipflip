import * as React from "react";
import clsx from "clsx";

import {Avatar, createStyles, Theme, Typography, withStyles} from "@material-ui/core";

import AudiotrackIcon from "@material-ui/icons/Audiotrack";

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
        </React.Fragment>

      );
    }

    const artists = Array.from(this.state.artists.keys());
    const width = window.innerWidth - 104;
    const numIcons = Math.floor(width / 178);
    const remainingWidth = width - (numIcons * 178);
    const padding = Math.floor(remainingWidth / numIcons / 2) + 8;
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
                  <AudiotrackIcon/>
                )}
              </Avatar>
              <Typography
                noWrap
                className={clsx(this.state.hover == a && classes.underlineTitle)}
                variant={"h6"}>
                {a}
              </Typography>
            </div>
          )
        })}
      </div>
    )
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
    for (let song of this.props.sources) {
      if (song.artist && (!artistsMap.has(song.artist) || !artistsMap.get(song.artist))) {
        artistsMap.set(song.artist, song.thumb);
      }
    }
    return artistsMap;
  }
}

export default withStyles(styles)(AudioArtistList as any);