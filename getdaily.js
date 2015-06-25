#!/usr/bin/env node

var youtubedl = require('youtube-dl');
var async = require('async')
var fs = require('fs')
var sys = require('sys')
var exec = require('child_process').exec;

//var format = "vhttp-200"
var format = "vhttp-3500"

var url

// Download queue
var queue = []

if(process.argv.length < 3) {
	console.log("Usage: ")
	console.log("getdaily.js <url>")
	process.exit()
}

url = process.argv[2]



function addSlashes(string) {
    return string.replace(/\\/g, '\\\\').
        replace(/\u0008/g, '\\b').
        replace(/\t/g, '\\t').
        replace(/\n/g, '\\n').
        replace(/\f/g, '\\f').
        replace(/\r/g, '\\r').
        replace(/'/g, '\\\'').
        replace(/"/g, '\\"');
}

function parseUploadDate(dateString) {
	var upload_date = new Date()
	upload_date.setYear(dateString.slice(0, 4))
	upload_date.setMonth(dateString.slice(5, 6))
	upload_date.setDate(dateString.slice(7, 8))
	return upload_date
}

function makeNatoString(dateString) {

	var slicedString =
		dateString.slice(0, 4) + "-" +
		dateString.slice(4, 6) + "-" +
		dateString.slice(6, 8)

	return slicedString
}

function getGuestName(info) {
  	var guestName = info[0].playlist_title.split(" - ")[1]
  	if(guestName == null) {
  		console.err("unable to parse guest name!")
  		process.exit(1)
  	}
  	guestName = guestName.replace(new RegExp(' ', 'g'), '-')
  	guestName = guestName.toLowerCase()

  	return guestName
}

function getUploadDate(info) {
	var uploadDate = info[0].upload_date

	return uploadDate
}

function getTargetFilename(info) {
	var targetFilename = makeNatoString(getUploadDate(info)) + "_thedailyshow_" + getGuestName(info) + "." + info[0].ext

	return targetFilename
}

function deleteActs(info) {
	for(var i = 1; i <= 4; i++) {
		console.log("Deleting ")
		console.log(info[0].upload_date + "_" + i + "." + info[0].ext)

		fs.unlink(info[0].upload_date + "_" + i + "." + info[0].ext, "")
	}
}

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

			if(fs.existsSync(filename)) {
				console.log("File already exists, skipping")
				callback()
			} else {
				var videoDownload = youtubedl(url, null, null)

				var size = 0;
				videoDownload.on('info', function(info) {
					size = info.size
					console.log('Download started')
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


			if(fs.existsSync(targetFilename)) {
				console.log(targetFilename + " exists, so not overwriting")
				deleteActs(info)
				process.exit()
				//return
			}

			var uploadDate = getUploadDate(info)
			var targetFilename = getTargetFilename(info)

			if(fs.existsSync(targetFilename)) {
				console.log(targetFilename + " already exists, existing")
				process.exit()
			}

			var execString = "for f in ./" + uploadDate + '_*.' + info[0].ext + "; do echo \"file '$PWD/$f'\"; done "


			var ffmpegString = 
				"| " + "ffmpeg " +	// Pipe and executable name
				"-f concat " +		// Format
				"-i - " +			// Input file name
				"-c copy "	+		// Codec
				
									// Metadata
				//' -metadata title="' + info[0].playlist_title + '"' +
				' -metadata title="The Daily Show With Jon Stewart"' +
				' -metadata description="' + addSlashes(info[0].description) + '"' +
				' -metadata synopsis="' + addSlashes(info[0].description) + '"' +
				' -metadata year="' + info[0].upload_date.slice(0, 4) + '"' + // TODO use date object here, that's betterer
				' -metadata date="' + info[0].upload_date.slice(0, 4) + '"' +
				' -metadata show="The Daily Show With Jon Stewart"' +
				' -metadata copyright="' + "Comedy Central" + '"' +
				' -metadata comment="' + "downloaded with getdaily.js" + '"' +
				' -metadata genre="' + "Comedy" + '" ' + targetFilename

			execString = execString + ffmpegString

			exec(execString, function (error, stdout, stderr) {
				//console.log('stdout: ' + stdout)
				//console.log('stderr: ' + stderr)
				if (error !== null) {
					console.log('exec error: ' + error)
				} else {
					console.log("Finished without error, so now I can clean up the leftovers")
					console.log(info.length)
					deleteActs(info)
				}
			})
		}
	)
})
