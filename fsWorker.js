/**
 * fsWorker buffers filesystem writes.
 * This enables us to save every keystroke without overwhelming the hdd.
 * Its like debounce, but for the harddrive.
 */
var fs = require('fs')

module.exports = fsWorker = {}

/**
 * Our state machine switches. One for saving, one for pending.
 * If we are saving, we set saving to true. If, while saving, another write
 * comes in, we will buffer it and set pending to true. Finally, if we are
 * already have a pending save when a write comes in, we replace buffered
 * data with our new save. When the save finishes, we write the new buffer.
 */
fsWorker.saving = false
fsWorker.pending = false

fsWorker.save = function save(string) {
  fsWorker.data = string //data is our buffer
  fsWorker.pending = true //flip pending to true
  if(fsWorker.saving) return; //if already saving, return
  fsWorker.saving = true //else, start saving
  fsWorker.write()
}

fsWorker.write = function write() {
  fsWorker.pending = false // No longer pending
  fs.writeFile(doc.file,fsWorker.data,function(e) {
    fsWorker.saving = false // We aren't saving anymore
    if(!fsWorker.pending) return; // if no data left to write, exit.
    fsWorker.saving = true //If there is more data, save it
    fsWorker.write()
  })
}
