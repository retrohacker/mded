var EventEmitter = require('events').EventEmitter
var fs = require('fs')
var fsWorker = require('./fsWorker.js')

module.exports = doc = new EventEmitter()

var changed = false
var contents = []

doc.init = function init(file,cb) {
  doc.file = file
  fs.readFile(file,{"encoding":"utf-8"},function(e,data) {
    data = data || ""
    data = data.replace(/\r\n|\r/g, '\n')
               .replace(/\t/g, '  ')
               .replace(/\u00a0/g, ' ')
               .replace(/\u2424/g, '\n')
    contents = [data]
    //var lexer = new marked.Lexer()
    /**
    Object.keys(lexer.rules).forEach(function(v) {
      var newContents = []
      contents.forEach(function(substr) {
        console.log(substr)
        substr.split(lexer.rules[v]).forEach(function(subsubstr) {
          console.log(subsubstr)
          newContents.push(subsubstr)
        })
      })
      contents = newContents
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
  var data = contents.join('\n')
  contents = data.split('\n')
  changed = false
  fsWorker.save(data)
}

doc.getCurrent = function getCurrent() {
  return contents[doc.index]
}

doc.getNext = function getNext() {
  return contents.slice(doc.index+1).join('\n')
}

doc.getPrev = function getPrev() {
  return contents.slice(0,doc.index).join('\n')
}

doc.incr = function incr(val) {
  val = val || 1
  if(doc.index+val>contents.length-1) return;
  segmentFile()
  doc.index+=val
  doc.emit("change")
}

doc.decr = function decr(val) {
  val = val || 1
  if(doc.index-val<0) return;
  segmentFile()
  doc.index-=val
  doc.emit("change")
}

doc.updateCurrentLine = function updateCurrentLine(string) {
  fsWorker.save(contents.join('\n'))
  if(contents[doc.index] == string) return;
  contents[doc.index] = string
  changed = true
}

doc.deleteCurrent = function deleteCurrent() {
  contents = Array.prototype.concat(contents.slice(0,doc.index),contents.slice(doc.index+1))
  doc.index--
  segmentFile()
  doc.emit("change")
}

doc.rows = function rows() {
  return contents.length
}
