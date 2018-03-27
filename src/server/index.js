const path = require('path')
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const Tail = require('tail').Tail
const glob = require('glob')
const minimatch = require('minimatch')
const fs = require('fs')

const ROOT = path.resolve(__dirname)
const REPO_ROOT = path.resolve(ROOT, '../..')

const PORT = parseInt(process.env.PORT) || 3000
const GLOB_INTERNAL = (parseInt(process.env.GLOB_INTERNAL) || 10) * 1000
const TARGET_DIR = process.argv[2]

if (!TARGET_DIR) {
  console.log("Please pass a root folder of your files!")
  process.exit(1)
}

let FILES = []
let FILE_LINES = {}
let TAILS = {}
let SOCKET_ON_TAIL_CBS = {}
let SOCKET_ON_UNTAIL_CBS = {}
let SOCKET_ON_ERR_CBS = {}
let OUTPUTS = {}

const debug = () => {
  if (process.env.DEBUG) {
    console.log.apply(null, ['[DEBUG]'].concat(arguments))
  }
}

const updateFileList = () => {
  glob('**', {
    cwd: TARGET_DIR,
    nodir: true,
  }, (err, files) => {
    FILES = files.filter((file) => {
      return fs.statSync(`${TARGET_DIR}/${file}`).size
    })
    debug('updateFileList', 'FILES=', FILES)
    io.emit('files', FILES)
  })

  setTimeout(updateFileList, GLOB_INTERNAL)
}
updateFileList()

app.use(express.static(path.resolve(REPO_ROOT, 'dist')))

app.set('view engine', 'pug')
app.set('views', `${ROOT}/views`)

io.on('connection', (socket) => {
  debug('[io][connection]', 'a user connected')

  let fileNamePatterns = {}
  let socketId = socket.id

  SOCKET_ON_TAIL_CBS[socketId] = (file, lines) => {
    let patterns = Object.keys(fileNamePatterns).map((fileNamePattern) => {
      return {
        fileNamePattern: fileNamePattern,
        match: minimatch(file, fileNamePattern),
      }
    }).filter(x => x.match).map(x => x.fileNamePattern)

    if (patterns.length && lines.length) {
      socket.emit('lines', patterns, file, lines)
    }
  }

  SOCKET_ON_UNTAIL_CBS[socketId] = (fileNamePattern) => {
    delete fileNamePatterns[fileNamePattern]
  }

  socket.emit('files', FILES)

  socket.on('tail', (fileNamePattern) => {
    debug(`[io][socket][${socketId}]`, 'tail', fileNamePattern)
    glob(fileNamePattern, {
      cwd: TARGET_DIR,
      nodir: true,
    }, (err, files) => {
      debug(`[io][socket][${socketId}]`, 'tail:glob', files)
      files = files.filter((file) => {
        return fs.statSync(`${TARGET_DIR}/${file}`).size
      })
      files.forEach((file) => {
        if (TAILS[file]) return
        FILE_LINES[file] = []
        debug(`[io][socket][${socketId}]`, 'tail:new', file)
        TAILS[file] = new Tail(`${TARGET_DIR}/${file}`, {
          follow: true
        }).on('line', (line) => {
          FILE_LINES[file].push(line)
        }).on('error', (error) => {
          debug(`[io][socket][${socketId}]`, 'tail:error', file, error)
          for (let id in SOCKET_ON_ERR_CBS) {
            SOCKET_ON_ERR_CBS[id](file, line)
          }
        })
      })
    })

    fileNamePatterns[fileNamePattern] = true
  })

  socket.on('untail', (fileNamePattern) => {
    SOCKET_ON_UNTAIL_CBS[socketId](fileNamePattern)
  })

  socket.on('disconnect', () => {
    debug('[io][connection]', 'user disconnected')
    delete SOCKET_ON_TAIL_CBS[socketId]
    delete SOCKET_ON_UNTAIL_CBS[socketId]
    delete SOCKET_ON_ERR_CBS[socketId]
  })
})

const sendLines = () => {
  for (let file in FILE_LINES) {
    let lines = FILE_LINES[file].splice(0, FILE_LINES[file].length)
    for (let sid in SOCKET_ON_TAIL_CBS) {
      SOCKET_ON_TAIL_CBS[sid](file, lines)
    }
  }
  setTimeout(() => {
    sendLines()
  }, 1000)
}
sendLines()

http.listen(PORT, () => console.log(`listening on port ${PORT}!`))
