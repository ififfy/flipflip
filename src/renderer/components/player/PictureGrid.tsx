import * as React from "react";
import { Theme } from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import Masonry from '@mui/lab/Masonry';

import ImageView from "./ImageView";

const styles = (theme: Theme) => createStyles({
  content: {
    position: 'absolute',
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
    zIndex: theme.zIndex.appBar - 1,
    backgroundColor: theme.palette.background.default,
  },
  masonry: {
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: 'calc(100% - ' + theme.mixins.toolbar.minHeight + 'px)',
  },
  image: {
    marginBottom: 0,
    '&:hover': {
      opacity: 0.7,
    },
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
    return (
      <div className={classes.content} >
        <div className={classes.masonry}>
          <Masonry columns={4} spacing={1}>
            {pictures.map((p, x) =>
              <ImageView
                key={x}
                className={classes.image}
                image={p}
                fitParent
                hasStarted
                removeChild
                scene={null}
                pictureGrid/>
            )}
          </Masonry>
        </div>
      </div>
    )
  }
}

(PictureGrid as any).displayName="PictureGrid";
export default withStyles(styles)(PictureGrid as any);