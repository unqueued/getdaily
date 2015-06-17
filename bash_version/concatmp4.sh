#!/bin/sh

~/bin/ffmpeg -f concat -i $1 -vcodec copy -acodec copy $2

