# Caption Script Format

Many dedicated FlipFlip users like to flash big words on top of their slideshows. This feature is driven by 
_caption scripts_ that say what to display, when, and how it looks.

**All times are in milliseconds unless otherwise specified.**

Here's a small example showing the basics:

```
setBlinkDuration 300
setBlinkDelay 100
setBlinkGroupDelay 1200
setCaptionDuration 2000
setCaptionDelay 1200

bigcap YOU LOVE FLUFFY KITTENS
blink KITTENS / ARE / YOUR / LIFE
cap Cuddle all the kittens forever because you love them.
```

Upload your script to [Hastebin](https://hastebin.com) to share it with others, or keep it as a text file on your computer.

## Basic commands

#### `cap <TEXT>`

Show medium-sized text for `captionDuration` ms, then wait `captionDelay` ms.

#### `bigcap <TEXT>`

Show big text for `captionDuration` ms, then wait `captionDelay` ms.

#### `blink <TEXT> / <TEXT> / <TEXT>`

For each bit of text between the slashes, show that text for `blinkDuration` ms, then wait `blinkDelay` ms. 
When they are all done, wait `blinkGroupDelay` ms.

#### `count <START> <END>`

Count from START to END (START and END are whole numbers). Display each number for `countDuration` ms, then wait 
`countDelay` ms. When they are all done, wait `countGroupDelay` ms.

#### `wait <MILLISECONDS>`

Wait `<MILLISECONDS>` ms.

## Changing how long things are shown for

You can change all of the time values for how long each thing is shown, and how long the program waits afterward with these commands:

```
setBlinkDuration <MILLISECONDS>
setBlinkDelay <MILLISECONDS>
setBlinkGroupDelay <MILLISECONDS>
setCaptionDuration <MILLISECONDS>
setCaptionDelay <MILLISECONDS>
setCountDuration <MILLISECONDS>
setCountDelay <MILLISECONDS>
setCountGroupDelay <MILLISECONDS>
```

## Random phrases

If you store some phrases like this:

```
storePhrase kittens are fluffy
storePhrase doggos are floofy
```

then you can use a random one in place of any text like this:

```
cap $RANDOM_PHRASE
blink $RANDOM_PHRASE / $RANDOM_PHRASE
```

[//]: # (This section has been disabled from CaptionProgram and is commented out)
[//]: # (## Styling text)

[//]: # (Big bold white text with a black border is easy to read, but you can make it look nicer by using _styles_. Styles are simply CSS strings that you can switch between.)

[//]: # (```)
[//]: # (saveStyleRules ITALIC_RED_STYLE color: red; font-style: italic;)
[//]: # (saveStyleRules UPSIDE_DOWN_STYLE transform: rotate180deg;)

[//]: # (applySavedStyle ITALIC_RED_STYLE)
[//]: # (cap This text is red)
[//]: # (applySavedStyle UPSIDE_DOWN_STYLE)
[//]: # (cap this text is upside down)
[//]: # (```)