import * as React from "react";
import clsx from "clsx";
import CreatableSelect from "react-select/creatable";

import {createStyles, Theme, withStyles} from "@material-ui/core";
import {grey} from "@material-ui/core/colors";

import Scene from "./data/Scene";

const styles = (theme: Theme) => createStyles({
  searchSelect: {
    minWidth: 200,
    maxWidth: `calc(100% - ${theme.spacing(7)}px)`,
    maxHeight: theme.mixins.toolbar.minHeight,
    color: grey[900],
  },
  select: {
    color: grey[900],
  }
});

class SceneSearch extends React.Component {
  readonly props: {
    classes: any,
    displaySources: Array<Scene>,
    filters: Array<string>,
    placeholder: string,
    onUpdateFilters(filter: Array<string>): void,
  };

  readonly state = {
    searchInput: "",
    options: Array<{ label: string, value: string }>(),
    defaultValues: Array<{ label: string, value: string }>(),
  };

  render() {
    const classes = this.props.classes;
    return (
      <CreatableSelect
        className={clsx(classes.searchSelect, "CreatableSelect")}
        components={{DropdownIndicator: null,}}
        value={this.state.defaultValues}
        options={this.state.options}
        inputValue={this.state.searchInput}
        isClearable
        isMulti
        rightAligned
        placeholder={this.props.placeholder}
        formatCreateLabel={(input: string) => "Search for " + input}
        onChange={this.handleChange}
        onInputChange={this.handleInputChange}
      />
    );
  }

  componentDidMount() {
    this.update();
  }

  componentDidUpdate(props: any) {
    if (props) {
      if (props.filters != this.props.filters ||
        props.displaySources != this.props.displaySources) {
        this.update();
      }
    }
  }

  update() {
    const options = Array<{ label: string, value: string }>();
    const defaultValues = Array<{ label: string, value: string }>();
    for (let filter of this.props.filters) {
      const opt = {label: filter, value: filter};
      options.push(opt);
      defaultValues.push(opt);
    }
    this.setState({options: options, defaultValues: defaultValues})
  }

  handleChange = (search: [{label: string, value: string}]) => {
    if (search == null) {
      this.props.onUpdateFilters([]);
    } else {
      let filters = Array<string>();
      for (let s of search) {
        if (((s.value.startsWith('"') || s.value.startsWith('-"')) && s.value.endsWith('"')) ||
          ((s.value.startsWith('\'') || s.value.startsWith('-\'')) && s.value.endsWith('\''))) {
          filters = filters.concat(s.value);
        } else {
          filters = filters.concat(s.value.split(" "));
        }
      }
      this.props.onUpdateFilters(filters);
    }
  };

  handleInputChange = (searchInput: string) => {
    this.setState({searchInput})
  };
}

(SceneSearch as any).displayName="SceneSearch";
export default withStyles(styles)(SceneSearch as any);