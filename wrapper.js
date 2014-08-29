#!/usr/bin/node

var exec = require('child_process').exec
var nw = require('nodewebkit').findpath
var path = require('path')
if(!process.argv[2]) {
  console.error("Usage: notes FILENAME")
  process.exit(1)
}

console.log(process.cwd())
exec(nw()+" "+__dirname+" "+process.cwd()+" "+process.argv[2], function(e,stdout,stderr) {
  console.log(stdout)
  console.log(stderr)
  if(e) {
    if(e.toString().indexOf('libudev')===-1) return console.log(e)
    console.log("Patching nodewebkit with libudev fix...")
    return exec("sed -i 's/udev\.so\.0/udev.so.1/g' "+path.join(__dirname,"node_modules/nodewebkit/nodewebkit/nw"), function(e) {
      console.log(stdout)
      console.log(stderr)
      if(e) return console.log(e)
      console.log("PATCHED!")
      return exec(nw()+" "+__dirname+" "+process.cwd()+" "+process.argv[2], function(e,stdout,stderr) {
        console.log(stdout)
        console.log(stderr)
        if(e) return console.log(e)
      })
    })
  }
})
