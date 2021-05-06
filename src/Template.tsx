import * as React from "react";

import {createStyles, Theme, withStyles} from "@material-ui/core";

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