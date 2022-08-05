import * as React from "react";

import { Theme } from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

const styles = (theme: Theme) => createStyles({});

class Template extends React.Component {
  readonly props: {
    classes: any,
  };

  render() {
    const classes = this.props.classes;

    return(
      <div/>
    );
  }
}

(Template as any).displayName="Template";
export default withStyles(styles)(Template as any);