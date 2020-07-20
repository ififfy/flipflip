import * as React from "react";
import {createStyles, Grid, Theme, withStyles} from "@material-ui/core";

const styles = (theme: Theme) => createStyles({
  content: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    height: '100vh',
    zIndex: theme.zIndex.appBar - 1,
    backgroundColor: theme.palette.background.default,
  },
  grid: {
    overflowY: 'auto',
  },
  image: {
    width: '100%',
    '&:hover': {
      opacity: 0.7,
    },
  },
  appBarSpacer: {
    backgroundColor: theme.palette.primary.main,
    ...theme.mixins.toolbar
  },
});

class PictureGrid extends React.Component {
  readonly props: {
    classes: any,
    pictures: Array<any>
  }

  render() {
    const classes = this.props.classes;
    const pictures = Array.from(this.props.pictures).reverse();
    let grid = Array<Array<any>>();
    for (let p=0; p<pictures.length; p++) {
      if (!grid[p%4]) {
        grid[p%4] = [];
      }
      grid[p%4].push(pictures[p]);
    }
    return (
      <main className={classes.content} >
        <div className={classes.appBarSpacer} />
        <Grid container className={classes.grid}>
          {grid.map((c, x) =>
            <Grid key={x} xs={3} item>
              <Grid container>
                {c.map((p, y) =>
                  <Grid key={y} xs={12} item>
                    {p instanceof HTMLImageElement && (
                      <img className={classes.image} src={p.src} {...{source: p.getAttribute("source")}}/>
                    )}
                    {p instanceof HTMLVideoElement && (
                      <video className={classes.image} src={p.src} loop muted autoPlay {...{source: p.getAttribute("source")}}/>
                    )}
                  </Grid>
                )}
              </Grid>
            </Grid>
          )}
        </Grid>
      </main>
    )
  }
}

export default withStyles(styles)(PictureGrid as any);