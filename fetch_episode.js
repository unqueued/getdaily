#!/usr/bin/env node

var youtubedl = require('youtube-dl');
var async = require('async')
var fs = require('fs')

// just do youtubedl exec and cap the output.
//

/*
Formats:
rtmp-1300
rtmp-250
rtmp-450
rtmp-800
rtmp-1700
rtmp-2200
rtmp-3500
vhttp-1300
vhttp-250
vhttp-450
vhttp-800
vhttp-1700
vhttp-2200
vhttp-3500
*/

function parseUploadDate(var dateString) {
	var upload_date = new Date()
	upload_date.setYear(dateString.slice(0, 4))
	upload_date.setMonth(dateString.slice(5, 6))
	upload_date.setDate(dateString.slice(7, 8))
	return upload_date
}

var url = ""
url = "http://thedailyshow.cc.com/full-episodes/okco56/may-13--2015---reza-aslan"

