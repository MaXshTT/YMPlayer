"""Main Python application file for YMPlayer."""

import os
import pathlib
import platform
import sys

import eel
import pafy


BROWSERS = ['firefox', 'chrome', 'edge']


@eel.expose
def play_music(videoid):
    """Pass to js music's metadata and url

    :param videoid: 11 character music id of the music
    :type videoid: str
    """

    # Retry 2 more times if an error occurs
    for i in range(3):
        try:
            music = pafy.new(videoid)
            break
        except OSError as err:
            if i == 2:
                eel.alertError(str(err.args[0]))
                return
            print('Retrying...')
            eel.sleep(0.2)
    metadata = {
        'title': music.title,
        'author': music.author,
        'thumb': music.thumb,
        'videoid': music.videoid,
        'duration': music.duration
    }
    url = music.getbestaudio().url
    eel.playMusic(url, metadata)


def check_if_url_valid(url):
    """Check if given url is valid

    :param url: Url or 11 character music id of the music
    :type url: str
    :return: Playlist or music if not valid false
    :rtype: dict or pafy object or boolean
    """

    item = False
    for i in range(3):
        try:
            # Dict containing metadata and pafy objects
            item = pafy.get_playlist(url)
            break
        except ValueError:
            try:
                # Pafy object
                item = pafy.new(url)
                break
            except (ValueError, OSError) as err:
                if i == 2:
                    eel.alertError(str(err.args[0]))
                    break
                print('Retrying...')
                eel.sleep(0.2)
    return item


@eel.expose
def add_to_queue(url):
    """Check if given url is valid and if valid pass playlist or musc to queue

    :param url: Url or 11 character music id of the music
    :type url: str
    """

    item = check_if_url_valid(url)
    if not item:
        return

    try:
        # Playlist
        add_playlist_to_queue(item['items'])
    except TypeError:
        # Music
        add_music_to_queue(item)


def add_playlist_to_queue(items):
    """Pass list of metadata for each music in items(playlist) to js

    :param items: Music dictionaries
    :type items: list
    """

    # Change items to list with pafy objects
    items = [item['pafy'] for item in items]
    playlist = []
    for music in items:
        metadata = {
            'title': music.title,
            'author': music.author,
            'thumb': music.thumb,
            'videoid': music.videoid,
            'duration': music.duration
        }
        playlist.append(metadata)
    eel.addPlaylistToQueue(playlist)


def add_music_to_queue(music):
    """Pass music's metadata to js

    :param music: Music from youtube
    :type music: Pafy object
    """

    metadata = {
        'title': music.title,
        'author': music.author,
        'thumb': music.thumb,
        'videoid': music.videoid,
        'duration': music.duration
    }
    eel.addMusicToQueue(metadata)


def start_eel():
    """Start Eel with either production or development configuration."""

    os.system('cls' if os.name == 'nt' else 'clear')

    # Check for arguments/flags
    args = sys.argv
    if len(args) == 1:
        app = 'chrome'
    elif len(args) <= 3:
        if args[1] in ['--degug', '-d']:
            app = None
        elif args[1] in ['--browser', '-b']:
            if len(args) != 3:
                print("Browser name was not provided")
                print("Browsers:")
                for browser in BROWSERS:
                    print(f"- {browser}")
                return
            elif args[2] in BROWSERS:
                app = args[2]
            else:
                print(f"{args[2]}: browser is not supported")
                return
        else:
            print(f"{args[1]}: invalid option")
            return
    else:
        print(f"Expected at most 3 argument, got {len(args)}")
        return

    current_path = pathlib.Path(__file__).parent
    eel.init(current_path / 'web')

    page = 'index.html'
    eel_kwargs = {
        'size': (1000, 700),
        'port': 8080,
    }
    try:
        eel.start(page, mode=app, **eel_kwargs)
    except EnvironmentError:
        # If Chrome isn't found, fallback to Microsoft Edge on Win10 or greater
        if sys.platform in ['win32', 'win64'] and int(platform.release()) >= 10:
            eel.start(page, mode='edge', **eel_kwargs)
        else:
            raise


if __name__ == '__main__':
    start_eel()
