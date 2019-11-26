import React from "react"
import styled from "styled-components"
import { Button } from "react-bootstrap"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`
const StyledButton = styled(Button)`
  &.btn {
    max-width: 75%;
    white-space: normal;
  }
`

const InstallWTMCTA = () => (
  <Container>
    <StyledButton href="https://whotargets.me/en/how-who-targets-me-works/">
      🚀 Install the WhoTargetsMe extension
    </StyledButton>
  </Container>
)

export default InstallWTMCTA
