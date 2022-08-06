import * as React from "react";
import clsx from "clsx";

import { Card, CardContent, CardMedia, Grid, Theme, Tooltip, Typography } from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import AudiotrackIcon from '@mui/icons-material/Audiotrack';

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
  mediaIcon: {
    width: '100%',
    height: 'auto',
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
    showHelp: boolean,
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
          {this.props.showHelp && (
            <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.emptyMessage2}>
              Add tracks by going to the "Songs" tab and clicking the +
            </Typography>
          )}
        </React.Fragment>

      );
    }

    const va = "Various Artists";
    const albums = Array.from(this.state.albums.keys());
    return (
      <Grid container spacing={2}>
        {albums.map((a) => {
          const data = this.state.albums.get(a);
          let thumb: string = data.thumb;
          if (thumb) thumb = thumb.replace(/\\/g,"/");
          const artist = data.artist;
          const count = data.count;
          return (
            <Grid key={a} item xs={6} sm={4} md={3} lg={2} className={classes.pointer}
                  onClick={this.props.onClickAlbum.bind(this, a)}
                  onMouseEnter={this.onMouseEnter.bind(this, a)}
                  onMouseLeave={this.onMouseLeave.bind(this)}>
              <Card classes={{root: classes.root}}>
                {thumb &&  (
                  <CardMedia
                    className={classes.media}
                    image={thumb}
                    title={a}/>
                )}
                {!thumb && (
                  <AudiotrackIcon className={classes.mediaIcon}/>
                )}
                <CardContent classes={{root: classes.cardContent}}>
                  <Tooltip disableInteractive title={a} enterDelay={800}>
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
                    onClick={artist == va ? this.nop : this.props.onClickArtist.bind(this, artist)}
                    className={clsx(artist != va && classes.artist)}
                    color="textSecondary"
                    variant="body2">
                    {artist}
                  </Typography>
                  <Typography
                    noWrap
                    className={classes.songCount}
                    color="textSecondary"
                    variant="body2">
                    {count} {count == 1 ? "song" : "songs"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    );
  }

  nop() {}

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

  getAlbums(): Map<string, { artist: string, thumb: string, count: number }> {
    const va = "Various Artists";
    const albumMap = new Map<string, { artist: string, thumb: string, count: number }>();
    const songs = Array.from(this.props.sources).sort((a, b) => {
      if (a.album > b.album) {
        return 1;
      } else if (a.album < b.album) {
        return -1;
      } else {
        if (a.trackNum > b.trackNum) {
          return 1;
        } else if (a.trackNum < b.trackNum) {
          return -1;
        } else {
          const reA = /^(A\s|a\s|The\s|the\s)/g
          const aValue = a.name.replace(reA, "");
          const bValue = b.name.replace(reA, "");
          return aValue.localeCompare(bValue, 'en', {numeric: true});
        }
      }
    });
    for (let song of songs) {
      if (song.album && (!albumMap.has(song.album) || !albumMap.get(song.album).thumb || (albumMap.get(song.album).artist != song.artist && albumMap.get(song.album).artist != va))) {
        if (albumMap.has(song.album) && albumMap.get(song.album).artist != song.artist) {
          albumMap.set(song.album, {artist: va, thumb: song.thumb, count: 0});
        } else {
          albumMap.set(song.album, {artist: song.artist, thumb: song.thumb, count: 0});
        }
      }
    }
    for (let song of songs) {
      if (song.album) {
        const album = albumMap.get(song.album);
        albumMap.set(song.album, {artist: album.artist, thumb: album.thumb, count: album.count + 1});
      }
    }
    return albumMap;
  }
}

(AudioAlbumList as any).displayName="AudioAlbumList";
export default withStyles(styles)(AudioAlbumList as any);