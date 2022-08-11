import * as React from "react";
import clsx from "clsx";
import Select, {components} from "react-select";
import CreatableSelect from "react-select/creatable";

import { Checkbox, Theme } from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import {grey} from "@mui/material/colors";

import {getSourceType} from "../player/Scrapers";
import en from "../../data/en";
import Audio from "../../data/Audio";
import LibrarySource from "../../data/LibrarySource";
import Tag from "../../data/Tag";

const styles = (theme: Theme) => createStyles({
  searchSelect: {
    minWidth: 200,
    maxHeight: theme.mixins.toolbar.minHeight,
    color: grey[900],
  },
  limitWidth: {
    maxWidth: `calc(100% - ${theme.spacing(7)})`,
  },
  select: {
    color: grey[900],
  }
});

class LibrarySearch extends React.Component {
  readonly props: {
    classes: any,
    displaySources: Array<LibrarySource | Audio>,
    tags: Array<Tag>,
    filters: Array<string>,
    placeholder: string,
    autoFocus?: boolean,
    controlShouldRenderValue?: boolean,
    hideSelectedOptions?: boolean,
    isClearable?: boolean
    isCreatable?: boolean,
    menuIsOpen?: boolean,
    noTypes?: boolean,
    onlyTags?: boolean,
    onlyTagsAndTypes?: boolean,
    onlyUsed?: boolean
    showCheckboxes?: boolean,
    fullWidth?: boolean,
    withBrackets?: boolean,
    onUpdateFilters(filter: Array<string>): void,
  };

  readonly state = {
    searchInput: "",
    options: Array<{ label: string, value: string }>(),
    defaultValues: Array<{ label: string, value: string }>(),
  };

  Option = (props: any) => (
    <div>
      <components.Option {...props}>
        {this.props.showCheckboxes &&
          <Checkbox className={this.props.classes.select} checked={props.isSelected} onChange={() => null}/>
        }
        <label>{props.label}</label>
      </components.Option>
    </div>
  );
  MultiValue = (props: any) => (
    <components.MultiValue {...props}>
      <span>{props.data.label}</span>
    </components.MultiValue>
  );

