import React from 'react'
import { Layout, Tabs, Divider, Tag, Input, Icon } from 'antd'
import _ from 'lodash'
import minimatch from 'minimatch'

import Tail from './Tail'
import css from '../styles/App.sass'

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      files: [],
      fileNamePattern: '',
      fileNamePatterns: {},
    }

    this.socket = props.socket

    this.registerSocketEvents()

    this.tails = {}
  }

  registerSocketEvents() {
    this.socket.on('files', (files) => {
      this.setState({ files })
    })

    this.socket.on('lines', (patterns, file, lines) => {
      patterns.forEach((pattern) => {
        let tail = this.tails[pattern]
        if (tail) tail(file, lines)
      })
    })
  }


  filesUpdated(files) {
    this.setState({
      files
    })
  }

  onFileNamePatternChange(e) {
    const fileNamePattern = e.target.value
    this.setState({
      fileNamePattern
    })
  }

  createNewTail() {
    const fileNamePattern = this.state.fileNamePattern
    if (this.state.fileNamePatterns[fileNamePattern]) return

    const fileNamePatterns = JSON.parse(
      JSON.stringify(
        this.state.fileNamePatterns
      )
    )
    fileNamePatterns[fileNamePattern] = true
    this.setState({ fileNamePatterns })
    this.socket.emit('tail', fileNamePattern)
  }

  removeTail(targetKey, action) {
    if (action == 'remove') {
      const fileNamePatterns = JSON.parse(
        JSON.stringify(
          this.state.fileNamePatterns
        )
      )
      delete(fileNamePatterns[targetKey])
      this.setState({ fileNamePatterns })
      this.socket.emit('untail', targetKey)
    }
  }

  registerTail(pattern, cb) {
    this.tails[pattern] = cb
  }

  renderTabs() {
    if (Object.keys(this.state.fileNamePatterns).length) {
      return (
        <Tabs
          className="tabs"
          hideAdd
          type="editable-card"
          onEdit={this.removeTail.bind(this)}
        >
          {
            Object.keys(this.state.fileNamePatterns).map((pattern) => {
              return (
                <Tabs.TabPane
                  tab={pattern}
                  key={pattern}
                  closable={true}>
                  <Tail
                    fileNamePattern={pattern}
                    registerTail={this.registerTail.bind(this)}
                  />
                </Tabs.TabPane>
              )
            })
          }
        </Tabs>
      )
    }
  }

  renderFiles() {
    let fileNamePattern = this.state.fileNamePattern
    if (fileNamePattern == '') {
      return this.state.files.map((file) => {
        return (
          <Tag key={file}>{file}</Tag>
        )
      })
    } else {
      return this.state.files.filter((file) => {
        return minimatch(file, this.state.fileNamePattern)
      }).map((file) => {
        return (
          <Tag key={file} color="#1890ff">{file}</Tag>
        )
      })
    }
  }

  render() {
    return (
      <Layout className="layout">
        <Layout.Header className="layout-header">
          Tail & Grep
        </Layout.Header>
        <Layout.Content className="layout-content" style={{ padding: '0 50px' }}>
          <div className="files">
            { this.renderFiles() }
          </div>
          <Input.Search
            prefix={<Icon
              type="file-text"
              style={{ color: 'rgba(0,0,0,.25)' }}
            />}
            placeholder="File Name Pattern" enterButton="Tail"
            onChange={this.onFileNamePatternChange.bind(this)}
            onSearch={this.createNewTail.bind(this)}
          />
          {
            this.renderTabs()
          }
        </Layout.Content>
        <Layout.Footer style={{ textAlign: 'center' }}>
          Tail & Grep ©2018 Created by <a href="//github.com/agate">agate</a>.
        </Layout.Footer>
      </Layout>
    )
  }
}

export default App
