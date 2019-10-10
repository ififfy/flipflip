import * as React from "react";

import {Card, CardContent, createStyles, Theme, Typography, withStyles} from "@material-ui/core";

const styles = (theme: Theme) => createStyles({});

class TextCard extends React.Component {
  readonly props: {
    classes: any,
  };

  render() {
    return(
      <Card>
        <CardContent>
          <Typography color="textSecondary" gutterBottom>
            Caption Overlay
          </Typography>

        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles)(TextCard as any);