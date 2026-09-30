JAMIX PRO UG — AUTO MUSIC WEBSITE
==================================

The website now automatically scans the music/ folder for .mp3 files.
You no longer need to edit index.html when adding a new song.

TERMUX SETUP
------------
1. Put the whole jamixpro folder in: Internal Storage/jamixpro
2. In Termux:

   termux-setup-storage
   cd ~/storage/shared/jamixpro
   python server.py

3. Open:
   http://127.0.0.1:8080

ADDING MUSIC
------------
Copy any .mp3 file into:
   Internal Storage/jamixpro/music/

Then refresh the website. The new MP3 will appear automatically in the
JAMIX AUDIO HUB. No HTML editing is required.

For new files, the title is generated from the filename and the artist is
shown as JAMIX PRO UG unless metadata is added to server.py's KNOWN map.

IMPORTANT
---------
The site can stream/download any MP3 you place in the folder. Before making
copyrighted music publicly downloadable, make sure you have the necessary
rights or permission.
