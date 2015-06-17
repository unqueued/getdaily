#!/bin/sh

# write filenames to file
echo "Fetching filenames…"

#youtube-dl --get-filename --skip-download -o '%(title)s-%(autonumber)s.%(ext)s' "$1" >> inputs.txt
youtube-dl --get-filename --skip-download -o "file '%(title)s-%(autonumber)s.%(ext)s'" "$1" > inputs-$$.txt

# clean up filenames
# still needs to be implemented
# So for now, do this manually

# download files
echo "Downloading…"
youtube-dl -o '%(title)s-%(autonumber)s.%(ext)s' "$1"


#youtube-dl --get-filename --skip-download -o '%(title)s' "$1"

