import * as React from 'react';
import {animated, useSpring} from "react-spring";

import {HTF, TF, VTF} from "../../data/const";
import {getEaseFunction} from "../../data/utils";
import Scene from "../../data/Scene";
import Audio from "../../data/Audio";

export default class ZoomMove extends React.Component {
  readonly props: {
    scene: Scene,
    reset: boolean
    timeToNextFrame: number,
    currentAudio: Audio,
    zoom?: string,
    children?: React.ReactNode,
  };

  render() {
    return (
      <this.ZoomMoveLayer>
        {this.props.children}
      </this.ZoomMoveLayer>
    );
  }

  ZoomMoveLayer = (data: {children: React.ReactNode}) => {
    let horizTransType = this.props.scene.horizTransType;
    let forceHorizTransLevel = null;
    let vertTransType = this.props.scene.vertTransType;
    let forceVertTransLevel = null;
    if (!!this.props.zoom) {
      let zoomStringSplit = this.props.zoom.split(",");
      let horiz = parseInt(zoomStringSplit[0]);
      let vert = parseInt(zoomStringSplit[1]);

      horizTransType = horiz > 0 ? HTF.left : HTF.right;
      forceHorizTransLevel = Math.abs(horiz);
      vertTransType = vert > 0 ? VTF.up : VTF.down;
      forceVertTransLevel = Math.abs(vert);
    }



    let horizTransLevel = 0;
    if (horizTransType != HTF.none) {
      horizTransLevel = this.props.scene.horizTransLevel;
      if (this.props.scene.horizTransRandom) {
        horizTransLevel = Math.floor(Math.random() * (this.props.scene.horizTransLevelMax - this.props.scene.horizTransLevelMin + 1)) + this.props.scene.horizTransLevelMin;
      }
      if (!!forceHorizTransLevel) {
        horizTransLevel = forceHorizTransLevel;
      }
      if (horizTransType == HTF.left) {
        horizTransLevel = -horizTransLevel;
      } else if (horizTransType == HTF.right) {
        // Already set
      } else if (horizTransType == HTF.random) {
        const type = Math.floor(Math.random() * 2);
        if (type) {
          horizTransLevel = -horizTransLevel;
        } else {
          // Already set
        }
      }
    }

    let vertTransLevel = 0;
    if (vertTransType != VTF.none) {
      vertTransLevel = this.props.scene.vertTransLevel;
      if (this.props.scene.vertTransRandom) {
        vertTransLevel = Math.floor(Math.random() * (this.props.scene.vertTransLevelMax - this.props.scene.vertTransLevelMin + 1)) + this.props.scene.vertTransLevelMin;
      }
      if (!!forceVertTransLevel) {
        vertTransLevel = forceVertTransLevel;
      }
      if (vertTransType == VTF.up) {
        vertTransLevel = -vertTransLevel;
      } else if (vertTransType == VTF.down) {
        // Already set
      } else if (vertTransType == VTF.random) {
        const type = Math.floor(Math.random() * 2);
        if (type) {
          vertTransLevel = -vertTransLevel;
        } else {
          // Already set
        }
      }
    }

    let zoomStart = 1;
    let zoomEnd = 1;
    if (this.props.scene.zoom) {
      if (this.props.scene.zoomRandom) {
        zoomStart = (Math.floor(Math.random() * (this.props.scene.zoomStartMax*10 - this.props.scene.zoomStartMin*10 + 1)) + this.props.scene.zoomStartMin*10) / 10;
        zoomEnd = (Math.floor(Math.random() * (this.props.scene.zoomEndMax*10 - this.props.scene.zoomEndMin*10 + 1)) + this.props.scene.zoomEndMin*10) / 10;
      } else {
        zoomStart = this.props.scene.zoomStart;
        zoomEnd = this.props.scene.zoomEnd;
      }
    }

    let transDuration = 0;
    switch (this.props.scene.transTF) {
      case TF.scene:
        transDuration = this.props.timeToNextFrame;
        break;
      case TF.constant:
        transDuration = this.props.scene.transDuration;
        break;
      case TF.random:
        transDuration = Math.floor(Math.random() * (this.props.scene.transDurationMax - this.props.scene.transDurationMin + 1)) + this.props.scene.transDurationMin;
        break;
      case TF.sin:
        const sinRate = (Math.abs(this.props.scene.transSinRate - 100) + 2) * 1000;
        transDuration = Math.floor(Math.abs(Math.sin(Date.now() / sinRate)) * (this.props.scene.transDurationMax - this.props.scene.transDurationMin + 1)) + this.props.scene.transDurationMin;
        break;
      case TF.bpm:
        const bpmMulti = this.props.scene.transBPMMulti / 10;
        const bpm = this.props.currentAudio ? this.props.currentAudio.bpm : 60;
        transDuration = 60000 / (bpm * bpmMulti);
        // If we cannot parse this, default to 1s
        if (!transDuration) {
          transDuration = 1000;
        }
        break;
    }

    const imageProps = useSpring(
      {
        reset: this.props.reset,
        from: {
          transform: 'translate(0%, 0%) scale(' + zoomStart + ')',
        },
        to: {
          transform: 'translate(' + horizTransLevel + '%, ' + vertTransLevel + '%) scale(' + zoomEnd + ')',
        },
        config: {
          duration: transDuration,
          easing : getEaseFunction(this.props.scene.transEase, this.props.scene.transExp, this.props.scene.transAmp, this.props.scene.transPer, this.props.scene.transOv)
        },
      }
    );

    return (
      <animated.div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 2,
          ...imageProps
        }}>
        {data.children}
      </animated.div>
    );
  };
}

(ZoomMove as any).displayName="ZoomMove";