import * as React from "react";
import clsx from "clsx";

import { FormControlLabel, Switch, Theme, Typography } from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import ThemeColorPicker from "../config/ThemeColorPicker";

const styles = (theme: Theme) => createStyles({
  themePicker: {
    [theme.breakpoints.up('sm')]: {
      maxWidth: theme.spacing(47),
    }
  },
  gutterBottom: {
    marginBottom: theme.spacing(2),
  },
});

class ThemeCard extends React.Component {
  readonly props: {
    classes: any,
    theme: Theme,
    onChangeThemeColor(colorTheme: any, primary: boolean): void,
    onToggleDarkMode(): void,
  };

  render() {
    const classes = this.props.classes;

    return(
      <React.Fragment>
        <div>
          <FormControlLabel
            control={
              <Switch checked={this.props.theme.palette.mode === "dark"}
                      onChange={this.props.onToggleDarkMode.bind(this)}/>
            }
            label="Dark Mode"/>
        </div>
        <div className={clsx(classes.themePicker, classes.gutterBottom)}>
          <Typography>Primary Color</Typography>
          <ThemeColorPicker
            currentColor={this.props.theme.palette.primary.main}
            onChangeColor={this.onPrimaryInput.bind(this)}/>
        </div>
        <div className={classes.themePicker}>
          <Typography>Secondary Color</Typography>
          <ThemeColorPicker
            currentColor={this.props.theme.palette.secondary.main}
            onChangeColor={this.onSecondaryInput.bind(this)}/>
        </div>
      </React.Fragment>
    );
  }

  onPrimaryInput(colorTheme: any) {
    this.props.onChangeThemeColor(colorTheme, true);
  }

  onSecondaryInput(colorTheme: any) {
    this.props.onChangeThemeColor(colorTheme, false);
  }
}

(ThemeCard as any).displayName="ThemeCard";
export default withStyles(styles)(ThemeCard as any);