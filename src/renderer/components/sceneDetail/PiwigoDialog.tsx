import * as React from "react";
import wretch from "wretch";
import Sortable from "react-sortablejs";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  Theme,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Container,
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  Tooltip,
  Divider,
  Chip,
} from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import { Rating } from '@mui/material';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import {AF, PW, PWS} from "../../data/const";
import {arrayMove} from "../../data/utils";
import en from "../../data/en";

const styles = (theme: Theme) => createStyles({
  list: {},
  subList: {
    paddingLeft: 10 
  },
  rootInput: {
    marginLeft: theme.spacing(2),
    flexGrow: 1,
  },
  sortListDisabled: {
    pointerEvents: 'none',
    opacity: 0.6
  },
  sortCol: {
    marginBottom: 5,
  },
  sortColContent: {
    display: 'flex',
    padding: '5px !important'
  },
  sortColLabel: {
    lineHeight: 2,
    marginRight: 'auto'
  },
  sortColDir: {
    marginTop: 8
  },
  tagChip: {
    marginTop: 0,
    marginRight: 5,
    marginBottom: 5,
    marginLeft: 0,
  },
  areaHeaderFirst: {
    marginTop: 0
  },
  areaHeader: {
    marginTop: 15
  },
  ratingArea: {
    display: 'flex'
  },
  typeSelect: {
    marginLeft: 10
  }
});

interface Album {
    id: number, 
    tn_url: string,
    name: string,
    comment: string,
    sub_categories: Album[],
}

interface Tag {
    id: number, 
    name: string,
    counter: number,
}

interface Column {
    label: string,
    name: string,
    direction: string,
    enabled: boolean,
}

class AlbumListItem extends React.Component {
  readonly props: {
    album: Album,
    classes: any,
    selectedAlbums: number[],
    onSelect(albumID: number, selected: boolean): void,
  };

  readonly state = {
    foldersOpen: false
  };

  setOpen (foldersOpen = false, e: MouseEvent) {
    e.stopPropagation();
    this.setState({foldersOpen});
  }

  render() {
    const { foldersOpen } = this.state;
    const { album, selectedAlbums, onSelect, classes } = this.props;
    const isSelected = selectedAlbums.includes(album.id);

    return (
      <React.Fragment>
        <ListItem 
          key={album.id} 
          selected={isSelected} 
          onClick={onSelect.bind(null, album.id, !isSelected)}
          button
        >
          <ListItemAvatar>
            <Avatar
              alt={album.name}
              src={album.tn_url}
            />
          </ListItemAvatar>
          <ListItemText primary={album.name} secondary={album.comment} />
          {(album.sub_categories?.length && !foldersOpen) &&
            <Tooltip disableInteractive title="Show Sub-Albums">
              <ExpandMoreIcon onClick={this.setOpen.bind(this, true)} /> 
            </Tooltip>
          }
          {(album.sub_categories?.length && foldersOpen) &&
            <Tooltip disableInteractive title="Hide Sub-Albums">
              <ExpandLessIcon onClick={this.setOpen.bind(this, false)} /> 
            </Tooltip>
          }
        </ListItem>
        {foldersOpen &&
          <List className={classes.subList}>
            {album.sub_categories.map((album: Album) => (
                <AlbumListItem
                  classes={classes}
                  key={album.id} 
                  album={album}
                  selectedAlbums={selectedAlbums}
                  onSelect={onSelect}
                />
            ))}
          </List>
        }
      </React.Fragment>
    );
  }
}

class PiwigoDialog extends React.Component {
  readonly props: {
    config: any,
    classes: any,
    open: boolean,
    onClose(): void,
    onImportURL(type: string, e: MouseEvent, ...args: any[]): void,
  };

  readonly state = {
    listType: PW.apiTypeCategory,
    albums: [] as Album[],
    tags: [] as Tag[],
    loggedIn: false,
    selectedAlbums: [] as number[],
    selectedTags: [] as number[],
    tagModeAnd: false,
    sortRandom: false,
    recursiveMode: false,
    sortOrder: Object.values(PWS).filter((pw) => pw != PWS.sortOptionRandom).map((pw) => {return {label: en.get(pw), name: pw, direction: "DESC", enabled: false} as Column}),
  };

