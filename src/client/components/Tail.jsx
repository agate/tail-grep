import React from 'react'
import { Input, Icon, Switch, Tag, Row, Col } from 'antd'
import { List, AutoSizer } from 'react-virtualized'

import TailLine from './TailLine'

class Tail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      lines: [],
      filters: {},
      tail: true,
      search: '',
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

  search(keyword) {
    this.setState({
      search: keyword
    })
  }

  renderItems({index, isScrolling, key, style}) {
    let line = this.state.lines[index]
    return (
      <TailLine
        key={key}
        file={line.file}
        content={line.content}
        style={style}
        search={this.state.search}
      />
    )
  }

  onTailSwitchChange(checked) {
    this.setState({
      tail: checked
    })
  }

  render() {
    return (
      <div className="tail">
        <div className="grep">
          <Row>
            <Col md={14} sm={24}>
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
            </Col>
            <Col md={10} sm={24}>
              <Input.Search
                prefix={
                  <Icon
                    type="search"
                    style={{ color: 'rgba(0,0,0,.25)' }}
                  />
                }
                placeholder="Search"
                enterButton={
                  <Icon
                    type="search"
                  />
                }
                onSearch={this.search.bind(this)}
              />
            </Col>
          </Row>

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


        <div className="tail-lines">
          <Switch
            className="tail-switch"
            checkedChildren="tail"
            unCheckedChildren="off"
            defaultChecked
            onChange={ this.onTailSwitchChange.bind(this) }
          />
          <AutoSizer>
            {({width, height}) => (
              <List
                ref={list => { this.list = list }}
                height={height}
                width={width}
                overscanRowCount={50}
                rowCount={this.state.lines.length}
                rowHeight={21}
                scrollToIndex={this.state.tail ? this.state.lines.length-1 : -1}
                rowRenderer={this.renderItems.bind(this)}
              />
            )}
          </AutoSizer>
        </div>
      </div>
    )
  }
}

export default Tail
