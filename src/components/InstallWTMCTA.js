import React from "react"
import styled from "styled-components"
import { Button } from "react-bootstrap"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`

const Buttons = styled.div`
  display: flex;
  flex-direction: row;
`

const StyledButton = styled(Button)`
  &.btn {
    display: flex;
    justify-content: row;
    align-items: center;
    margin: 1rem 0;
    font-size: 16px;
    transition: color 0.3s ease, border-color 0.3s ease;
    color: #03c49d;
    border-color: #03c49d;
    background-color: transparent;

    &:first-of-type {
      margin-right: 10px;
    }

    &:hover {
      color: #fcd549;
      border-color: #fcd549;
      background-color: transparent;
    }

    img {
      margin-left: 5px;
    }
  }
`

const InstallWTMCTA = () => (
  <Container>
    <Buttons>
      <StyledButton
        href="https://chrome.google.com/webstore/detail/who-targets-me/fcejbjalmgocomoinikjejnkimlnoljp?hl=en"
        target="_parent"
      >
        For Chrome
        <img
          width="25"
          height="25"
          src="https://whotargets.me/wp-content/uploads/2017/04/unnamed.png"
        />
      </StyledButton>

      <StyledButton
        href="https://addons.mozilla.org/en-US/firefox/addon/who-targets-me-firefox/"
        target="_parent"
      >
        For Firefox
        <img
          width="25"
          height="25"
          src="https://whotargets.me/wp-content/uploads/2017/05/mozilla-firefox.png"
        />
      </StyledButton>
    </Buttons>
  </Container>
)

export default InstallWTMCTA