  render() {
    const { selectedAlbums, selectedTags, listType, albums, tags, sortOrder, sortRandom, tagModeAnd, recursiveMode } = this.state;
    const { piwigoUsername } = this.props.config.remoteSettings;
    const classes = this.props.classes;

    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.onClose.bind(this)}
        TransitionProps={{onEntered: this.onDialogEntered.bind(this)}}
        fullWidth={true}
        aria-labelledby="url-import-title"
        aria-describedby="url-import-description">
        <DialogTitle id="url-import-title">Create a New Piwigo Source</DialogTitle>
        <DialogContent>
          <FormControl variant="standard">
            <Typography component="h2" variant="h6" className={classes.areaHeaderFirst}>
              Piwigo Source Type
            </Typography>
            <DialogContentText>
              Select the type of image list to create
            </DialogContentText>
            <Select
              variant="standard"
              value={listType}
              className={classes.typeSelect}
              onChange={this.onListTypeChange.bind(this)}>
              <MenuItem value={PW.apiTypeCategory}>Album Media</MenuItem>
              <MenuItem value={PW.apiTypeTag}>Tagged Media</MenuItem>
              <MenuItem disabled={!piwigoUsername} value={PW.apiTypeFavorites}>Your Favorites</MenuItem>
            </Select>
          </FormControl>
          {listType === PW.apiTypeCategory &&
            <React.Fragment>
              <Typography component="h2" variant="h6" className={classes.areaHeader}>
                Select an Album
              </Typography>
              <DialogContentText>
                Select the album to load media from
              </DialogContentText>
              <List className={classes.list}>
                {albums.map((album: Album) => (
                    <AlbumListItem
                      classes={classes}
                      key={album.id} 
                      album={album}
                      selectedAlbums={selectedAlbums}
                      onSelect={(albumID, isSelected) => this[isSelected ? 'addSelectedAlbum' : 'removeSelectedAlbum'](albumID)}
                    />
                ))}
              </List>
              <FormControlLabel
              control={
                <Checkbox
                  onChange={this.setRecursive.bind(this, !recursiveMode)}
                  checked={recursiveMode}
                />
              }
              label="Recursive"
            />
            </React.Fragment>
          }
          {listType === PW.apiTypeTag &&
          <React.Fragment>
            <Typography component="h2" variant="h6" className={classes.areaHeader}>
              Select Tags
            </Typography>
            <DialogContentText>
              Select the tags used to retrieve media with
            </DialogContentText>
            {tags.map((tag: Tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <Chip  
                  className={classes.tagChip}
                  key={tag.name}
                  color={isSelected ? "secondary" : "primary"} 
                  onClick={this[isSelected ? "removeSelectedTag" : "addSelectedTag"].bind(this, tag.id)}
                  label={tag.name}
                />
              );
            })}
            <Divider orientation="horizontal" flexItem />
            <FormControlLabel
              control={
                <Checkbox
                  onChange={this.setTagMode.bind(this, !tagModeAnd)}
                  checked={tagModeAnd}
                />
              }
              label="Must Match All Tags"
            /> 
          </React.Fragment>
          }
          <Divider orientation="horizontal" flexItem />
          <React.Fragment>
            <Typography component="h2" variant="h6" className={classes.areaHeader}>
              Sort Order
            </Typography>
            <DialogContentText>
              Indicate the media sort order (optional)
            </DialogContentText>
            <FormControlLabel
              control={
                <Checkbox
                  onChange={this.setRandomSortOrder.bind(this, !sortRandom)}
                  checked={sortRandom}
                />
              }
              label="Randomize"
            />
            <Sortable
              className={sortRandom ? classes.sortListDisabled : null}
              options={{
                animation: 150,
                easing: "cubic-bezier(1, 0, 0, 1)",
              }}
              onChange={(order: any, sortable: any, evt: any) => {
                let newSortOrder = Array.from(this.state.sortOrder);
                arrayMove(newSortOrder, evt.oldIndex, evt.newIndex);
                this.setState({sortOrder: newSortOrder});
              }}>
              {sortOrder.map((column) =>
                <Card className={classes.sortCol} key={column.name}>
                  <CardContent className={classes.sortColContent} onClick={this.setColumnDirection.bind(this, column.name, column.direction === "ASC" ? "DESC" : "ASC")}>
                    <Checkbox checked={column.enabled} onChange={this.toggleSortColumn.bind(this, column.name, !column.enabled)} />
                    <Typography component="h3" variant="h6" className={classes.sortColLabel}>
                      {column.label}
                    </Typography>
                    {column.direction === "ASC" &&
                      <Tooltip disableInteractive title="Sort Ascending">
                          <ArrowUpwardIcon className={classes.sortColDir} />
                      </Tooltip>
                    }
                    {column.direction === "DESC" &&
                      <Tooltip disableInteractive title="Sort Descending">
                          <ArrowDownwardIcon className={classes.sortColDir} />
                      </Tooltip>
                    }
                  </CardContent>
                </Card>
              )}
            </Sortable>
          </React.Fragment>
        {(listType === PW.apiTypeTag || listType === PW.apiTypeCategory) && 
          <React.Fragment>
            <Typography component="h2" variant="h6" className={classes.areaHeader}>
              Rating
            </Typography>
            <DialogContentText>
              Indicate the media sort order (optional)
            </DialogContentText>
            <Container className={classes.ratingArea}>
              <Container>
                <Typography component="legend">Minimum Rating</Typography>
                <Rating name="pwg-image-min" precision={0.5} />
              </Container>
              <Container>
                <Typography component="legend">Maximum Rating</Typography>
                <Rating name="pwg-image-max" precision={0.5} />
              </Container>
            </Container>
          </React.Fragment>
        }
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onClose.bind(this)} color="secondary">
            Cancel
          </Button>
          <Button
            // disabled={!this.state.importURL.match("^https?://") || (this.state.importType == GT.local && this.state.rootDir.length == 0)}
            onClick={this.createAPICall.bind(this)}
            color="primary"
          >
            Create List
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  onDialogEntered () {
    const { listType } = this.state;
    if (listType === PW.apiTypeCategory) {
      this.getAlbums();
    } else if (listType === PW.apiTypeTag) {
      this.getTags();
    }
  }

  onListTypeChange(e: MouseEvent) {
    const type = (e.target as HTMLInputElement).value;
    this.setState({listType: type});
    if (type === PW.apiTypeCategory) {
      this.getAlbums();
    } else if (type === PW.apiTypeTag) {
      this.getTags();
    } 
  }

  login () {
    const { piwigoPassword, piwigoUsername } = this.props.config.remoteSettings;
    return wretch(this.makeURL())
      .formUrl({ method: "pwg.session.login", username: piwigoUsername, password: piwigoPassword })
      .post()
      .setTimeout(5000)
      // .notFound((e) => pm({
      //   error: e.message,
      //   helpers: helpers,
      //   source: source,
      //   timeout: timeout,
      // }))
      // .internalError((e) => pm({
      //   error: e.message,
      //   helpers: helpers,
      //   source: source,
      //   timeout: timeout,
      // }))
      .json((json) => {
        if (json.stat == "ok") {
          this.setState({loggedIn: true});
        } else {
          //
        }
      })
      .catch((e) => {
        //
      });
  }

  getAlbums () {
    const { piwigoUsername } = this.props.config.remoteSettings;
    const { loggedIn = false } = this.state;

    const getAlbums = () => {
      return wretch(this.makeURL())
        .formUrl({ method: "pwg.categories.getList", recursive: true, tree_output: true })
        .post()
        .setTimeout(5000)
        // .notFound((e) => pm({
        //   error: e.message,
        //   helpers: helpers,
        //   source: source,
        //   timeout: timeout,
        // }))
        // .internalError((e) => pm({
        //   error: e.message,
        //   helpers: helpers,
        //   source: source,
        //   timeout: timeout,
        // }))
        .json((json) => {
          if (json.stat == "ok") {
            this.setState({albums: json.result.map((a: Album) => a)});
          } else {
            //
          }
        })
        .catch((e) => {
          //
        });
    };

    if (!loggedIn && !!piwigoUsername) {
      this.login().then(getAlbums);
    } else {
      getAlbums();
    }
  }

  getTags () {
    const { piwigoUsername } = this.props.config.remoteSettings;
    const { loggedIn = false } = this.state;

    const getTags = () => {
      return wretch(this.makeURL())
        .formUrl({ method: "pwg.tags.getList" })
        .post()
        .setTimeout(5000)
        // .notFound((e) => pm({
        //   error: e.message,
        //   helpers: helpers,
        //   source: source,
        //   timeout: timeout,
        // }))
        // .internalError((e) => pm({
        //   error: e.message,
        //   helpers: helpers,
        //   source: source,
        //   timeout: timeout,
        // }))
        .json((json) => {
          if (json.stat == "ok") {
            this.setState({tags: json.result.tags.map((t: Tag) => t)});
          } else {
            //
          }
        })
        .catch((e) => {
          //
        });
    };

    if (!loggedIn && !!piwigoUsername) {
      this.login().then(getTags);
    } else {
      getTags();
    }
  }

  createAPICall (e: MouseEvent) {
    const { listType, sortRandom, sortOrder, selectedAlbums, selectedTags, tagModeAnd, recursiveMode } = this.state;
    let url = `${this.makeURL()}&method=${listType}`;

    if (listType === PW.apiTypeCategory) {
      url += "&" + selectedAlbums.map(catID => `cat_id[]=${catID}`).join("&");
      if (recursiveMode) {
        url += "&recursive=true"
      }
    } else if (listType === PW.apiTypeTag) {
      url += "&" + selectedTags.map(tagID => `tag_id[]=${tagID}`).join("&");
      if (tagModeAnd) {
        url += "&tag_mode_and=true"
      }
    }

    if (sortRandom) {
      url += "&order=random";
    } else {
      const sortLines = sortOrder.filter(col => col.enabled).map(col => `${col.name} ${col.direction}`).join(',');
      if (sortLines) {
        url += `&order=${encodeURIComponent(sortLines)}`;
      }
    }

    this.props.onImportURL(AF.url, null, [url]);
  }
  
  makeURL () {
    const { piwigoProtocol, piwigoHost } = this.props.config.remoteSettings;
    return piwigoProtocol + "://" + piwigoHost + "/ws.php?format=json";
  }

  addSelectedAlbum (albumID: number) {
    const { selectedAlbums } = this.state;
    this.setState({ selectedAlbums: [...selectedAlbums, albumID] } );
  }

  removeSelectedAlbum (albumID: number) {
    const { selectedAlbums } = this.state;
    this.setState({ selectedAlbums: selectedAlbums.filter((t: number) => t !== albumID) } );
  }

  addSelectedTag (tagID: number) {
    const { selectedTags } = this.state;
    this.setState({ selectedTags: [...selectedTags, tagID] } );
  }

  removeSelectedTag (tagID: number) {
    const { selectedTags } = this.state;
    this.setState({ selectedTags: selectedTags.filter((t: number) => t !== tagID) } );
  }

  setRandomSortOrder (sortRandom: boolean) {
    this.setState({sortRandom});
  }

  setRecursive (recursiveMode: boolean) {
    this.setState({recursiveMode});
  }

  setTagMode (tagModeAnd: boolean) {
    this.setState({tagModeAnd});
  }

  toggleSortColumn (columnName: string, enabled: boolean) {
    const sortOrder = Array.from(this.state.sortOrder).map((col: Column) => {
      if (col.name === columnName) {
        return { ...col, enabled };
      }
      return col;
    });
    this.setState({sortOrder});
  }

  setColumnDirection (columnName: string, direction: string) {
    const sortOrder = Array.from(this.state.sortOrder).map((col: Column) => {
      if (col.name === columnName) {
        return { ...col, enabled: true, direction };
      }
      return col;
    });
    this.setState({sortOrder});
  }
}

(PiwigoDialog as any).displayName="PiwigoDialog";
export default withStyles(styles)(PiwigoDialog as any);