#!/usr/bin/env node

var youtubedl = require('youtube-dl');
var async = require('async')
var fs = require('fs')

// References:
// https://ricochen.wordpress.com/2010/04/24/javascript-zero-padding-numbers/
// How to do month as always two digits with left zero padded:
// new String('0' + upload_date.getMonth()).slice(-2)

// http://blog.donaldderek.com/tag/youtube-dl/
// http://pauldbergeron.com/articles/streaming-youtube-to-mp3-audio-in-nodejs.html
// http://stackoverflow.com/questions/18168432/node-js-how-to-pipe-youtube-to-mp4-to-mp3
// 

// FFMPEG
//http://stackoverflow.com/questions/19154807/merging-two-video-streams-and-saving-as-one-file

// Some testing examples
/*
 http://thedailyshow.cc.com/full-episodes/okco56/may-13--2015---reza-aslan
 http://thedailyshow.cc.com/full-episodes/slnsr3/may-12--2015---tom-brokaw
 http://thedailyshow.cc.com/full-episodes/f2nr6x/may-11--2015---john-legend

*/

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


var url = ""

url = "http://thedailyshow.cc.com/full-episodes/okco56/may-13--2015---reza-aslan"

/*
if(process.argv.length < 3) {
	console.log("Usage: ")
	console.log("getdaily.js" + " [-F]" + " [-f format]" +" <url>")
	process.exit()
}
url = process.argv[2]
*/


//console.log(JSON.stringify(process.argv))
//console.log(__filename)

//process.argv.forEach(function(val, index, array) {
//  console.log(index + ': ' + val);
//});

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
	async.eachSeries(
		info,
		function(item, callback) {
			var url
			//console.log("Video to download:")
			//console.log(JSON.stringify(item))

			item.formats.every(function(element, index, array) {
				//console.log("Element:")
				if(element.format_id == "vhttp-3500") {
					//console.log(element)
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
	/*

{ format: 'vhttp-3500 - 1280x720',
    url: 'http://viacommtvstrmfs.fplive.net/gsp.comedystor/com/dailyshow/TDS/season_20/episode_106/ds_20_106_act4_9bc1d5b1f4_1280x720_3500_h32.mp4',
    http_headers: 
     { 'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
       'Accept-Language': 'en-us,en;q=0.5',
       'Accept-Encoding': 'gzip, deflate',
    height: 720,
    width: 1280,
    ext: 'mp4',
    format_id: 'vhttp-3500' }

	*/

	/*
	info.forEach(function(val, index, array) {
		//console.log("For part: " + val.playlist_index)
		console.log("Index: " + index)
		//console.log(val.format_id['rtmp-400'])
		//console.log(val.formats[0])
		val.formats.forEach(function(each) {
			//console.log("URL: " + each.url)
			//console.log(each["format_id"])
			//console.log("---")
		})

		//array[index].forEach(function(entry) {})

		//val.forEach(function(val2, index, array) {
		//	console.log("Detected format:" + val2.format_id)
		//})

		return

		dl = youtubedl.download(url, ".", null);
		dl.on('download', onDownloadBegin);
		dl.on('progress', onDownloadProgress);
		dl.on('error', onDownloadError);
		dl.on('end', onDownloadComplete);

		function onDownloadBegin(err, info) {
			console.log("Downloading: " + info)
		}

	})
	*/

	console.log("Episode info:")
	console.log("Title: " + title)
	console.log("Description: " + description)
	console.log("Date: " + String('0' + upload_date.getDate()).slice(-2))
	console.log("Month: " + String('0' + upload_date.getMonth()).slice(-2))
	console.log("Year:" + upload_date.getFullYear())
	//console.log(info)
});

console.log("---")

///
// From official example:
// https://github.com/fent/node-youtube-dl

var video = youtubedl(url, null, null)

var size = 0;
video.on('info', function(info) {
	size = info.size;
	console.log('Download started');
	console.log('filename: ' + info._filename);
	console.log('size: ' + info.size);

	var output = info._filename
	console.log(output)
	video.pipe(fs.createWriteStream(output));
});

var pos = 0;
video.on('data', function(data) {
	pos += data.length;
	// `size` should not be 0 here.
	if (size) {
		var percent = (pos / size * 100).toFixed(2);
		process.stdout.cursorTo(0);
		process.stdout.clearLine(1);
		process.stdout.write(percent + '%');
	}
});

///

//dl = youtubedl.download(url, ".", []]);

//dl.on('download', function(err, data) {
//	console.log(data)
//})
/*
dl.on('download', onDownloadBegin);
dl.on('progress', onDownloadProgress);
dl.on('error', onDownloadError);
dl.on('end', onDownloadComplete);
*/