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

function parseUploadDate(dateString) {
	var upload_date = new Date()
	upload_date.setYear(dateString.slice(0, 4))
	upload_date.setMonth(dateString.slice(5, 6))
	upload_date.setDate(dateString.slice(7, 8))
	return upload_date
}

var url = ""
url = "http://thedailyshow.cc.com/full-episodes/okco56/may-13--2015---reza-aslan"

var options;
youtubedl.getInfo(url, options, function(err, info) {
	if (err) throw err;

	var title = info[0].playlist_title
	var description = info[0].description

	// Dates appear like this: 20150507
	// From: http://stackoverflow.com/questions/4170117/how-to-parse-the-year-from-this-date-string-in-javascript
	// .slice(0,4)
	var upload_date = new Date()
	upload_date.setYear(info[0].upload_date.slice(0, 4))
	upload_date.setMonth(info[0].upload_date.slice(5, 6))
	upload_date.setDate(info[0].upload_date.slice(7, 8))
	
	var urls = []
	var format = ""

	//if(process.argv[3] == null)

	//console.log(info)
	// async.eachSeries
	console.log(JSON.stringify(info))
	async.eachSeries(
		info,
		function(item, callback) {
			var url
			//console.log("Video to download:")
			//console.log(JSON.stringify(item))

			item.formats.every(function(element, index, array) {
				//console.log("Element:")
				if(element.format_id == "vhttp-3500") {
					console.log(element)
					console.log(element.url)
					return false
				}
				return true
			})
			console.log("---")
			callback()
		},
		function(err) {
			//console.log("Finished extracting urls")
		}
	)

	console.log("Episode info:")
	console.log("Title: " + title)
	console.log("Description: " + description)
	console.log("Date: " + String('0' + upload_date.getDate()).slice(-2))
	console.log("Month: " + String('0' + upload_date.getMonth()).slice(-2))
	console.log("Year:" + upload_date.getFullYear())
	//console.log(info)
});