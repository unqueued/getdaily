#!/usr/bin/env node

/*

TODO:
Completely refactor.
Should only make one call to youtube get info, then keep refering to that.

*/

var youtubedl = require('youtube-dl');
var async = require('async')
var fs = require('fs')

var url
//var url = "http://thedailyshow.cc.com/full-episodes/8mfir8/june-16--2015---aziz-ansari"
//var url = "http://thedailyshow.cc.com/full-episodes/drk62j/june-15--2015---judd-apatow"
//var url = "http://thedailyshow.cc.com/full-episodes/x6kbau/june-10--2015---colin-quinn"
//var url = "http://thedailyshow.cc.com/full-episodes/nkl263/june-17--2015---bill-clinton"

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


if(process.argv.length < 2) {
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

	console.log("Parsing " + dateString)
	console.log("Year: " + dateString.slice(0, 4))
	console.log("Month: " + dateString.slice(4, 6))
	console.log("Day: " + dateString.slice(6, 8))

	var slicedString =
		dateString.slice(0, 4) + "-" +
		dateString.slice(4, 6) + "-" +
		dateString.slice(6, 8)

	return slicedString
}

// TEst to see if a video format exists for all four streams

var format = "vhttp-200"
//var format = "vhttp-3500"

//console.log("About to get")

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

				concatVideo4(info)
				//concatVideo(info)
			}
		)
	})
}

function concatVideo4(info) {
	// ffmpeg -f concat -i <(find . -name '*.wav' -printf "file '$PWD/%p'\n") -c copy output.wav

	var sys = require('sys')
	var exec = require('child_process').exec;

	if(fs.existsSync(targetFilename)) {
		console.log(targetFilename + " exists, so not overwriting")
		return
	}

  	var guestName = info[0].playlist_title.split(" - ")[1]
  	if(guestName == null) {
  		console.err("unable to parse guest name!")
  		process.exit(1)
  	}
  	guestName = guestName.replace(" ", "-")
  	console.log("Guest name: " + guestName.toLowerCase())

	var uploadDate = info[0].upload_date
	var targetFilename = makeNatoString(uploadDate) + "_thedailyshow_" + guestName.toLowerCase() + "." + info[0].ext

	var execString = 
	"shopt -s extglob; " + 
	"ffmpeg -f concat -i <(for f in ./" + uploadDate + "_*." + info[0].ext + ";" +
	' do echo "file' +
	" '$PWD/$f'\"; done) -c copy " + uploadDate + "." + info[0].ext

	// Works
	execString = 
	'(printf "file \'$PWD/%s\'\\n" ./' + uploadDate + '_*.' + info[0].ext + ')'
	
	// ffmpeg -f concat -i <(find . -name '*.wav' -printf "file '$PWD/%p'\n") -c copy output.wav

	var execSubString = execString
	execString = "ffmpeg -f concat -i <" + execSubString + " -c copy output.mp4"

	// Lets try something more basic, to explore how things are executed:
	execString = "for f in ./" + uploadDate + '_*.' + info[0].ext + "; do echo \"file '$PWD/$f'\"; done "

	//execSubString = execString
	
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
		' -metadata year="' + info[0].upload_date.slice(0, 4) + '"' +
		' -metadata date="' + info[0].upload_date.slice(0, 4) + '"' +
		' -metadata show="The Daily Show With Jon Stewart"' +
		' -metadata copyright="' + "Comedy Central" + '"' +
		' -metadata comment="' + "downloaded with getdaily.js" + '"' +
		' -metadata genre="' + "Comedy" + '" ' + targetFilename



	console.log("Appending metadata:")
	console.log("playlist title: " + info[0].playlist_title)

	console.log("ffmpegString: " + ffmpegString)

	execString = execString + ffmpegString 

	console.log(execString)
	//return

	console.log("Executing: " + execString)
	//console.log(execString)
	//return

	exec(execString, function (error, stdout, stderr) {
	//exec("ls -l", function (error, stdout, stderr) {
	  //sys.print('stdout: ' + stdout);
	  //sys.print('stderr: ' + stderr);
	  console.log('stdout: ' + stdout)
	  console.log('stderr: ' + stderr)
	  if (error !== null) {
	    console.log('exec error: ' + error)
	  } else {
	  	console.log("Finished without error, so now I can clean up the leftovers")
	  	console.log(info.length)
	  	for(var i = 1; i <= 4; i++) {
	  		console.log("Deleting ")
	  		//item.upload_date + "_" + item.playlist_index + "." + item.ext
	  		console.log(info[0].upload_date + "_" + i + "." + info[0].ext)

	  		fs.unlink(info[0].upload_date + "_" + i + "." + info[0].ext, "")
	  	}

	  	console.log("Renaming to: " +  targetFilename)
	  }
	})

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
