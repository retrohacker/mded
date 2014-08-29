#!/usr/bin/node

var columnify = require('columnify')
var exec = require('child_process').exec
var nw = require('nodewebkit').findpath
var path = require('path')

if(!process.argv[2]) return usage()
if(process.argv[2]==="--patch") return patch()

exec(nw()+" "+__dirname+" "+process.cwd()+" "+process.argv[2], function(e,stdout,stderr) {
  if(e) {
    if(e.toString().indexOf('udev')!==-1) return console.log("nodewebkit needs patched.\nTo fix, please run: mded --patch")
    console.log(stdout)
    console.log(stderr)
    return console.log("Please report this error: \n" + e)
  }
})


function usage() {
  var output = "usage: mded FILENAME\nAn intuitive markdown editor\n\n"
  output+=columnify([
    {
      flag: "--patch",
      description: "Apply libudev patch to nodewebkit.\nDon't use this unless instructed by an error message."
    },
    {
      flag: "FILENAME",
      description: "Open FILENAME in editor"
    }
  ],
  {
     preserveNewLines:true
  })
  console.log(output)
}

function patch() {
    var sed = "sed -i 's/udev\.so\.0/udev.so.1/g' " +
              path.join(__dirname,"node_modules/nodewebkit/nodewebkit/nw")
    console.log("Patching nodewebkit with libudev fix...")
    return exec(sed, function(e,stdout,stderr) {
      if(!e) return console.log("Success!")
      console.log(e.toString().trim())
      if(e.toString().indexOf('Permission')!==-1) {
        console.log("FAILED! Try running as sudo")
      } else {
        console.log(stdout)
        console.log(stderr)
        console.log("FAILED! Please report this bug")
      }
    })
}
