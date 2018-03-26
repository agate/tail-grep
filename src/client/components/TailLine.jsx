import React from 'react'

const TailLine = function (props) {
  return (
    <div key={ props.idx } className="tail-line">
      { props.content }
    </div>
  )
}

export default TailLine
