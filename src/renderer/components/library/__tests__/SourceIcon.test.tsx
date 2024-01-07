import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import SourceIcon from "../SourceIcon";
import TestProvider from "../../../../../test/util/TestProvider";
import { ST } from "../../../data/const";

describe("SourceIcon", () => {
  it("should render empty div when no type or url is specified", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render audio track icon when type is audio", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.audio} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render audio track icon when url is file://audio.mp3", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="file://audio.mp3" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render folder icon when type is local", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.local} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render folder icon when url is file://home/user/pictures", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="file://home/user/pictures" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render movie icon when type is video", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.video} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render movie icon when url is file://video.mp4", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="file://video.mp4" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render subscriptions icon when type is playlist", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.playlist} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render subscriptions icon when url is https://example.com/live/playlist.m3u8", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://example.com/live/playlist.m3u8" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render list icon when type is list", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.list} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render list icon when url is file://image-list.txt", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="file://image-list.txt" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Reddit icon when type is reddit", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.reddit} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Reddit icon when url is https://www.reddit.com/r/flipflip/", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://www.reddit.com/r/flipflip/" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render RedGIFs icon when type is redgifs", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.redgifs} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render RedGIFs icon when url is https://www.redgifs.com/", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://www.redgifs.com/" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Twitter icon when type is twitter", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.twitter} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Twitter icon when url is https://twitter.com/notifications", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://twitter.com/notifications" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Instagram icon when type is instagram", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.instagram} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Instagram icon when url is https://www.instagram.com/me/saved", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://www.instagram.com/me/saved" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render tumblr icon when type is tumblr", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.tumblr} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render tumblr icon when url is https://www.tumblr.com/explore/today", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://www.tumblr.com/explore/today" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render ImageFap icon when type is imagefap", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.imagefap} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render ImageFap icon when url is https://www.imagefap.com/pics/70/ai-generated.php", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://www.imagefap.com/pics/70/ai-generated.php" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render sex.com icon when type is sexcom", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.sexcom} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render sex.com icon when url is https://www.sex.com/gifs/?sort=latest", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://www.sex.com/gifs/?sort=latest" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Imgur icon when type is imgur", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.imgur} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Imgur icon when url is https://imgur.com/a/mMslVXT", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://imgur.com/a/mMslVXT" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render DeviantArt icon when type is deviantart", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.deviantart} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render DeviantArt icon when url is https://www.deviantart.com/?topic=ai", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://www.deviantart.com/?topic=ai" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Danbooru icon when type is danbooru", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.danbooru} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Danbooru icon when url is https://danbooru.donmai.us/posts", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://danbooru.donmai.us/posts" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Danbooru icon when type is e621", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.e621} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Danbooru icon when url is https://e621.net/posts", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://e621.net/posts" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Luscious icon when type is luscious", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.luscious} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Luscious icon when url is https://www.luscious.net/albums/list/?album_type=manga&display=date_trending&page=1", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://www.luscious.net/albums/list/?album_type=manga&display=date_trending&page=1" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Gelbooru icon when type is gelbooru1", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.gelbooru1} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Gelbooru icon when url is https://rm.booru.org/index.php?page=post&s=list", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://rm.booru.org/index.php?page=post&s=list" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Gelbooru icon when type is gelbooru2", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.gelbooru2} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Gelbooru icon when url is https://gelbooru.com/index.php?page=post&s=view&id=9230193", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://gelbooru.com/index.php?page=post&s=view&id=9230193" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render E-Hentai icon when type is ehentai", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.ehentai} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render E-Hentai icon when url is https://www.e-hentai.org/g/2735124/b663d74779", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://www.e-hentai.org/g/2735124/b663d74779" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render bdsmlr icon when type is bdsmlr", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.bdsmlr} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render bdsmlr icon when url is https://about.bdsmlr.com", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://about.bdsmlr.com"/>
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Hydrus Network icon when type is hydrus", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.hydrus} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Hydrus Network icon when url is https://localhost:8080/get_files/search_files", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://localhost:8080/get_files/search_files" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Piwigo icon when type is piwigo", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.piwigo} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Piwigo icon when url is https://piwigo.localhost:8080/ws.php", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://piwigo.localhost:8080/ws.php" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Nimja icon when type is nimja", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.nimja} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render Nimja icon when url is https://hypno.nimja.com/visual/135", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="https://hypno.nimja.com/visual/135" />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should prioritize url over type prop", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon url="file://audio.mp3" type={ST.reddit} />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render icon with className prop", () => {
    const className = "customClass"
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.local} className={className} />
      </TestProvider>
    );

    expect(component.root.findByType('svg').props.className).toContain(className)
  });
  it("should render Reddit icon with red color, because source is unsupported", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.reddit} />
      </TestProvider>
    );

    expect(component.root.findByType('svg').props.style.color).toEqual('red')
  });
  it("should render Twitter icon with red color, because source is unsupported", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.twitter} />
      </TestProvider>
    );

    expect(component.root.findByType('svg').props.style.color).toEqual('red')
  });
  it("should render Sex.com icon with red color, because source is unsupported", () => {
    const component = renderer.create(
      <TestProvider>
        <SourceIcon type={ST.sexcom} />
      </TestProvider>
    );

    expect(component.root.findByType('svg').props.style.color).toEqual('red')
  });
});
