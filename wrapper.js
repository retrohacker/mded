#!/usr/bin/node

var exec = require('child_process').exec
var nw = require('nodewebkit').findpath
if(!process.argv[2]) {
  console.error("Usage: notes FILENAME")
  process.exit(1)
}

console.log(process.cwd())
exec(nw()+" "+__dirname+" "+process.cwd()+" "+process.argv[2], function(e,stdout,stderr) {
  if(e) return console.log(e)
  console.log(stdout)
  console.log(stderr)
})
