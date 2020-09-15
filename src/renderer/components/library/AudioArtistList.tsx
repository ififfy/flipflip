import * as React from "react";
import clsx from "clsx";

import {Card, CardContent, CardMedia, createStyles, Grid, Theme, Typography, withStyles} from "@material-ui/core";

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
  pointer: {
    cursor: 'pointer',
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
    return (
      <Grid container spacing={2} >
        {artists.map((a) => {
          let thumb: string = this.state.artists.get(a);
          if (thumb) thumb = thumb.replace(/\\/g,"/");
          return (
            <Grid key={a} item xs={6} md={3} lg={2} className={classes.pointer}
                  onClick={this.props.onClickArtist.bind(this, a)}
                  onMouseEnter={this.onMouseEnter.bind(this, a)}
                  onMouseLeave={this.onMouseLeave.bind(this)}>
              <Card>
                <CardMedia
                  className={classes.media}
                  image={thumb}
                  title={a}
                />
                <CardContent>
                  <Typography
                    className={clsx(this.state.hover == a && classes.underlineTitle)}
                    variant="h6"
                    color="textSecondary"
                    component="p">
                    {a}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
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