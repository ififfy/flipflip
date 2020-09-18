import * as React from "react";
import clsx from "clsx";

import {Card, CardContent, CardMedia, createStyles, Grid, Theme, Tooltip, Typography, withStyles} from "@material-ui/core";

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
    paddingTop: "100%" // 16:9  = 56.25%
  },
  underlineTitle: {
    textDecoration: 'underline',
  },
  pointer: {
    cursor: 'pointer',
  },
  root: {
    borderRadius: 1,
  },
  cardContent: {
    '&:last-child': {
      paddingBottom: theme.spacing(2),
    },
  },
  artist: {
    '&:hover': {
      textDecoration: 'underline',
    },
  }
});

class AudioAlbumList extends React.Component {
  readonly props: {
    classes: any,
    sources: Array<Audio>,
    onClickAlbum(album: string): void,
    onClickArtist(artist: string): void,
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
          const data = this.state.albums.get(a);
          let thumb: string = data.thumb;
          if (thumb) thumb = thumb.replace(/\\/g,"/");
          const artist = data.artist;
          return (
            <Grid key={a} item xs={6} sm={4} md={3} lg={2} className={classes.pointer}
                  onClick={this.onClickAlbum.bind(this, a)}
                  onMouseEnter={this.onMouseEnter.bind(this, a)}
                  onMouseLeave={this.onMouseLeave.bind(this)}>
              <Card classes={{root: classes.root}}>
                <CardMedia
                  className={classes.media}
                  image={thumb}
                  title={a}
                />
                <CardContent classes={{root: classes.cardContent}}>
                  <Tooltip title={a} enterDelay={800}>
                    <Typography
                      className={clsx(this.state.hover == a && classes.underlineTitle)}
                      noWrap
                      variant="body1">
                      {a}
                    </Typography>
                  </Tooltip>
                  <Typography
                    id={"artist-link"}
                    noWrap
                    onClick={this.props.onClickArtist.bind(this, artist)}
                    className={classes.artist}
                    color="textSecondary"
                    variant="body2">
                    {artist}
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

  onClickAlbum(album: string, e: MouseEvent) {
    const target: any = e.target;
    const id = target.getAttribute("id");
    if (id != "artist-link") {
      this.props.onClickAlbum(album);
    }
  }

  onMouseEnter(album: string) {
    this.setState({hover: album});
  }

  onMouseLeave() {
    this.setState({hover: null});
  }

  getAlbums(): Map<string, { artist: string, thumb: string }> {
    const va = "Various Artists";
    const albumMap = new Map<string, { artist: string, thumb: string }>();
    const songs = Array.from(this.props.sources).sort((a, b) => {
      if (a.album > b.album) {
        return 1;
      } else if (a.album < b.album) {
        return -1;
      } else {
        if (a.name > b.name) {
          return 1;
        } else if (a.name < b.name) {
          return -1;
        } else {
          return 0;
        }
      }
    });
    for (let song of songs) {
      if (song.album && (!albumMap.has(song.album) || !albumMap.get(song.album).thumb || (albumMap.get(song.album).artist != song.artist && albumMap.get(song.album).artist != va))) {
        if (albumMap.has(song.album) && albumMap.get(song.album).artist != song.artist) {
          albumMap.set(song.album, {artist: va, thumb: song.thumb});
        } else {
          albumMap.set(song.album, {artist: song.artist, thumb: song.thumb});
        }
      }
    }
    return albumMap;
  }
}

export default withStyles(styles)(AudioAlbumList as any);