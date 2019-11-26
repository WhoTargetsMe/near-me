import React from "react"
import styled from "styled-components"
import { Button } from "react-bootstrap"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`
const StyledButton = styled(Button)`
  &.btn {
    margin: 2rem 0;
    max-width: 75%;
    white-space: normal;
  }
`

const InstallWTMCTA = () => (
  <Container>
    <p>
      We have a chance to bring more transparency to British Elections. We're on
      a mission to crowdsource a database of every political Facebook ad this
      election. Now we need your help.
    </p>
    <StyledButton
      href="https://whotargets.me/en/how-who-targets-me-works/"
      target="_parent"
    >
      🚀 Get involved — download our browser extension
    </StyledButton>
    <p>
      It's simple and safe, and the anonymous data you collect will help build a
      clearer picture of how politicians are targeting all of us.
    </p>
  </Container>
)

export default InstallWTMCTA
