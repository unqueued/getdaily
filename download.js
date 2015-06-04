#!/usr/bin/env node

var path = require('path');
var fs   = require('fs');
var ytdl = require('youtube-dl');

var ProgressBar = require('progress');

var video = ytdl('http://www.youtube.com/watch?v=Seku9G1kT0c',
  // Optional arguments passed to youtube-dl.
  ['-f', '22']);


var size = 0;
video.on('info', function(info) {
  size = info.size;
  console.log('Got video info');
  console.log('saving to ' + info._filename);
  console.log("Output")
  console.log(size + " bytes")
  //var output = "output.mp4"
  var output = info._filename
  //var output = path.join(__dirname, 'videos', info._filename);
  console.log(output)
  video.pipe(fs.createWriteStream(output));
});

var bar = new ProgressBar(':bar', { total: 100 });

/*
var timer = setInterval(function () {
  bar.tick();
  if (bar.complete) {
    console.log('\ncomplete\n');
    clearInterval(timer);
  }
}, 100);
*/

var prev_percent = 0

var pos = 0;
video.on('data', function(data) {
  
  //console.log(data.length)

  pos += data.length;
  // `size` should not be 0 here.
  if (size) {
    var percent = (pos / size * 100).toFixed(0);
    //console.log(percent)

    if(prev_percent < percent) {
      //console.log("percent: " + percent + " prev_percent: " + prev_percent)

      //bar.tick()

      /*
      process.stdout.cursorTo(0);
      process.stdout.clearLine(1);
      process.stdout.write(percent + '%');
      */
    }
    
    process.stdout.cursorTo(0);
    process.stdout.clearLine(1);
    process.stdout.write(percent + '%');
    

    //bar.tick()

    //prev_percent = percent
  }
});

video.on('end', function() {
  console.log("Finished");
});


