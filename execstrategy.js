#!/usr/bin/env node

// This version just uses youtubedl.exec instead

// Going to abandon this for now, as it is unstable and unpredictabl

var youtubedl = require('youtube-dl');
var async = require('async')
var fs = require('fs')

// just do youtubedl exec and cap the output.
//

//var url = "http://thedailyshow.cc.com/full-episodes/okco56/may-13--2015---reza-aslan"

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

/*
ytdl.exec(url, ['-x', '--audio-format', 'mp3'], {}, function(err, output) {
  if (err) throw err;
  console.log(output.join('\n'));
});
*/

// Trying it with options:
//--get-filename --skip-download -o "file '%(title)s-%(autonumber)s.%(ext)s'"

// Well, this seems to work:
// youtube-dl --get-url --skip-download -o '%(title)s-%(autonumber)s.%(ext)s' http://thedailyshow.cc.com/full-episodes/8mfir8/june-16--2015---aziz-ansari
// youtube-dl --get-url --skip-download http://thedailyshow.cc.com/full-episodes/8mfir8/june-16--2015---aziz-ansari

var args = ["--get-filename", "--skip-download"]

youtubedl.exec(url, args, null, function(err, output) {
	console.log("Getting filenames")
	console.log(output)
})

args = ["--skip-download", "--get-url"]

// Is it in args or options??
youtubedl.exec(url, args, null, function(err, output) {
	console.log("Getting urls")
	console.log(output)
})

/*
ytdl.exec(url, ['-x', '--audio-format', 'mp3'], {}, function(err, output) {
  if (err) throw err;
  console.log(output.join('\n'));
});
*/

return

youtubedl.getInfo(url, options, function(err, info) {
  if (err) throw err;

  console.log('id:', info.id);
  console.log('title:', info.title);
  console.log('url:', info.url);
  console.log('thumbnail:', info.thumbnail);
  console.log('description:', info.description);
  console.log('filename:', info._filename);
  console.log('format id:', info.format_id);
});

return

// TEst to see if a video format exists for all four streams

var format = "rtmp-400"

console.log("Execing")

var video = youtubedl(url, null, function(err, info) {
	if (err) throw err;
	//console.log(info)
	console.log("inside init callback")

	async.eachSeries(
		info,
		function(item, callback) {
			var url
			console.log("---")
			console.log()
			console.log()

			console.log(item.playlist_index)
			//console.log(item)
			//console.log("Video to download:")
			//console.log(JSON.stringify(item))

			console.log("Attempting to find urls of " + format + " format")

			item.formats.every(function(element, index, array) {
				//console.log()
				//console.log("Element:")
				//console.log()
				//console.log(element)
				//console.log()
				//console.log("Format: " + element.format)
				//console.log("Format_id: " + element.format_id)
				if(element.format_id == format) {
					console.log()
					console.log(element.format)
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
