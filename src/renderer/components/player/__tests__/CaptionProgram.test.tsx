import React from "react";
import { describe, it, expect } from "@jest/globals";
import renderer from "react-test-renderer";
import CaptionProgram from "../CaptionProgram";
import TestProvider from "../../../../../test/util/TestProvider";
import CaptionScript from "../../../data/CaptionScript";
import { RP } from "../../../data/const";

describe("CaptionProgram", () => {
  it("should match snapshot", () => {
    const script = new CaptionScript()
    const component = renderer.create(
      <TestProvider>
        <CaptionProgram
          captionScript={script}
          currentAudio={null}
          currentImage={null}
          persist={false}
          repeat={RP.none}
          scale={1}
          singleTrack={false}
          timeToNextFrame={0}
          getTags={(source, clipID) => []}
          goBack={() => {}}
          playNextScene={() => {}}
        />
      </TestProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
