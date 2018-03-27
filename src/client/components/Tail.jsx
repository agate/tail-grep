import React from 'react'
import { Input, Icon, Tag } from 'antd'
import ReactList from 'react-list'

import TailLine from './TailLine'

class Tail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      lines: [],
      filters: {},
    }

    this.logIdx = 0

    props.registerTail(props.fileNamePattern, (file, lines) => {
      const filters = Object.keys(this.state.filters)
      let stateLines = this.state.lines.concat([])

      lines.forEach((line) => {
        const matches = filters.map((filter) => {
          const regex = new RegExp(filter)
          return line.match(regex)
        }).filter((filter) => {
          return filter
        })

        if (matches.length == filters.length) {
          stateLines.push({
            idx: this.logIdx++,
            file: file,
            content: line,
          })
        }
      })

      this.setState({ lines: stateLines })
    })
  }

  componentWillUpdate() {
    const totalHeight = this.el.scrollHeight
    const clientHeight = this.el.clientHeight
    const scrollTop = this.el.scrollTop

    this.shouldScrollToBottom = totalHeight == (scrollTop + clientHeight)
  }

  componentDidMount() {
    this.scrollToBottom()
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }

  scrollToBottom() {
    if (this.shouldScrollToBottom) {
      this.el.scrollTop = this.el.scrollHeight
    }
  }

  removeFilter(filter) {
    const filters = JSON.parse(
      JSON.stringify(
        this.state.filters
      )
    )

    delete filters[filter]

    this.setState({ filters })
  }

  addFilter(filter) {
    const filters = JSON.parse(
      JSON.stringify(
        this.state.filters
      )
    )

    filters[filter] = true

    this.setState({ filters })
  }

  renderItem(index, key) {
    let line = this.state.lines[index]
    return (
      <TailLine
        key={line.idx}
        file={line.file}
        content={line.content}
      />
    )
  }

  render() {
    return (
      <div className="tail">
        <div className="grep">
          <Input.Search
            prefix={
              <Icon
                type="filter"
                style={{ color: 'rgba(0,0,0,.25)' }}
              />
            }
            placeholder="Grep Regex"
            enterButton={
              <Icon
                type="plus-circle-o"
              />
            }
            onSearch={this.addFilter.bind(this)}
          />

          {
            Object.keys(this.state.filters).map((filter) => {
              return (
                <Tag
                  key={filter}
                  closable={true}
                  color="#1890ff"
                  afterClose={ () => this.removeFilter(filter) }
                >
                  { filter }
                </Tag>
              )
            })
          }
        </div>

        <div className="tail-lines" ref={el => { this.el = el }}>
          <ReactList
            itemRenderer={this.renderItem.bind(this)}
            length={this.state.lines.length}
            type='uniform'
          />
        </div>
      </div>
    )
  }
}

export default Tail
