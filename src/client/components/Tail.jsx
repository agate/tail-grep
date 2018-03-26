import React from 'react'

import TailLine from './TailLine'

class Tail extends React.Component {
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
      <div className="tail" ref={el => { this.el = el }}>
        {
          this.state.lines.map((line) => {
            return (
              <TailLine key={line.idx} content={line.content} />
            )
          })
        }
      </div>
    )
  }
}

export default Tail
