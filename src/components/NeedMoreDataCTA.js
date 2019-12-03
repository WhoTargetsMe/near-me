import React from "react"
import styled from "styled-components"

import InstallWTMCTA from "./InstallWTMCTA"

const Message = styled.p`
  margin: 2rem 0;
  text-align: center;
`

const NoDataCTA = props => {
  return (
    <div>
      <Message>We need more data in {props.name}. Do you live here?</Message>
      <InstallWTMCTA />
    </div>
  )
}

export default NoDataCTA
