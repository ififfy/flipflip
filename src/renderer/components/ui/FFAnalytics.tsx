import * as React from 'react';
import Analytics from "electron-google-analytics";

import Config from "../../data/Config";

export default class FFAnalytics extends React.Component {
  readonly props: {
    config: Config,
    page: string,
    version: string,
    onUpdateConfig(config: Config): void,
  };

  componentDidMount() {
    const analytics = new Analytics('UA-143309627-1');
    analytics.screen('flipflip', this.props.version, 'com.ififfy.flipflip', 'com.ififfy.flipflip', this.props.page, this.props.config.clientID)
      .then((response: any) => {
        if (this.props.config.clientID == "") {
          this.onSetClientID(response.clientID);
        }
        return {}
      }).catch((err: any) => {
        console.error(err);
      });
  }

  onSetClientID(clientID: string) {
    const newConfig = this.props.config;
    newConfig.clientID = clientID;
    this.props.onUpdateConfig(newConfig);
  }

  shouldComponentUpdate(): boolean {return false;}

  render() {return (<React.Fragment/>);}
}

