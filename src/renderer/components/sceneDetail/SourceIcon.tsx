import * as React from 'react';

import {getSourceType} from "../../data/utils";
import {ST} from "../../data/const";

export default class SourceIcon extends React.Component {
  readonly props: {
    url: string
  };

  render() {
    const type = getSourceType(this.props.url);
    return(
      <div className="SourceIcon u-small-icon-button">
        {type == ST.video && (
          <div className="u-video"/>
        )}
        {type == ST.list && (
          <div className="u-list"/>
        )}
        {type == ST.tumblr && (
          <div className="u-tumblr"/>
        )}
        {type == ST.reddit && (
          <div className="u-reddit"/>
        )}
        {type == ST.imagefap && (
          <div className="u-imagefap"/>
        )}
        {type == ST.sexcom && (
          <div className="u-sexcom"/>
        )}
        {type == ST.imgur && (
          <div className="u-imgur"/>
        )}
        {type == ST.twitter && (
          <div className="u-twitter"/>
        )}
        {type == ST.deviantart && (
          <div className="u-deviantart"/>
        )}
        {type == ST.instagram && (
          <div className="u-instagram"/>
        )}
        {(type == ST.danbooru) && (
          <div className="u-danbooru"/>
        )}
        {(type == ST.gelbooru) && (
          <div className="u-gelbooru"/>
        )}
        {(type == ST.ehentai) && (
          <div className="u-ehentai"/>
        )}
      </div>
    )
  }
}