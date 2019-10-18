import * as React from 'react';

import {SvgIcon} from "@material-ui/core";
import FolderIcon from '@material-ui/icons/Folder';
import InstagramIcon from '@material-ui/icons/Instagram';
import ListIcon from '@material-ui/icons/List';
import MovieIcon from '@material-ui/icons/Movie';
import RedditIcon from '@material-ui/icons/Reddit';
import TwitterIcon from '@material-ui/icons/Twitter';

import {getSourceType} from "../../data/utils";
import {ST} from "../../data/const";

function TumblrIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 430.118 430.118" fontSize="small">
      <path d="M252.797 351.543c-7.229-4.247-13.866-11.547-16.513-18.589c-2.679-7.09-2.338-21.455-2.338-46.419V176.243
		  h100.301V99.477H233.951V0h-61.713c-2.753 22.155-7.824 40.459-15.18 54.815c-7.369 14.377-17.088 26.658-29.276
		  36.924 c-12.127 10.246-31.895 18.143-48.927 23.589v60.915h58.922v150.836c0 19.694 2.088 34.718 6.24 45.061 c4.172
		  10.333 11.623 20.124 22.386 29.337c10.762 9.115 23.758 16.228 39.003 21.226c15.227 4.942 26.936 7.416 46.767 7.416
		  c17.445 0 33.687-1.759 48.747-5.198c15.042-3.529 31.834-9.605 50.344-18.221v-67.859c-21.721 14.169-43.567
		  21.221-65.535 21.221 C273.364 360.065 262.435 357.223 252.797 351.543z"/>
    </SvgIcon>
  );
}

function ImageFapIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 30">
    </SvgIcon>
  );
}

function SexComIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 232 367" fontSize="small">
      <path d="M190.02 279.731c0-34.495-18.11-62.963-71.584-81.073l-40.537-13.793C25.28 166.742 4.157 133.97 4.157
      94.737c0-61.24 47.433-94.01 109.527-94.01 43.13 0 69.874 9.054 94.446
      23.716v52.605h-4.318c-19.399-49.157-51.736-62.964-88.824-62.964-39.682 0-69.86 27.6-69.86 61.24 0 29.323 11.213
      52.185 53.895 67.28l31.916 11.2c42.26 14.662 100.907 35.8 100.907 105.66 0 64.252-44.84 107.382-118.162
      107.382-45.709 0-84.087-9.924-113.41-30.192v-59.516H4.59c28.454 71.598 68.136 74.177 103.5 74.177 55.199 0
      81.929-31.916 81.929-71.584" />
    </SvgIcon>
  );
}

function ImgurIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 1000 1000" fontSize="small">
      <path d="M623.7,843c0 80.8-55.7 147-123.7 147c-68 0-123.7-66.2-123.7-147V449.3c0-80.8 55.7-147 123.7-147c68 0
      123.7 66.2 123.7 147V843z M500 10c-68.3 0-123.7 55.4-123.7 123.7c0 68.3 55.4 123.7 123.7 123.7c68.3 0 123.7-55.4
      123.7-123.7C623.7 65.4 568.3 10 500 10z"/>
    </SvgIcon>
  );
}

function DeviantArtIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 426.365 426.365" fontSize="small">
      <path d="M347.683 0h-85.956l-35.418 68.554c-4.278 8.281-12.82 13.483-22.141 13.483H78.683v108.882h67.924 c7.52 0
      12.37 7.964 8.918 14.645L78.683 354.299v72.066h85.81l35.418-68.554c4.278-8.281 12.82-13.483 22.141-13.483h125.631
      V235.446h-68.07c-7.52 0-12.37-7.964-8.918-14.645l76.988-149.016L347.683 0L347.683 0z"/>
    </SvgIcon>
  );
}

function DanbooruIcon(props: any) {
  return (
    <SvgIcon {...props}>
    </SvgIcon>
  );
}

function GelbooruIcon(props: any) {
  return (
    <SvgIcon {...props}>
    </SvgIcon>
  );
}

function EHentaiIcon(props: any) {
  return (
    <SvgIcon {...props}>
    </SvgIcon>
  );
}


export default class SourceIcon extends React.Component {
  readonly props: {
    url?: string,
    type?: string
    className?: string,
  };

  render() {
    let type = "";
    if (this.props.url) {
      type = getSourceType(this.props.url);
    } else if (this.props.type) {
      type = this.props.type;
    }
    switch(type) {
      case ST.local:
        return <FolderIcon className={this.props.className}/>;
      case ST.video:
        return <MovieIcon className={this.props.className}/>;
      case ST.list:
        return <ListIcon className={this.props.className}/>;
      case ST.reddit:
        return <RedditIcon className={this.props.className}/>;
      case ST.twitter:
        return <TwitterIcon className={this.props.className}/>;
      case ST.instagram:
        return <InstagramIcon className={this.props.className}/>;
      case ST.tumblr:
        return <TumblrIcon className={this.props.className}/>;
      case ST.imagefap:
        return <ImageFapIcon className={this.props.className}/>;
      case ST.sexcom:
        return <SexComIcon className={this.props.className}/>;
      case ST.imgur:
        return <ImgurIcon className={this.props.className}/>;
      case ST.deviantart:
        return <DeviantArtIcon className={this.props.className}/>;
      case ST.danbooru:
        return <DanbooruIcon className={this.props.className}/>;
      case ST.gelbooru1:
      case ST.gelbooru2:
        return <GelbooruIcon className={this.props.className}/>;
      case ST.ehentai:
        return <EHentaiIcon className={this.props.className}/>;
      default:
        return <div/>
    }
  }
}