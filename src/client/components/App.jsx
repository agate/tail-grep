import React from 'react'
import { Layout, Menu, Breadcrumb, Tabs, Button, Divider, Tag, Form, Input, Icon } from 'antd'
const { Header, Content, Footer } = Layout
const { TabPane } = Tabs
import _ from 'lodash'
import minimatch from 'minimatch'

const FileLine = function (props) {
  return (
    <div key={ props.idx } className="file-line">
      { props.content }
    </div>
  )
}

class File extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      lines: [],
    }

    this.logIdx = 0

    props.registerTail(props.fileNamePattern, (line) => {
      let lines = this.state.lines.concat([{
        idx: this.logIdx++,
        content: line,
      }])
      this.setState({ lines })
    })
  }

  componentDidMount() {
    this.scrollToBottom()
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }

  scrollToBottom() {
    this.el.scrollTop = this.el.scrollHeight
  }

  render() {
    return (
      <div className="file" ref={el => { this.el = el }} style={{ height: '300px', overflow: 'scroll' }}>
        {
          this.state.lines.map((line) => {
            return (
              <FileLine key={line.idx} content={line.content} />
            )
          })
        }
      </div>
    )
  }
}

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

    this.socket.on('line', (pattern, line) => {
      let tail = this.tails[pattern]
      if (tail) tail(line)
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
    }
  }

  registerTail(pattern, cb) {
    this.tails[pattern] = cb
  }

  render() {
    return (
      <Layout style={{ height: '100vh' }}>
        <Header>
          Tail Grep
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <Divider />
          {
            this.state.files.map((file) => {
              const color = minimatch(file, this.state.fileNamePattern) ? '#108ee9' : null
              return (
                <Tag key={file} color={color}>{file}</Tag>
              )
            })
          }
          <Divider />
          <Input.Search
            prefix={<Icon
              type="file-text"
              style={{ color: 'rgba(0,0,0,.25)' }}
            />}
            placeholder="File Name Pattern" enterButton="Tail"
            onChange={this.onFileNamePatternChange.bind(this)}
            onSearch={this.createNewTail.bind(this)}
          />
          <Tabs
            hideAdd
            type="editable-card"
            onEdit={this.removeTail.bind(this)}
          >
            {
              Object.keys(this.state.fileNamePatterns).map((pattern) => {
                return (
                  <TabPane
                    tab={pattern}
                    key={pattern}
                    closable={true}>
                    <File 
                      fileNamePattern={pattern}
                      registerTail={this.registerTail.bind(this)}
                    />
                  </TabPane>
                )
              })
            }
          </Tabs>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Tail & Grep ©2018 Created by agate.
        </Footer>
      </Layout>
    )
  }
}

export default App
