# YMPlayer

## About

YMPlayer is a music player that uses Youtube as a source of content. Written in Python and JavaScript.

UI: Made using a library called [eel](https://github.com/samuelhwilliams/Eel)

Stream fetch: Audio streams from youtube are fetched using [pafy](https://github.com/mps-youtube/pafy) and [youtube-dl](https://pypi.org/project/youtube_dl)

### Features

-   Add and play YouTube playlists
-   Add and play audio/videos from YouTube
-   Save queue
-   Use several playback modes such as repeat and random
-   Change volume and playback rate
-   Works with Windows, Linux and MacOS

### Technologies

-   python3
-   javascript
-   html
-   [eel](https://github.com/samuelhwilliams/Eel)
-   [pafy](https://github.com/mps-youtube/pafy)
-   [youtube-dl](https://pypi.org/project/youtube_dl)

Eel is a little Python library for making simple Electron-like offline HTML/JS GUI apps, with full access to Python capabilities and libraries.

Pafy is a python library to download YouTube content and retrieve metadata.

Youtube_dl is a command-line program to download videos from YouTube and other video sites.

## Installation

Requires Python 3.6+

Clone repository:

```bash
git clone https://github.com/MaXshTT/YMPlayer.git
```

Set up a virtual environment and install the dependencies:

```bash
pip install ./YMPlayer
pip install -r YMPlayer/requirements.txt
```

## Usage

```bash
ymplayer
```

Flags:

`-d` or `--degug` for debugging

`-b` or `--browser` [browser] for choosing a specific browser(default: chrome)

### Keyboard Shortcuts

| Key         | Function             |
| :---------- | :------------------- |
| n           | play next song       |
| p           | play previous song   |
| backspace   | play previous song   |
| space       | play/pause song      |
| up arrow    | volume up            |
| down arrow  | volume down          |
| right arrow | forward 5 sec        |
| left arrow  | rewind 5 sec         |
| [           | faster playback rate |
| ]           | slower playback rate |
| r           | toggle repeat mode   |
| s           | toggle shuffle mode  |
| m           | toggle mute          |

## Screenshots

![Player](/readme/ymplayer.png)

## Known Issues

### MacOS

-   “SSL: CERTIFICATE_VERIFY_FAILED” Error

    Solution:

    ```bash
    pip3 install --upgrade certifi

    /Applications/Python\ 3.6/Install\ Certificates.command
    ```

    More information: https://stackoverflow.com/questions/27835619/urllib-and-ssl-certificate-verify-failed-error

### Youtube-dl

-   "url not valid"

    YouTube keeps changing its structure so it's important you have installed the latest version of youtube-dl as follows:

    ```bash
    pip install --upgrade youtube_dl
    ```
