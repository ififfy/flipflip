import Select from "react-select";
import * as React from "react";

import { Theme } from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import {grey} from "@mui/material/colors";

import Playlist from "../../data/Playlist";

const styles = (theme: Theme) => createStyles({
  searchSelect: {
    minWidth: 200,
    maxWidth: `calc(100% - ${theme.spacing(7)})`,
    maxHeight: theme.mixins.toolbar.minHeight,
    color: grey[900],
  },
  select: {
    color: grey[900],
  }
});


class PlaylistSelect extends React.Component {
  readonly props: {
    classes: any,
    playlists: Array<Playlist>,
    menuIsOpen?: boolean,
    autoFocus?: boolean,
    onChange(sceneID: number): void,
  }

  render() {
    const classes = this.props.classes;
    const defaults = [{label: "+ New Playlist", value: -1}];
    return (
      <Select
        className={classes.select}
        options={defaults.concat(this.props.playlists.map((p) => {return {label: p.name, value: p.id}}))}
        backspaceRemovesValue={false}
        menuIsOpen={this.props.menuIsOpen}
        autoFocus={this.props.autoFocus}
        onChange={this.onChange.bind(this)} />
    )
  }

  onChange(e: {label: any, value: any}) {
    this.props.onChange(e.value);
  }
}

(PlaylistSelect as any).displayName="PlaylistSelect";
export default withStyles(styles)(PlaylistSelect as any);