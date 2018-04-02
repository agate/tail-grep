import React from 'react'
import _ from 'lodash'

class TailLine extends React.Component {
  renderLine() {
    if (this.props.search.length) {
      const res = []
      const pieces = this.props.content.split(this.props.search)
      for (let i=0; i<pieces.length; i++) {
        if (res.length) {
          res.push(
            <span className="highlight">
              { this.props.search }
            </span>
          )
        }
        res.push(pieces[i])
      }
      return res
    } else {
      return this.props.content
    }
  }

  className() {
    const classNames = [ 'tail-line' ]
    if (_.trim(this.props.search) && this.props.content.indexOf(this.props.search) > -1) {
      classNames.push( 'highlight')
    }
    return classNames.join(' ')
  }

  render() {
    return (
      <div
        key={ this.props.idx }
        title={ this.props.file }
        className={ this.className() }
        style={ this.props.style }
      >
        { this.renderLine() }
      </div>
    )
  }
}

export default TailLine
