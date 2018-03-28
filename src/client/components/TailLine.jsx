import React from 'react'

class TailLine extends React.Component {
  render() {
    return (
      <div
        key={ this.props.idx }
        title={ this.props.file }
        className="tail-line"
        style={ this.props.style }
      >
        { this.props.content }
      </div>
    )
  }
}

export default TailLine
