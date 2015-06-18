#!/usr/bin/env node

/*

TODO:
Completely refactor.
Should only make one call to youtube get info, then keep refering to that.

*/

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

	var uploadDate = info[0].upload_date
	var targetFilename = uploadDate + "." + info[0].ext

	if(fs.existsSync(targetFilename)) {
		console.log(targetFilename + " exists, so not overwriting")
		return
	}
	
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
	    console.log('exec error: ' + error);
	  }
	})

}

function concatVideo3(info) {
	// ffmpeg -f concat -i <(for f in ./*.wav; do echo "file '$PWD/$f'"; done) -c copy output.wav

	var sys = require('sys')
	var exec = require('child_process').exec;

	var uploadDate = info[0].upload_date
	var targetFilename = uploadDate + "." + info[0].ext

	if(fs.existsSync(targetFilename)) {
		console.log(targetFilename + " exists, so not overwriting")
		return
	}
	
	var execString = 
	"shopt -s extglob; " + 
	"ffmpeg -f concat -i <(for f in ./" + uploadDate + "_*." + info[0].ext + ";" +
	' do echo "file' +
	" '$PWD/$f'\"; done) -c copy " + uploadDate + "." + info[0].ext

	// It isn't working, lets try unpacking it a bit.


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
	    console.log('exec error: ' + error);
	  }
	})

}

// This version works, but, it completely re-encodes everything.
// It's probably simpler to just directly invoke ffmpeg from the shell...
function concatVideo(info) {
	var ffmpeg = require('fluent-ffmpeg')
	var command = ffmpeg()


	ffmpeg('20150616_1.mp4')
	  .input('20150616_2.mp4')
	//  .input('20150616_2.mp4')
	  .input('20150616_3.mp4')
	  .input('20150616_4.mp4')
	  .on('error', function(err) {
	    console.log('An error occurred: ' + err.message);
	  })
	  .on('end', function() {
	    console.log('Merging finished !');
	  })
	  .on('progress', function(progress) {
	  	console.log('Processing: ' + progress.percent + '% done')
	  })
	  .mergeToFile('20150616.mp4', '/tmp');

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

function concatVideo2(info) {
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

			ffmpeg().mergeToFile("output.mp4", "/tmp")
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
