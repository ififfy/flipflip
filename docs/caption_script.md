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

Upload your script to [Pastebin](https://pastebin.com) or [Hastebin](https://hastebin.com) to share it with others, or keep it as a text file on your computer.

## Basic commands

?> You can insert a newline by adding `\n` to your script text

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

You can also show a circular progress bar around the count by using these commands:
```
# Enables progress bar (default false)
setShowCountProgress true

# Sets progress bar scale (default 500)
setCountProgressScale 1000

# Sets the color of progress bar at the designated number
setCountProgressColor 2 #f44336
setCountProgressColor 5 #ffeb3b
setCountProgressColor 10 #4caf50

# Setting this as true will offset the total, so that --in this example-- 1 is the end (0)
setCountProgressOffset true

# Setting this to true will make the count color match the progress color (this works even without the progress enabled)
setCountColorMatch true

count 10 1
```

#### `wait <MILLISECONDS>`

Wait `<MILLISECONDS>` ms.

#### `advance`

Advances the scene 1 image forward.

## Changing how things are shown

?> See [examples](#examples) for ideas.

#### Timing Functions

Each command (besides `wait`) has its own "timing functions" for Duration, Delay, and GroupDelay values. These are the 
same [timing functions](options.md#timing) as everywhere else in FlipFlip:

* `constant` - Lasts for exactly `MIN_MS`
* `random` - Lasts for random time between `MIN_MS` and `MAX_MS`
* `wave` - Gradually shifts back and forth between `MIN_MS` and `MAX_MS`
* `bpm` - Timing is based on current audio's BPM
* `scene` - Changes with current scene

You can set timing functions by using these commands (default is `constant`):
```
setBlinkTF <TF>
setBlinkDelayTF <TF>
setBlinkGroupDelayTF <TF>

setCaptionTF <TF>
setCaptionDelayTF <TF>

setCountTF <TF>
setCountDelayTF <TF>
setCountGroupDelayTF <TF>
```

#### Duration/Delay

These commands can be used to set the `MIN_MS` and `MAX_MS` for action's duration (how long text is shown) and delay (how
long to wait after showing text):

```
setBlinkDuration <MIN_MS> <MAX_MS>
setBlinkDelay <MIN_MS> <MAX_MS>
setBlinkGroupDelay <MIN_MS> <MAX_MS>

setCaptionDuration <MIN_MS> <MAX_MS>
setCaptionDelay <MIN_MS> <MAX_MS>

setCountDuration <MIN_MS> <MAX_MS>
setCountDelay <MIN_MS> <MAX_MS>
setCountGroupDelay <MIN_MS> <MAX_MS>
```

?> If only the first number is provided, only the `MIN_MS` (constant) value will be updated

#### Timing Function Modifiers

You can control the **wave rate** of `wave` timings and **bpm multiplier** of `bpm` timings using the following commands:

```
# WAVE_RATE is an integer between 0 and 100

setBlinkWaveRate <WAVE_RATE>
setBlinkDelayWaveRate <WAVE_RATE>
setBlinkGroupDelayWaveRate <WAVE_RATE>

setCaptionWaveRate <WAVE_RATE>
setCaptionDelayWaveRate <WAVE_RATE>

setCountWaveRate <WAVE_RATE>
setCountDelayWaveRate <WAVE_RATE>
setCountGroupDelayWaveRate <WAVE_RATE>
```
```
# BPM_MULTI is a decimal number between 0 and 5

setBlinkBPMMulti <BPM_MULTI>
setBlinkDelayBPMMulti <BPM_MULTI>
setBlinkGroupDelayBPMMulti <BPM_MULTI>

setCaptionBPMMulti <BPM_MULTI>
setCaptionDelayBPMMulti <BPM_MULTI>

setCountBPMMulti <BPM_MULTI>
setCountDelayBPMMulti <BPM_MULTI>
setCountGroupDelayBPMMulti <BPM_MULTI>
```

#### Position

The position of each action command can also be changed by using these commands:

```
# POS is a postive or negative integer

setBlinkX <POS>
setBlinkY <POS>

setCaptionX <POS>
setCaptionY <POS>

setBigCaptionX <POS>
setBigCaptionY <POS>

setCountX <POS>
setCountY <POS>
```

?> This value is relative to each command's default position.

#### Opacity

In addition to the global opacity slider, you can also set the opacity within a script on a per-command basis:

```
# OPACITY is a number between 0 and 100 (default is 100)

setBlinkOpacity <OPACITY>
setCaptionOpacity <OPACITY>
setCountOpacity <OPACITY>
setBlinkOpacity <OPACITY>
```

## Advance Commands

### Timestamps

Rather than use Delay values to time your script, you use timestamps to ensure your commands execute _exactly_ when you
want them to. This can be particularly useful when writing a script with a related audio file:

```
<TIMESTAMP> <COMMAND>
```

Where `TIMESTAMP` is in one of these format:
* `HH:MM:SS.mmm`
* `HH:MM:SS`
* `MM:SS.mmm`
* `MM:SS`
* `SS.mmm`
* `SS`

```
0 setBlinkDuration 300
0 setBlinkDelay 100
0 setCaptionDuration 2000

00:00 bigcap YOU LOVE FLUFFY KITTENS
00:03.2 blink KITTENS / ARE / YOUR / LIFE
00:06 cap Cuddle all the kittens forever because you love them.
00:09.2 bigcap YOU LOVE FLUFFY KITTENS
00:12.4 blink KITTENS / ARE / YOUR / LIFE
00:15.2 cap Cuddle all the kittens forever because you love them.
```

?> Timestamp scripts **do not loop**

?> **Setters need timestamps** as well to be used in the script. For this reason, we recommend you **separate 
timestamp and non-timestamp scripts**, as using both in the same file can have unexpected effects.

### Audio

You can make audio tracks play during your script by first storing them, and then calling `playAudio <ALIAS> <VOLUME>`. 
The audio track will start at the beginning and play until the end. 

```
# storeAudio <FILE> <ALIAS>
storeAudio "C:\audio\finger_snap.wav" snap

<other caption syntax>
# playAudio <ALIAS> <VOLUME: Default 100>
playAudio snap 25
```

### Random phrases

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

#### Phrase Groups

You can store and use phrases in specific groups like this:

```
# GROUP is an integer between 1 and 9

storePhrase $<GROUP> <PHRASE>
cap $<GROUP>
blink $<GROUP> / $<GROUP>


# e.g.
storePhrase $1 Banana Cream Pie
storePhrase $1 Oreo Cheesecake
storePhrase $2 Vanilla Cake
storePhrase $2 Chocolate Cake

blink $1 / IS SO MUCH BETTER THAN / $2
```

### Tag phrases

Similar to Random phrases, "Tag phrases" are associated with the tag(s) of the currently visible source.

Visit the [Tag Manager](tagging.md#manage-tags) to edit each tag's phrases. Then you can use a random one in 
place of any text like this:

```
cap $TAG_PHRASE
blink $TAG_PHRASE / $TAG_PHRASE
```

## Examples

Random timing:
```
setBlinkDelayTF random
setBlinkGroupDelayTF random

setBlinkDelay 100 1000
setBlinkGroupDelay 1000 3000

blink KITTENS / ARE / YOUR / LIFE
```

Wave timing:
```
setBlinkDelayTF wave
setBlinkWaveRate 75

setBlinkDelay 100 1000
setBlinkGroupDelay 0

blink KITTENS / ARE / YOUR / LIFE
```

BPM timing:
```
setBlinkGroupDelayTF bpm
setBlinkGroupDelayBPMMulti 2

setBlinkDuration 100
setBlinkDelay 100

blink KITTENS / ARE / YOUR / LIFE
```

Scene timing:
```
setBlinkDelayTF scene

setBlinkDuration 700
setBlinkGroupDelay 0

blink KITTENS / ARE / YOUR / LIFE
```

Position text:
```
# Blink in each corner
setCaptionDuration 500
setCaptionDelay 100

setBigCaptionX -80
setBigCaptionY 80
bigcap TOP LEFT

setBigCaptionX 80
setBigCaptionY 80
bigcap TOP RIGHT

setBigCaptionX 80
setBigCaptionY -80
bigcap BOTTOM RIGHT

setBigCaptionX -80
setBigCaptionY -80
bigcap BOTTOM LEFT
```

