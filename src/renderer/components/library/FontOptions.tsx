import * as React from "react";

import {
  Collapse,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Theme,
} from "@mui/material";

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import {FontSettingsI} from "../../data/CaptionScript";
import ColorPicker from "../config/ColorPicker";

const styles = (theme: Theme) => createStyles({
  fullWidth: {
    width: '100%',
  },
  noPadding: {
    padding: '0 !important',
  },
  endInput: {
    paddingLeft: theme.spacing(1),
    paddingTop: 0,
  },
  fontDivider: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  fontProgress: {
    position: 'absolute',
  },
});

class FontOptions extends React.Component {
  readonly props: {
    classes: any,
    name: string,
    options: FontSettingsI,
    systemFonts: Array<string>,
    onUpdateOptions(fn: (options: FontSettingsI) => void): void,
  };

  render() {
    const classes = this.props.classes;

    let fontFamily = this.props.options.fontFamily;
    if (!this.props.systemFonts.length) {
      fontFamily = ""
    } else if (fontFamily.includes(",")) {
      for (let font of fontFamily.split(",")) {
        if (this.props.systemFonts.includes(font)) {
          fontFamily = font;
          break;
        }
      }
    }

    return (
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={9}>
          <FormControl variant="standard" className={classes.fullWidth}>
            <InputLabel>{this.props.name} Font</InputLabel>
            <Select
              variant="standard"
              value={fontFamily}
              disabled={this.props.systemFonts.length == 0}
              style={{fontFamily: this.props.options.fontFamily}}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
              onChange={this.onInput.bind(this, 'fontFamily')}>
              {this.props.systemFonts.map((f) =>
                <MenuItem key={f} value={f} style={{fontFamily: f}}>{f}</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <TextField
            variant="standard"
            label="Size"
            margin="dense"
            value={this.props.options.fontSize}
            onChange={this.onIntInput.bind(this, 'fontSize')}
            onBlur={this.blurIntKey.bind(this, 'fontSize')}
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>,
            }}
            inputProps={{
              min: 1,
              type: 'number',
            }} />
        </Grid>
        <Grid item xs={12}>
          <ColorPicker
            currentColor={this.props.options.color}
            onChangeColor={this.onInput.bind(this, 'color')}/>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch checked={this.props.options.border}
                      size="small"
                      onChange={this.onBoolInput.bind(this, 'border')}/>
            }
            label="Border"/>
        </Grid>
        <Grid item xs={3}>
          <Collapse in={this.props.options.border}>
            <TextField
              variant="standard"
              label="Width"
              margin="dense"
              value={this.props.options.borderpx}
              onChange={this.onIntInput.bind(this, 'borderpx')}
              onBlur={this.blurIntKey.bind(this, 'borderpx')}
              InputProps={{
                endAdornment: <InputAdornment position="end">px</InputAdornment>,
              }}
              inputProps={{
                min: 1,
                type: 'number',
              }} />
          </Collapse>
        </Grid>
        <Grid item xs={9}>
          <Collapse in={this.props.options.border}>
            {!this.props.options.border && (<div/>)}
            {this.props.options.border && (
              <ColorPicker
                currentColor={this.props.options.borderColor}
                onChangeColor={this.onInput.bind(this, 'borderColor')}/>
            )}
          </Collapse>
        </Grid>
      </Grid>
    );
  }

  shouldComponentUpdate(props: any, state: any): boolean {
    return this.props.options !== props.options || this.props.systemFonts !== props.systemFonts;
  }

  blurIntKey(key: string, e: MouseEvent) {
    const min = (e.currentTarget as any).min ? (e.currentTarget as any).min : null;
    const max = (e.currentTarget as any).max ? (e.currentTarget as any).max : null;
    if (min && (this.props.options as any)[key] < min) {
      this.changeIntKey(key, min);
    } else if (max && (this.props.options as any)[key] > max) {
      this.changeIntKey(key, max);
    }
  }

  onIntInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.changeKey(key, input.value === '' ? '' : Number(input.value));
  }

  onBoolInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    const checked = input.checked;
    this.changeKey(key, checked);
  }

  onInput(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    this.changeKey(key, input.value);
  }

  changeIntKey(key:string, intString: string) {
    this.changeKey(key, intString === '' ? '' : Number(intString));
  }

  changeKey(key: string, value: any) {
    this.update((s) => s[key] = value);
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateOptions(fn);
  }
}

(FontOptions as any).displayName="FontOptions";
export default withStyles(styles)(FontOptions as any);