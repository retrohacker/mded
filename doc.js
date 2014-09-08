/**
 * doc.js is the main datastructure of mded. Everything else is simply an
 * interface to doc. It represents a single markdown document. It keeps track
 * of which line the user is on, and allows navigating the document. It is a
 * simple abstraction which allows us to easily navigate the document line by
 * line without considering the contents of the document itself.
 */
var EventEmitter = require('events').EventEmitter
var fs = require('fs')
var fsWorker = require('./fsWorker.js')

/**
 * Since everything is an interface to doc, we need a way of notifing other
 * parts of mded about changes to our document. Making doc an extension of
 * EventEmitter allows us to notify other parts of our code when our document
 * changes, simply by registering event listeners.
 */
module.exports = doc = new EventEmitter()

/**
 * Changed is a simple state machine keeping track of changes between writes
 */
var changed = false

/**
 * Our current way of storing the document is splitting it around the newline
 * character. This is transparent to eveything which interacts with doc, as we
 * have defined an interface which does not expose the contents array.
 */
var contents = []

/**
 * doc.init loads a file from the HDD and does some wizardry to it, preparing
 * it to be editied by the user
 */
doc.init = function init(file,cb) {
  doc.file = file // Keep track of the filename we are editing
  fs.readFile(file,{"encoding":"utf-8"},function(e,data) {
    /**
     * TODO:
     * We currently ignore the error.
     * If the file doesn't exist, we will create it.
     * This is bad, exceptions other than the file not existing will cause
     * the user's file to be overwritten. Need better logic
     */
    data = data || ""
    data = data.replace(/\r\n|\r/g, '\n') // Deal with windows newlines
               .replace(/\t/g, '  ') // Change tabs to spaces
               .replace(/\u00a0/g, ' ') // Change non-breaking space to space
               .replace(/\u2424/g, '\n') // Unicode newline to escaped newline
    /**
     * We simply place the file contents as the only member of the contents
     * array, then we force segmentation of the file (aka split around newlines)
     */
    contents = [data]
    changed = true
    segmentFile()
    doc.index = 0 // We are on the first line
    cb() // Done loading
  })
}

/**
 * SegmentFile splits the file up into individual units that can easily be
 * manipulated by the text editor. Currently, the logic splits around newlines.
 */
segmentFile = function segmentFile() {
  if(!changed) return;
  console.log("Segmenting File!") //Debugging purposes
  var data = contents.join('\n')
  contents = data.split('\n')
  changed = false
  fsWorker.save(data)
}

/**
 * Get the line the user is currently on
 */
doc.getCurrent = function getCurrent() {
  return contents[doc.index]
}

/**
 * Get all of the file contents after the line the user is currently on
 */
doc.getNext = function getNext() {
  return contents.slice(doc.index+1).join('\n')
}

/**
 * Get all of the file contents before the line the user is currently on
 */
doc.getPrev = function getPrev() {
  return contents.slice(0,doc.index).join('\n')
}

/**
 * Increase the current line number the user is on by val.
 * i.e. 1 will move the user forward 1 line
 */
doc.incr = function incr(val) {
  val = val || 1
  if(doc.index+val>contents.length-1) return;
  segmentFile()
  doc.index+=val
  doc.emit("change")
}

/**
 * Reduce the current line number the user is on by val.
 * i.e. 1 will move the user back 1 line
 */
doc.decr = function decr(val) {
  val = val || 1
  if(doc.index-val<0) return;
  segmentFile()
  doc.index-=val
  doc.emit("change")
}

/**
 * Overwrite the current line with the passed in string
 */
doc.updateCurrentLine = function updateCurrentLine(string) {
  fsWorker.save(contents.join('\n'))
  if(contents[doc.index] == string) return;
  contents[doc.index] = string
  changed = true
}

/**
 * Deletes the current line in the document.
 */
doc.deleteCurrent = function deleteCurrent() {
  contents = Array.prototype.concat(contents.slice(0,doc.index),contents.slice(doc.index+1))
  doc.index--
  segmentFile()
  doc.emit("change")
}

/**
 * Get the number of lines in the document (currently split around newlines)
 */
doc.rows = function rows() {
  return contents.length
}
