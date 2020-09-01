const ram = require('random-access-memory')
const ddatabase = require('ddatabase')

const createStream = require('../..')

function createLocal (numRecords, recordSize, cb) {
  let core = ddatabase(ram)

  let records = []
  for (let i = 0; i < numRecords; i++) {
    let record = Buffer.allocUnsafe(recordSize).fill(Math.floor(Math.random() * 10))
    records.push(record)
  }

  core.append(records, err => {
    if (err) return cb(err)
    let stream = createStream()
    return cb(null, core, core, stream, records)
  })
}

function createRemote (numRecords, recordSize, cb) {
  let core1 = ddatabase(ram, { sparse: true })

  let records = []
  for (let i = 0; i < numRecords; i++) {
    let record = Buffer.allocUnsafe(recordSize).fill(Math.floor(Math.random() * 10))
    records.push(record)
  }

  core1.append(records, err => {
    if (err) return cb(err)

    let core2 = ddatabase(ram, core1.key, { sparse: true })

    let s1 = core1.replicate({ live: true })
    s1.pipe(core2.replicate({ live: true })).pipe(s1)

    let stream = createStream()
    return cb(null, core1, core2, stream, records)
  })
}

module.exports = {
  createLocal,
  createRemote
}
