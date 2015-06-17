#!/usr/bin/env node

var youtubedl = require('youtube-dl');
var async = require('async')
var fs = require('fs')

var url = "http://thedailyshow.cc.com/full-episodes/8mfir8/june-16--2015---aziz-ansari"

// Download queue
var queue = []

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

console.log("About to get")

//getFormats(format)

downloadAllActs()

function downloadAllActs() {
	var video = youtubedl(url, null, function(err, info) {
		if (err) throw err;
		async.eachSeries(
			info,
			function(item, callback) {
				var url
				var filename = item.upload_date + "_" + item.playlist_index + "." + item.ext

				console.log("---")
				console.log()

				console.log("Downloading playlist index: " + item.playlist_index)
				console.log("To filename: " + filename)

				item.formats.every(function(element, index, array) {
					if(element.format_id == format) {
						url = element.url
						console.log("URL for " + format + ": " + element.url)
						return false
					}
					return true
				})

				console.log()
				console.log("" + filename + " exists: " + fs.existsSync(filename))
				console.log()

				if(fs.existsSync(filename)) {
					console.log("File already exists, skipping")
					callback()
				} else {
					var videoDownload = youtubedl(url, null, null)

					var size = 0;
					videoDownload.on('info', function(info) {
						size = info.size
						console.log('Download started')
						//console.log('filename: ' + info._filename)
						console.log('filename: ' + filename)
						console.log('size: ' + info.size)

						var output = filename
						console.log("Downloading to " + filename)
						videoDownload.pipe(fs.createWriteStream(output))
					})

					var pos = 0;
					videoDownload.on('data', function(data) {
						pos += data.length
						// `size` should not be 0 here.
						if (size) {
							var percent = (pos / size * 100).toFixed(2)
							process.stdout.cursorTo(0)
							process.stdout.clearLine(1)
							process.stdout.write(percent + '%')
						}
					})

					videoDownload.on('end', function(data) {
						console.log()
						console.log("Download completed, doing callback()")
						callback()
					})
				}

			},
			function(err) {
				console.log()
				console.log("Finished extracting urls")

				concatVideo(info)
			}
		)
	})
}

function concatVideo(info) {
	var ffmpeg = require('fluent-ffmpeg')
	var command = ffmpeg()


	async.eachSeries(
		info,
		function(item, callback) {
			var filename = item.upload_date + "_" + item.playlist_index + "." + item.ext
			
			console.log()
			console.log("Adding filename: " + filename)
			console.log()

			ffmpeg().input(filename)

			callback()
		},
		function(err) {
			console.log("Finished adding files")
			
			ffmpeg().on('error', function(err) {
				console.log('An error occurred: ' + err.message)
			})

			ffmpeg().on('end', function() {
				console.log("Merging finished")
			})

			console.log("About to merge files")

			ffmpeg().mergeToFile(info[0].upload_date, "/tmp")
		}
	)

	/*
ffmpeg('/path/to/part1.avi')
  .input('/path/to/part2.avi')
  .input('/path/to/part2.avi')
  .on('error', function(err) {
    console.log('An error occurred: ' + err.message);
  })
  .on('end', function() {
    console.log('Merging finished !');
  })
  .mergeToFile('/path/to/merged.avi', '/path/to/tempDir');
  */

}

function getFormats(format) {
	var video = youtubedl(url, null, function(err, info) {
		if (err) throw err;

		//console.log("---")
		//console.log(info[0].upload_date)
		//console.log("---")
		//console.log("For episode date:" + info[0] )

		async.eachSeries(
			info,
			function(item, callback) {
				var url

				//queue[item.playlist_index] = []

				console.log()
				console.log("---")
				console.log("Playlist item: " + item.playlist_index)

				item.formats.every(function(element, index, array) {
					if(element.format_id == format) {
						console.log("URL for " + format + ": " + element.url)
						return false
					}
					return true
				})
				callback()
			},
			function(err) {
				console.log("Finished extracting urls")
			}
		)
	})
}