  render() {
    const Option = this.Option;
    const MultiValue = this.MultiValue;
    const classes = this.props.classes;
    if (this.props.isCreatable) {
      return (
        <CreatableSelect
          className={clsx(classes.searchSelect, "CreatableSelect", !this.props.fullWidth && classes.limitWidth)}
          value={this.state.defaultValues}
          options={this.state.options}
          components={{DropdownIndicator: null,}}
          menuIsOpen={this.props.menuIsOpen}
          autoFocus={this.props.autoFocus}
          inputValue={this.state.searchInput}
          isClearable
          isMulti
          rightAligned
          controlShouldRenderValue={this.props.controlShouldRenderValue}
          placeholder={this.props.placeholder}
          formatCreateLabel={(input: string) => "Search for " + input}
          onChange={this.handleChange}
          onInputChange={this.handleInputChange}
        />
      );
    } else {
      return (
        <Select
          className={classes.select}
          value={this.state.defaultValues}
          options={this.state.options}
          components={{ Option, MultiValue }}
          menuIsOpen={this.props.menuIsOpen}
          autoFocus={this.props.autoFocus}
          isClearable={this.props.isClearable}
          isMulti
          controlShouldRenderValue={this.props.controlShouldRenderValue}
          hideSelectedOptions={this.props.hideSelectedOptions}
          closeMenuOnSelect={false}
          backspaceRemovesValue={false}
          placeholder={this.props.placeholder}
          onChange={this.handleChange} />
      );
    }
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
    const tags = new Map<string, number>();
    if (!this.props.onlyUsed) {
      this.props.tags.forEach((t) => tags.set(t.name, 0));
    }
    const types = new Map<string, number>();
    let untaggedCount = 0;
    let offlineCount = 0;
    let markedCount = 0;
    const options = Array<{ label: string, value: string }>();
    const defaultValues = Array<{ label: string, value: string }>();
    for (let source of this.props.displaySources) {
      if (!!(source as any).offline) {
        offlineCount++;
      }
      if (source.marked) {
        markedCount++;
      }

      let untagged = true;
      if (source.tags.length > 0) {
        untagged = false;
        for (let tag of source.tags) {
          if (tags.has(tag.name)) {
            tags.set(tag.name, tags.get(tag.name) + 1);
          } else {
            tags.set(tag.name, 1);
          }
        }
      }

      if (source instanceof LibrarySource) {
        for (let clip of source.clips) {
          for (let tag of clip.tags) {
            untagged = false;
            if (!source.tags.includes(tag)) {
              if (tags.has(tag.name)) {
                tags.set(tag.name, tags.get(tag.name) + 1);
              } else {
                tags.set(tag.name, 1);
              }
            }
          }
        }
      }

      if (untagged) {
        untaggedCount += 1;
      }

      const type = en.get(getSourceType(source.url));
      if (types.has(type)) {
        types.set(type, types.get(type) + 1);
      } else {
        types.set(type, 1);
      }
    }
    const tagKeys = Array.from(tags.keys()).sort((a, b) => {
      const aCount = tags.get(a);
      const bCount = tags.get(b);
      if (aCount > bCount) {
        return -1;
      } else if (aCount < bCount) {
        return 1;
      } else {
        return 0;
      }
    });
    const typeKeys = Array.from(types.keys()).sort((a, b) => {
      const aCount = types.get(a);
      const bCount = types.get(b);
      if (aCount > bCount) {
        return -1;
      } else if (aCount < bCount) {
        return 1;
      } else {
        return 0;
      }
    });
    for (let filter of this.props.filters) {
      const opt = {label: filter, value: filter};
      options.push(opt);
      defaultValues.push(opt);
    }

    if (!this.props.onlyTags && !this.props.onlyTagsAndTypes) {
      if (untaggedCount > 0 && !this.props.filters.includes("<Untagged>")) {
        options.push({label: "<Untagged> (" + untaggedCount + ")", value: "<Untagged>"});
      }
      if (offlineCount > 0 && !this.props.filters.includes("<Offline>")) {
        options.push({label: "<Offline> (" + offlineCount + ")", value: "<Offline>"});
      }
      if (markedCount > 0 && !this.props.filters.includes("<Marked>")) {
        options.push({label: "<Marked> (" + markedCount + ")", value: "<Marked>"});
      }
    }
    for (let tag of tagKeys) {
      const opt = this.props.isCreatable || this.props.withBrackets ? "[" + tag + "]" : tag;
      if (!this.props.filters.includes(opt)) {
        options.push({label: tag + " (" + tags.get(tag) + ")", value: opt});
      }
    }
    if (!this.props.onlyTags && !this.props.noTypes) {
      for (let type of typeKeys) {
        const opt = this.props.isCreatable || this.props.withBrackets ? "{" + type + "}" : type;
        if (!this.props.filters.includes(opt)) {
          options.push({label: type + " (" + types.get(type) + ")", value: opt});
        }
      }
    }
    if (this.state.searchInput.startsWith("-")) {
      for (let tag of tagKeys) {
        const opt = this.props.isCreatable || this.props.withBrackets ? "[" + tag + "]" : tag;
        if (!this.props.filters.includes(opt)) {
          options.push({label: "-" + tag + " (" + tags.get(tag) + ")", value: "-" + opt});
        }
      }
      for (let type of typeKeys) {
        const opt = this.props.isCreatable || this.props.withBrackets ? "{" + type + "}" : type;
        if (!this.props.filters.includes(opt)) {
          options.push({label: "-" + type + " (" + types.get(type) + ")", value: "-" + opt});
        }
      }
    }
    this.setState({options: options, defaultValues: defaultValues, })
  }

  handleChange = (search: [{label: string, value: string}]) => {
    if (search == null) {
      this.props.onUpdateFilters([]);
    } else {
      let filters = Array<string>();
      for (let s of search) {
        if (!this.props.isCreatable || ((s.value.startsWith("[") || s.value.startsWith("-[")) && s.value.endsWith("]")) ||
          ((s.value.startsWith("{") || s.value.startsWith("-{")) && s.value.endsWith("}")) || s.value.startsWith("playlist:") ||
          s.value.startsWith("artist:") || s.value.startsWith("album:") ||
          ((s.value.startsWith('"') || s.value.startsWith('-"')) && s.value.endsWith('"')) ||
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

(LibrarySearch as any).displayName="LibrarySearch";
export default withStyles(styles)(LibrarySearch as any);