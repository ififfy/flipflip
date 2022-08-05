import * as React from "react";
import { Grid, Theme } from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import ImageView from "./ImageView";
import Scene from "../../data/Scene";

const styles = (theme: Theme) => createStyles({
  content: {
    position: 'absolute',
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
            <Grid key={x} xs={12} sm={6} md={4} lg={3} item>
              <Grid container>
                {c.map((p, y) => {
                    return (
                      <Grid key={y} xs={12} item className={classes.image}>
                        <ImageView
                          image={p}
                          fitParent
                          hasStarted
                          removeChild
                          scene={null}
                          pictureGrid/>
                      </Grid>
                    );
                  }
                )}
              </Grid>
            </Grid>
          )}
        </Grid>
      </main>
    )
  }
}

(PictureGrid as any).displayName="PictureGrid";
export default withStyles(styles)(PictureGrid as any);