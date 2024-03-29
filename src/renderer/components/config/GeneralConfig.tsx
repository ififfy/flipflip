import * as React from "react";

import {Card, CardContent, Grid, Theme} from "@mui/material";

import Config, {CacheSettings, DisplaySettings, GeneralSettings, RemoteSettings} from "../../data/Config";
import Tag from "../../data/Tag";
import LibrarySource from "../../data/LibrarySource";
import PlayerBoolCard from "../configGroups/PlayerBoolCard";
import PlayerBoolCard2 from "../configGroups/PlayerBoolCard2";
import PlayerNumCard from "../configGroups/PlayerNumCard";
import CacheCard from "../configGroups/CacheCard";
import BackupCard from "../configGroups/BackupCard";
import APICard from "../configGroups/APICard";
import ThemeCard from "../configGroups/ThemeCard";
import WatermarkCard from "../configGroups/WatermarkCard";
import Masonry from "@mui/lab/Masonry/Masonry";

export default class GeneralConfig extends React.Component {
  readonly props: {
    config: Config,
    library: Array<LibrarySource>,
    tags: Array<Tag>,
    theme: Theme,
    onBackup(): void,
    onChangeThemeColor(colorTheme: any, primary: boolean): void,
    onClean(): void,
    onPortableOverride(): void,
    onRestore(backupFile: string): void,
    onToggleDarkMode(): void,
    onUpdateCachingSettings(fn: (settings: CacheSettings) => void): void,
    onUpdateDisplaySettings(fn: (settings: DisplaySettings) => void): void,
    onUpdateGeneralSettings(fn: (settings: GeneralSettings) => void): void,
    onUpdateRemoteSettings(fn: (settings: RemoteSettings) => void): void,
    onUpdateConfig(fn: (config: Config) => void): void,
  };

  render() {
    return(
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Masonry columns={[1,2,3,4]} spacing={2}>

            <Card>
              <CardContent>
                <PlayerBoolCard
                  displaySettings={this.props.config.displaySettings}
                  onUpdateDisplaySettings={this.props.onUpdateDisplaySettings.bind(this)}/>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <PlayerBoolCard2
                  generalSettings={this.props.config.generalSettings}
                  onPortableOverride={this.props.onPortableOverride.bind(this)}
                  onUpdateGeneralSettings={this.props.onUpdateGeneralSettings.bind(this)}/>
              </CardContent>
            </Card>

            <Card style={{overflow: 'visible'}}>
              <CardContent>
                <PlayerNumCard
                  library={this.props.library}
                  tags={this.props.tags}
                  settings={this.props.config.displaySettings}
                  onUpdateSettings={this.props.onUpdateDisplaySettings.bind(this)}/>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <CacheCard
                  config={this.props.config}
                  onUpdateSettings={this.props.onUpdateCachingSettings.bind(this)}/>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <APICard
                  settings={this.props.config.remoteSettings}
                  onUpdateSettings={this.props.onUpdateRemoteSettings.bind(this)}
                  onUpdateConfig={this.props.onUpdateConfig.bind(this)}/>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <WatermarkCard
                  settings={this.props.config.generalSettings}
                  onUpdateSettings={this.props.onUpdateGeneralSettings.bind(this)}/>
              </CardContent>
            </Card>
          </Masonry>
        </Grid>

        <Grid item xs={12} sm={"auto"}>
          <Card>
            <CardContent>
              <BackupCard
                settings={this.props.config.generalSettings}
                onBackup={this.props.onBackup.bind(this)}
                onRestore={this.props.onRestore.bind(this)}
                onClean={this.props.onClean.bind(this, this.props.config)}
                onUpdateSettings={this.props.onUpdateGeneralSettings.bind(this)}/>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={"auto"}>
          <Card>
            <CardContent>
              <ThemeCard
                theme={this.props.theme}
                onChangeThemeColor={this.props.onChangeThemeColor.bind(this)}
                onToggleDarkMode={this.props.onToggleDarkMode.bind(this)} />
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    );
  }
}

(GeneralConfig as any).displayName="GeneralConfig";