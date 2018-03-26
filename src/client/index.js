require('./images/favicon.png')

import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'

let logsUpdatedListener = {}
let filesUpdatedListener = null

const socket = io()
const filesUpdated = (cb) => filesUpdatedListener = cb
const logsUpdated = (filename, cb) => {
  logsUpdatedListener[filename] = cb
}

socket.on('line', (file, line) => {
  if (logsUpdatedListener[file]) logsUpdatedListener[file](line)
})
socket.on('files', (files) => {
  if (filesUpdatedListener) filesUpdatedListener(files)
})

ReactDOM.render(
  <App
    socket={socket}
  />,
  document.getElementById('root'),
)
