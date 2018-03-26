import React from 'react'
import { Input, Icon, Tag } from 'antd'

import TailLine from './TailLine'

class Tail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      lines: [],
      filters: {},
    }

    this.logIdx = 0

    props.registerTail(props.fileNamePattern, (line) => {
      const filters = Object.keys(this.state.filters)
      const matches = filters.map((filter) => {
        const regex = new RegExp(filter)
        return line.match(regex)
      }).filter((filter) => {
        return filter
      })

      if (matches.length == filters.length) {
        let lines = this.state.lines.concat([{
          idx: this.logIdx++,
          content: line,
        }])
        this.setState({ lines })
      }
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

        <div className="tailLines" ref={el => { this.el = el }}>
          {
            this.state.lines.map((line) => {
              return (
                <TailLine key={line.idx} content={line.content} />
              )
            })
          }
        </div>
      </div>
    )
  }
}

export default Tail
