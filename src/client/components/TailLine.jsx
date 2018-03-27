import React from 'react'

const TailLine = function (props) {
  return (
    <div
      key={ props.idx }
      title={ props.file }
      className="tail-line"
    >
      { props.content }
    </div>
  )
}

export default TailLine
