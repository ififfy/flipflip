# Sources
The most important part of any Scene is its **Sources**. This is simply a list of all the places FlipFlip will 
find images to show. FlipFlip supports sources from (1) Local Directories, (2) A text document with a list of 
image URLs, (3) a single video file URL, or (4) one of the 
[currently supported remote sources](#currently-supported-remote-sources).

* Sources can be ordered Alphabetically (either their full URL or their parsed name), by Date Added, or by Type.
* Sources can also be manually ordered by drag'n'dropping them.

## Modifying sources
#### Adding new source
Click `+ Add Sources` and choose one of the following options:
* Click `+ URL` to input the URL of a remote source or video file.
* Click `+ Local directory` to lookup local directories.
* Click `+ Local video` to look up local video files.
* Click `+ From Library` to import sources from the Library.
  * For more information about this process see the [Import from Library](import_from_library.md) section.

#### Editing existing source
* To edit a source, click the <img style="vertical-align: -5px" src="doc_icons/pencil.svg" alt="Edit" width="20" height="20"> 
and then make your desired changes. 
  * _Note: Blank and duplicate sources will be automatically removed_
* To clear the cache for a source, click the <img style="vertical-align: -5px" src="doc_icons/clean.svg" 
alt="Clear cache" width="20" height="20">
* To delete a source, click the <img style="vertical-align: -5px" src="doc_icons/delete.svg" alt="Remove" width="20" height="20">
* To clear _all_ sources in a scene, click `- Remove All` and confirm.

## Source types

#### Local Directory
The simplest way to use FlipFlip is to click `+ Local directory` and pick a directory on your computer that contains 
images. FlipFlip will search the entire directory, including subfolders.

#### Image List
If you want to load specific images from the web, you can create a text file containing one URL per line, like this:
```
https://cdn-images-1.medium.com/max/2000/0*vnYtP9N80SQ0pOOD.png
https://cdn-images-1.medium.com/max/2000/0*P1UL5C8Lkyq7wd5P.png
https://cdn-images-1.medium.com/max/2000/0*vnYtP9N80SQ0pOOD.png
```
Then you can either save that file to your computer, or uploaded it to a text file hosting service like 
[Hastebin](https://hastebin.com) if you want to share it with others.

Once you've created this file, click `+ URL`. Simply type or paste the path to your text file (remote or local).

#### Video File
You can add individual video files as sources too. These can be either local files or remote files. To add a 
local video file, click `+ Local video` and choose the video(s) you want to add.

?> **NOTE:** _Each video will be weighted as its own source._

#### Currently Supported Remote Sources

* <img style="vertical-align: -2px" src="doc_icons/tumblr.svg" alt="Tumblr" width="15" height="15"> Tumblr Blog
* <img style="vertical-align: -2px" src="doc_icons/reddit.svg" alt="Reddit" width="15" height="15"> Reddit Subreddits/Users
* <img style="vertical-align: -2px" src="doc_icons/twitter.svg" alt="Twitter" width="15" height="15"> Twitter Profile
* <img style="vertical-align: -2px" src="doc_icons/instagram.svg" alt="Instagram" width="15" height="15"> Instagram Profile
* <img style="vertical-align: -2px" src="doc_icons/imgur.svg" alt="Imgur" width="15" height="15"> Imgur Album
* <img style="vertical-align: -2px" src="doc_icons/deviantart.svg" alt="DeviantArt" width="15" height="15"> DeviantArt User
* <img style="vertical-align: -2px" src="doc_icons/sexcom.svg" alt="Sex.com" width="15" height="15"> Sex.com Gallery/User
* <img style="vertical-align: -2px; margin-right: 5px" src="doc_icons/imagefap.png" alt="ImageFap" width="15" height="15">ImageFap Gallery/Organizer
* <img style="vertical-align: -2px; margin-right: 5px" src="doc_icons/danbooru.png" alt="Danbooru" width="15" height="15">Danbooru Tag/User/Pool
* <img style="vertical-align: -2px; margin-right: 5px" src="doc_icons/gelbooru.png" alt="Gelbooru" width="15" height="15">Gelbooru Tag
* <img style="vertical-align: -2px; margin-right: 5px" src="doc_icons/ehentai.png" alt="E-Hentai" width="15" height="15">E-Hentai Gallery

#### Gooninator import
If you have some saved links from the beloved, retired web app Gooninator, you can import them into FlipFlip either as 
Tumblr blogs (as they were before) or as local directories (to use your backups).

To access this tool, click in the "Sources" area and then press **Alt+P**. You should then see a popup appear. Paste 
the Gooninator URL, and select whether you'd like to import these sources as Tumblr blogs or Local directories. If you 
choose to import as local directories, you must also configure the directory where you kept your blog backups.

![](doc_images/gooninator_import_modal.png)