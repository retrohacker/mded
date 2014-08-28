var fs = require('fs')

module.exports = fsWorker = {}

fsWorker.saving = false
fsWorker.pending = false

fsWorker.save = function save(string) {
  fsWorker.data = string
  fsWorker.pending = true
  if(fsWorker.saving) return;
  fsWorker.saving = true
  fsWorker.write()
}

fsWorker.write = function write() {
  fsWorker.pending = false
  fs.writeFile(doc.file,fsWorker.data,function(e) {
    fsWorker.saving = false
    if(!fsWorker.pending) return;
    fsWorker.saving = true
    fsWorker.write()
  })
}
