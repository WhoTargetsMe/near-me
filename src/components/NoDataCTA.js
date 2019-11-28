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
      <Message>
        We have no data here. We need users in this constituency. Do you live
        here?
      </Message>
      <InstallWTMCTA />
    </div>
  )
}

export default NoDataCTA
