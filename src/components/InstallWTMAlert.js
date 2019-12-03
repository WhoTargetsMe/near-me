import React from "react"
import styled from "styled-components"
import { Alert, Button } from "react-bootstrap"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  text-align: center;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`

const Prompt = styled.strong`
  font-size: 16px;

  @media (min-width: 768px) {
    max-width: 45%;
  }
`

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: 768px) {
    flex-direction: row;
  }
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

    @media (min-width: 768px) {
      &:first-of-type {
        margin-right: 10px;
        margin-left: ${props => (props.horizontal ? "10px" : "0")};
      }
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

const InstallWTMCTA = props => (
  <Alert>
    <Container>
      <Prompt>Help make this data better by installing Who Targets Me</Prompt>
      <Buttons>
        <StyledButton
          horizontal={props.horizontal ? 1 : 0}
          href="https://chrome.google.com/webstore/detail/who-targets-me/fcejbjalmgocomoinikjejnkimlnoljp?hl=en"
          target="_parent"
        >
          Install for Chrome
          <img
            width="25"
            height="25"
            src="https://whotargets.me/wp-content/uploads/2017/04/unnamed.png"
            alt="Chrome logo"
          />
        </StyledButton>
        <StyledButton
          href="https://addons.mozilla.org/en-US/firefox/addon/who-targets-me-firefox/"
          target="_parent"
        >
          Install for Firefox
          <img
            width="25"
            height="25"
            src="https://whotargets.me/wp-content/uploads/2017/05/mozilla-firefox.png"
            alt="Firefox logo"
          />
        </StyledButton>
      </Buttons>
    </Container>
  </Alert>
)

export default InstallWTMCTA
