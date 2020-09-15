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

class AudioAlbumList extends React.Component {
  readonly props: {
    classes: any,
    sources: Array<Audio>,
    onClickAlbum(album: string): void,
  };

  readonly state = {
    albums: this.getAlbums(),
    hover: null as any,
  };

  render() {
    const classes = this.props.classes;
    if (this.state.albums.size == 0) {
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

    const albums = Array.from(this.state.albums.keys());
    return (
      <Grid container spacing={2}>
        {albums.map((a) => {
          let thumb: string = this.state.albums.get(a);
          if (thumb) thumb = thumb.replace(/\\/g,"/");
          return (
            <Grid key={a} item xs={6} md={3} lg={2} className={classes.pointer}
                  onClick={this.props.onClickAlbum.bind(this, a)}
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
      this.setState({albums: this.getAlbums()});
    }
  }

  onMouseEnter(album: string) {
    this.setState({hover: album});
  }

  onMouseLeave() {
    this.setState({hover: null});
  }

  getAlbums(): Map<string, string> {
    const albumMap = new Map<string, string>();
    for (let song of this.props.sources) {
      if (song.album && (!albumMap.has(song.album) || !albumMap.get(song.album))) {
        albumMap.set(song.album, song.thumb);
      }
    }
    return albumMap;
  }
}

export default withStyles(styles)(AudioAlbumList as any);