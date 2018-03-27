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
let TAILS = {}
let SOCKET_ON_TAIL_CBS = {}
let SOCKET_ON_ERR_CBS = {}

const updateFileList = () => {
  glob(`${TARGET_DIR}/**/*`, {
    nodir: true
  }, (err, files) => {
    FILES = files.filter((file) => {
      return fs.statSync(file).size
    })
    io.emit('files', FILES)
  })

  setTimeout(updateFileList, GLOB_INTERNAL)
}
updateFileList()

app.use(express.static(path.resolve(REPO_ROOT, 'dist')))

app.set('view engine', 'pug')
app.set('views', `${ROOT}/views`)

io.on('connection', (socket) => {
  console.log('a user connected')

  let fileNamePatterns = {}
  let socketId = socket.id

  SOCKET_ON_TAIL_CBS[socketId] = (file, line) => {
    for (let fileNamePattern in fileNamePatterns) {
      if (minimatch(file, fileNamePattern)) {
        socket.emit('line', fileNamePattern, line)
      }
    }
  }

  socket.emit('files', FILES)

  socket.on('tail', (fileNamePattern) => {
    glob(`${TARGET_DIR}/${fileNamePattern}`, {}, (err, files) => {
      files.forEach((file) => {
        if (TAILS[file]) return

        TAILS[file] = new Tail(file, {
          follow: true
        }).on('line', (line) => {
          if (process.env.DEBUG) console.log(Date.now, '[tail][line]', fiel, line)
          for (var id in SOCKET_ON_TAIL_CBS) {
            SOCKET_ON_TAIL_CBS[id](file, line)
          }
        }).on('error', (error) => {
          for (var id in SOCKET_ON_ERR_CBS) {
            SOCKET_ON_ERR_CBS[id](file, line)
          }
        })
      })
    })

    fileNamePatterns[fileNamePattern] = true
  })

  socket.on('untail', (fileNamePattern) => {
    delete tails[fileNamePattern]
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
    delete SOCKET_ON_TAIL_CBS[socketId]
  })
})

http.listen(PORT, () => console.log(`listening on port ${PORT}!`))
