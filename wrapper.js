#!/usr/bin/node

/**
 * Import dependencies
 */
var columnify = require('columnify')
var exec = require('child_process').exec
var nw = require('nodewebkit').findpath
var path = require('path')

/**
 * mded always requires 1 argument (the name of the file being edited)
 */
if(!process.argv.length!==3) return usage()
/**
 * Check to see if we are being prompted to run the patching util.
 */
if(process.argv[2]==="--patch") return patch()

/**
 * Node-webkit is dumb, and changes the current working directory. To get
 * around this, we pass in the code directory and current working directory
 * as the first two arguments to our script and do some wizardry during runtime
 * We then pass the filename to the script.
 */
exec(nw()+" "+__dirname+" "+process.cwd()+" "+process.argv[2], function(e,stdout,stderr) {
  if(e) { // If nodewebkit fails to launch or crashes during runtime
    /**
     * First check to see if it is a libudev issue, if so prompt the user to
     * run the libudev patch bundled with mded
     */
    if(e.toString().indexOf('udev')!==-1)
      return console.log("nodewebkit needs patched.\n"+
                         "To fix, please run: mded --patch")
    /**
     * If it is not a libudev issue, we spew out stdout and stderr along with
     * the error message returned, and ask the user to file it as a bug report.
     */
    console.log(stdout)
    console.log(stderr)
    return console.log("Please report this error: \n" + e)
  }
})

/**
 * Calling usage() will dump a standard usage command to stdout, showing you
 * how to use mded.
 */
function usage() {
  var output = "usage: mded FILENAME\nAn intuitive markdown editor\n\n"
  /**
   * columnify will make pretty columns and rows out of our commands.
   * We append the commands to the usage statement
   */
  output+=columnify([
    {
      flag: "--patch",
      description: "Apply libudev patch to nodewebkit.\n"+
                    "Don't use this unless instructed by an error message."
    },
    {
      flag: "FILENAME",
      description: "Open FILENAME in editor"
    }
  ],
  {
     preserveNewLines:true //make sure --patch's newline doesn't get borked
  })
  console.log(output) //spew to stdout
}

/**
 * Calling patch() will run a patch on the locally installed version of
 * nodewebkit (generally installed in node_modules
 */
function patch() {
  /**
   * Yikes, so this thing is a bear... Where to start.
   * So the nodewebkit excutable (nw) excutable is linked against libudev0.
   * Recently, libudev had a version bump from 0 to 1. Since we don't use any
   * of the functionality provided to chromium from libudev, its safe to
   * simply bump versions in our script without worrying about the specification
   * change between version 0 and 1 of libudev. We simply search the entire
   * executable looking for the raw text string "udev.so.0" and replacing it
   * with "udev.so.1". This sed command is exactly equivalent to opening the
   * nw excutable with a text editor and doing a "find-replace" replacing
   * "udev.so.0" "udev.so.1"
   */
  var sed = "sed -i 's/udev\.so\.0/udev.so.1/g' " +
            path.join(__dirname,"node_modules/nodewebkit/nodewebkit/nw")
  console.log("Patching nodewebkit with libudev fix...")
  /**
   * Lets run the sed command
   */
  return exec(sed, function(e,stdout,stderr) {
    if(!e) return console.log("Success!")
    /**
     * If sed returns an error that contains the phrase "Permission", it means
     * that the user didn't have write permission in the directory that sed
     * ran in. If so, sudo *should* fix that problem.
     */
    if(e.toString().indexOf('Permission')!==-1) {
      console.log("FAILED! Try running as sudo")
    } else {
      /**
       * If this wasn't a permission error, there is a serious problem.
       * Report it as a bug.
       */
      console.log(e.toString().trim()) //trim the trailing newline
      console.log(stdout)
      console.log(stderr)
      console.log("FAILED! Please report this bug")
    }
  })
}
