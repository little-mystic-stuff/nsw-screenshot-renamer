### Nintendo Switch screenshot renamer
Renaming and organizing tool.

It works with files from SD-card. It doesn't work with console pluged-in to computer.

### How it works
Tool reads directory with switch screenshots and copies/moves files to directories named as game titles. If there is no actual title in the base, title will be equal to game id taken from screenshot name.
Also it can rename directories with sorted screenshots to game title (after base update).

### Preparation
Tool requires installed NodeJS.

Installation: ```npm i```.

Update game title base: ```node cmd --mode=update```

### Program's arguments
```-h``` - show program info, run it before use to watch possible arguments values

```--mode=<mode>``` - рrogram mode: move files, copy files, fix(update) game titles

```--input=<path>``` - path to directory with switch Screenshots

```--output=<path>``` - path to result directoryFormat

```--directory-format=<format>``` - format of game titles

```--file-format=<format>``` - format of filename

### Examples
Command: ```node cmd --input=/home/user/Switch/Screenshots --output=/home/user/sortedScreenshots```

Result: screenshots copied to sortedScreenshots-directory like this:
```
home/user/sortedScreenshots/
├── Super Mario Odyssey
│   ├── images
│   │   ├── 2018072422231600.jpg
│   │   ├── 2018102300303800.jpg
│   │   ├── 2018103101145800.jpg
│   │   ├── 2018103101270500.jpg
│   │   └── 2019061601000600.jpg
│   └── videos
│       ├── 2018110603150500.mp4
│       └── 2018110604120500.mp4
└── Yoshi's Crafted World [Demo]
    └── images
        ├── 2019042602224500.jpg
        └── 2019042602240100.jpg
```

Command: ```node cmd --mode=move --input=/home/user/Switch/Screenshots --output=/home/user/sortedScreenshots --directory-format=dash-case --file-format=original```

Result: screenshots moved to sortedScreenshots-directory like this:
```
home/user/sortedScreenshots/
├── super-mario-odyssey
│   ├── images
│   │   ├── 2018072422231600-8AEDFF741E2D23FBED39474178692DAF.jpg
│   │   ├── 2018102300303800-8AEDFF741E2D23FBED39474178692DAF.jpg
│   │   ├── 2018103101145800-8AEDFF741E2D23FBED39474178692DAF.jpg
│   │   ├── 2019061601000500-8AEDFF741E2D23FBED39474178692DAF.jpg
│   │   └── 2019061601000600-8AEDFF741E2D23FBED39474178692DAF.jpg
│   └── videos
│       ├── 2018110603150500-8AEDFF741E2D23FBED39474178692DAF.mp4
│       └── 2018110604120500-8AEDFF741E2D23FBED39474178692DAF.mp4
└── yoshi's-crafted-world-[demo]
    └── images
        ├── 2019042602224500-7AEA3B76283DF2B97E581259A12F733D.jpg
        └── 2019042602240100-7AEA3B76283DF2B97E581259A12F733D.jpg
```

Command: ```node cmd --mode=fix-names --input=/home/user/sortedScreenshots```

Before (there is no title for game id 7AEA3B76283DF2B97E581259A12F733D):
```
home/user/sortedScreenshots/
├── Super Mario Odyssey
│   ├── images
│   │   ├── 2018072422231600.jpg
│   │   ├── 2018102300303800.jpg
│   │   ├── 2018103101145800.jpg
│   │   ├── 2018103101270500.jpg
│   │   └── 2019061601000600.jpg
│   └── videos
│       ├── 2018110603150500.mp4
│       └── 2018110604120500.mp4
└── 7AEA3B76283DF2B97E581259A12F733D
    └── images
        ├── 2019042602224500.jpg
        └── 2019042602240100.jpg
```
After (there is a title for game id 7AEA3B76283DF2B97E581259A12F733D after base update):
```
home/user/sortedScreenshots/
├── Super Mario Odyssey
│   ├── images
│   │   ├── 2018072422231600.jpg
│   │   ├── 2018102300303800.jpg
│   │   ├── 2018103101145800.jpg
│   │   ├── 2018103101270500.jpg
│   │   └── 2019061601000600.jpg
│   └── videos
│       ├── 2018110603150500.mp4
│       └── 2018110604120500.mp4
└── Yoshi's Crafted World [Demo]
    └── images
        ├── 2019042602224500.jpg
        └── 2019042602240100.jpg
```

### Roadmap
- ~~Windows compability (it's tested on Linux only yet)~~ Done
- ~~progress visualization~~ Done
- ~~base updating mechanism~~ Done
- GUI
- working with console pluged-in to PC (maybe... I don't know...)
