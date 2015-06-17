#!/usr/bin/env node

var youtubedl = require('youtube-dl');
var async = require('async')
var fs = require('fs')

var url = "http://thedailyshow.cc.com/full-episodes/8mfir8/june-16--2015---aziz-ansari"

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

// TEst to see if a video format exists for all four streams

var format = "vhttp-200"

console.log("Execing")

var video = youtubedl(url, null, function(err, info) {
	if (err) throw err;
	//console.log(info)
	console.log("inside init callback")

	async.eachSeries(
		info,
		function(item, callback) {
			var url
			console.log()
			console.log("---")

			//console.log("Playlist item: " + item.playlist_index)

			//console.log(item.playlist_index)
			//console.log(item)
			//console.log("Video to download:")
			//console.log(JSON.stringify(item))

			//console.log("Attempting to find urls of " + format + " format:")


			item.formats.every(function(element, index, array) {
				//console.log()
				//console.log("Element:")
				//console.log()
				//console.log(element)
				//console.log()
				//console.log("Format: " + element.format)
				//console.log("Format_id: " + element.format_id)
				//console.log(element.url)
				
				//console.log(element)
				
				/*
				element.format_id.every(function(element, index, array) {
					console.log("Format:")
					console.log(element)
				})
				*/
				

				if(element.format_id == format) {
				//	console.log()
				//	console.log(element.url)
					console.log("URL for " + format + ": " + element.url)
					return false
				}
				return true
			})
			callback()
		},
		function(err) {
			//console.log("Finished extracting urls")
		}
	)
})

console.log("finished execing")
