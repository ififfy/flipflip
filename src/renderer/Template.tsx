import * as React from "react";

import { Theme } from "@mui/material";

import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";

const styles = (theme: Theme) => createStyles({});

interface TemplateProps {
  classes: any;
}

class Template extends React.Component<TemplateProps> {
  readonly props: TemplateProps;

  constructor(props: TemplateProps) {
    super(props);
  }

  render() {
    const classes = this.props.classes;

    return <div />;
  }
}

(Template as any).displayName = "Template";
export default withStyles(styles)(Template as any);
