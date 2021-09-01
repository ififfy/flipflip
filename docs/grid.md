# Scene Grid

A Scene Grid allows you to play your Scenes simultaneously in a grid format. To make one, click the `+` from the
Scene Picker (Home) and select `Scene Grid`.

<img src="doc_images/grid.png" alt="Grid" class="col-xs-10 col-xl-7">

This is the main Grid Setup. In the top right, you can alter the height and width dimensions of the grid.

To edit a cell, simply click it, and select the Scene you want to be there. Alternatively you can leave a cell **EMPTY**

Start your scene as normal and your grid should work:

<img src="doc_images/grid_ex.gif" alt="Grid Example" class="col-xs-12" style="max-height: 385px">

### Clone/Mirror Cells

You can also choose to clone/mirror grid cells so that playback is synced across them.

To clone a cell, first add a scene, then drag-n-drop it onto the other cell(s) you want it to be cloned to. You can
also choose to "mirror" that cell's playback (flip horizontally). Cloned cells will be color coded, so they can more
easily be identified.

<img src="doc_images/grid_clone.png" alt="Grid Clone" class="col-xs-12 col-xl-10">

?> Note: Playing a grid with many scenes may negatively affect the framerate of cloned videos. In order to
compensate, you can enable "Clone Grid Videos Directly" in [Settings](config.md). When enabled, cloned grid cells will
use a copy of the actual video file, instead of drawing each frame on a canvas. This may improve video framerate, but
will remove absolute synchronization.

<img src="doc_images/grid_ex2.gif" alt="Grid Clone Example" class="col-xs-12" style="max-height: 385px">