var EventEmitter = require('events').EventEmitter
var fs = require('fs')
var fsWorker = require('./fsWorker.js')

module.exports = doc = new EventEmitter()

var changed = false

doc.init = function init(file,cb) {
  doc.file = file
  fs.readFile(file,{"encoding":"utf-8"},function(e,data) {
    data = data || ""
    data = data.replace(/\r\n|\r/g, '\n')
               .replace(/\t/g, '  ')
               .replace(/\u00a0/g, ' ')
               .replace(/\u2424/g, '\n')
    doc.contents = [data]
    //var lexer = new marked.Lexer()
    /**
    Object.keys(lexer.rules).forEach(function(v) {
      var newContents = []
      doc.contents.forEach(function(substr) {
        console.log(substr)
        substr.split(lexer.rules[v]).forEach(function(subsubstr) {
          console.log(subsubstr)
          newContents.push(subsubstr)
        })
      })
      doc.contents = newContents
      //console.log(lexer.rules[v])
    })
    */
    changed = true
    segmentFile()
    doc.index = 0
    cb()
  })
}

segmentFile = function segmentFile() {
  if(!changed) return;
  console.log("Segmenting File!")
  var data = doc.contents.join('\n')
  doc.contents = data.split('\n')
  changed = false
  fsWorker.save(data)
}

doc.getCurrent = function getCurrent() {
  return doc.contents[doc.index]
}

doc.getNext = function getNext() {
  return doc.contents.slice(doc.index+1).join('\n')
}

doc.getPrev = function getPrev() {
  return doc.contents.slice(0,doc.index).join('\n')
}

doc.incr = function incr() {
  // We allow one blank line
  if(doc.index === doc.contents.length-1) return;
  segmentFile()
  doc.index++
  doc.emit("change")
}

doc.decr = function decr() {
  if(doc.index === 0) return;
  segmentFile()
  doc.index--
  doc.emit("change")
}

doc.updateCurrentLine = function updateCurrentLine(string) {
  fsWorker.save(doc.contents.join('\n'))
  if(doc.contents[doc.index] == string) return;
  doc.contents[doc.index] = string
  changed = true
}

doc.deleteCurrent = function deleteCurrent() {
  doc.contents = Array.prototype.concat(doc.contents.slice(0,doc.index),doc.contents.slice(doc.index+1))
  doc.index--
  segmentFile()
  doc.emit("change")
}
