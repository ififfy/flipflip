# Audio/Text
The **AUDIO/TEXT** tab controls audio and text overlays.

![](doc_images/scene_detail_audio_text.png)

## Audio
This card allows you to layer multiple audio tracks over your Scene. It also contains the audio controls for these tracks.
* **Tick** - The audio file will play/restart at a certain interval.
  * Control tick timing options.
* **Stop at End** - The Scene will stop when the audio track ends.
* **Speed** - Control the playback speed of this track.

FlipFlip will check for BPM metadata of the **first audio** file, which can then be used for timing the scene or effects. 

?> The BPM is taken from the ID3 metadata of the audio file. If your file(s) is missing this metadata, you can use a program 
like [Abyssmedia BPM Counter](https://www.abyssmedia.com/bpmcounter/) to detect it for you and populate the metadata in 
the file(s).

?> There is no limit to the number of audios you can use, but you may experience poor performance if you use too many.

## Text
This card allows you to play a caption script over your Scene. Choose a text file that follows 
the [caption script format](caption_script.md). This can be a local file or a remote URL.

* **Stop at End** - The Scene will stop when the caption script ends.

?> By default, the font options are hidden. Click the **eye icon** to show/hide font options.
  
<img src="doc_images/caption_ex.gif" alt="Caption Example">