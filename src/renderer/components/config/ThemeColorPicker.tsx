import * as React from "react";

import { Fab, Grid, TextField, Theme } from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import * as color from "@mui/material/colors";

const styles = (theme: Theme) => createStyles({
  colorGrid: {
    width: 170,
  },
  colorButton: {
    backgroundColor: theme.palette.common.white,
    marginTop: 0,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    boxShadow: 'none',
  },
  colorPickerButton: {
    backgroundColor: theme.palette.common.white,
    marginRight: theme.spacing(0.25),
    width: theme.spacing(2),
    height: theme.spacing(2),
    minHeight: theme.spacing(2),
    boxShadow: 'none',
  },
  colorField: {
    width: 100,
  },
});

const colors = [color.red, color.pink, color.purple, color.deepPurple, color.indigo, color.blue, color.lightBlue,
                color.cyan, color.teal, color.green, color.lightGreen, color.lime, color.yellow, color.amber, color.orange,
                color.deepOrange, color.brown, color.grey, color.blueGrey];

class ThemeColorPicker extends React.Component {
  readonly props: {
    classes: any,
    currentColor: string,
    onChangeColor(colorTheme: any): void,
  };

  render() {
    const classes = this.props.classes;

    return (
      <Grid container alignItems="center">
        <Grid item className={classes.colorGrid}>
          <Fab
            className={classes.colorButton}
            style={{backgroundColor: this.props.currentColor}}
            size="medium">
            <div/>
          </Fab>
          <TextField
            variant="standard"
            className={classes.colorField}
            label="Color"
            InputProps={{
              readOnly: true,
            }}
            value={this.props.currentColor} />
        </Grid>
        <Grid item xs={12} sm>
          <Grid container alignItems="center">
            {colors.map((c) =>
              <Grid key={c[500]} item>
                <Fab
                  className={classes.colorPickerButton}
                  style={{backgroundColor: c[500]}}
                  value={c[500]}
                  onClick={this.onChangeColor.bind(this, c)}
                  size="small">
                  <div/>
                </Fab>
              </Grid>
            )}
            <Grid key={color.common.white} item>
              <Fab
                className={classes.colorPickerButton}
                style={{backgroundColor: color.common.white}}
                value={color.common.white}
                onClick={this.onChangeWhite.bind(this)}
                size="small">
                <div/>
              </Fab>
            </Grid>
            <Grid key={color.common.black} item>
              <Fab
                className={classes.colorPickerButton}
                style={{backgroundColor: color.common.black}}
                value={color.common.black}
                onClick={this.onChangeBlack.bind(this)}
                size="small">
                <div/>
              </Fab>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }

  onChangeBlack() {
    const black = color.common.black;
    const grey = color.grey;
    this.props.onChangeColor({
      50: grey[50],
      100: grey[100],
      200: grey[200],
      300: grey[300],
      400: grey[400],
      500: grey[500],
      600: grey[600],
      700: grey[700],
      800: grey[800],
      900: grey[900],
      A100: grey.A100,
      A200: grey.A200,
      A400: grey.A400,
      A700: grey.A700,
      main: black,
    });
  }

  onChangeWhite() {
    const white = color.common.white;
    const grey = color.grey;
    this.props.onChangeColor({
      50: grey[900],
      100: grey[800],
      200: grey[700],
      300: grey[600],
      400: grey[500],
      500: grey[400],
      600: grey[300],
      700: grey[200],
      800: grey[100],
      900: grey[50],
      A100: grey.A700,
      A200: grey.A400,
      A400: grey.A200,
      A700: grey.A100,
      main: white,
    })
  }

  onChangeColor(color: any) {
    this.props.onChangeColor({
      50: color[50],
      100: color[100],
      200: color[200],
      300: color[300],
      400: color[400],
      500: color[500],
      600: color[600],
      700: color[700],
      800: color[800],
      900: color[900],
      A100: color.A100,
      A200: color.A200,
      A400: color.A400,
      A700: color.A700,
      main: color[500],
    });
  }
}

(ThemeColorPicker as any).displayName="ThemeColorPicker";
export default withStyles(styles)(ThemeColorPicker as any);