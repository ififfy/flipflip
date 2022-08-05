import * as React from "react";
import clsx from "clsx";

import { Card, CardContent, CardMedia, Grid, Theme, Tooltip, Typography } from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import Audio from "../../data/Audio";
import Playlist from "../../data/Playlist";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";

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

class PlaylistList extends React.Component {
  readonly props: {
    classes: any,
    playlists: Array<Playlist>,
    audios: Array<Audio>,
    showHelp: boolean,
    onClickPlaylist(playlist: string): void,
  };

  readonly state = {
    playlists: this.getPlaylists(),
    hover: null as any,
  };

  render() {
    const classes = this.props.classes;
    if (this.state.playlists.size == 0) {
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
              Create playlists by clicking "Add to Playlist" in the sidebar
            </Typography>
          )}
        </React.Fragment>

      );
    }

    const playlists = Array.from(this.state.playlists.keys());
    return (
      <Grid container spacing={2}>
        {playlists.map((p) => {
          const thumbs = this.state.playlists.get(p).map((thumb) => thumb.replace(/\\/g,"/"));
          if (thumbs.length == 2) {
            thumbs.push("");
            thumbs.push("");
            thumbs[3]=thumbs[1];
            thumbs[1]="";
          }
          return (
            <Grid key={p} item xs={6} sm={4} md={3} lg={2} className={classes.pointer}
                  onClick={this.props.onClickPlaylist.bind(this, p)}
                  onMouseEnter={this.onMouseEnter.bind(this, p)}
                  onMouseLeave={this.onMouseLeave.bind(this)}>
              <Card classes={{root: classes.root}}>
                <Grid container>
                  {thumbs.map((t, index) =>
                    <Grid item xs={thumbs.length == 1 ? 12 : 6} key={index}>
                      {t && (
                        <CardMedia
                          className={classes.media}
                          image={t}
                        />
                      )}
                    </Grid>
                  )}
                  {thumbs.length == 0 && (
                    <Grid item xs={12}>
                      <AudiotrackIcon className={classes.mediaIcon}/>
                    </Grid>
                  )}
                </Grid>
                <CardContent classes={{root: classes.cardContent}}>
                  <Typography
                    className={clsx(this.state.hover == p && classes.underlineTitle)}
                    noWrap
                    variant="body1">
                    {p}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    );
  }

  componentDidUpdate(props: any) {
    if (props.playlists != this.props.playlists) {
      this.setState({playlists: this.getPlaylists()});
    }
  }

  onMouseEnter(album: string) {
    this.setState({hover: album});
  }

  onMouseLeave() {
    this.setState({hover: null});
  }

  getPlaylists(): Map<string, Array<string>> {
    const playlistsMap = new Map<string, Array<string>>();
    for (let playlist of this.props.playlists) {
      let thumbs: Array<string> = [];
      for (let aID of playlist.audios) {
        const audio = this.props.audios.find((a) => a.id == aID);
        if (audio && audio.thumb && !thumbs.includes(audio.thumb)) {
          thumbs.push(audio.thumb);
        }
        if (thumbs.length == 4) {
          break;
        }
      }
      playlistsMap.set(playlist.name, thumbs);
    }
    return playlistsMap;
  }
}

(PlaylistList as any).displayName="PlaylistList";
export default withStyles(styles)(PlaylistList as any);