#!/bin/sh

# Figure out how to get -metadata = to work

#http://jonhall.info/how_to/dump_and_load_metadata_with_ffmpeg

./ffmpeg-ipod -i "$1" -f ipod -vcodec libx264 -acodec libfaac -ab 128000 -b 1500000 -s 640x360 -bt 175000 -refs 1 -flags +loop+slice -deblockalpha 0 -deblockbeta 0 -partitions +parti4x4+partp8x8+partb8x8 -me_method 8 -subq 6 -me_range 21 -cmp +chroma -bf 0 -level 30 -g 300 -keyint_min 30 -sc_threshold 40 -rc_eq 'blurCplx^(1-qComp)' -qcomp 0.7 -qmax 51 -qdiff 4 -i_qfactor 0.71428572 -maxrate 2000000 -bufsize 2000000 -cmp 1 -async 1 -threads 8  $1.m4v