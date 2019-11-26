import React, { useState } from "react"
import styled from "styled-components"
import { Button, Modal } from "react-bootstrap"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2rem 0;
`

const StyledButton = styled(Button)`
  &.btn {
    max-width: 75%;
    white-space: normal;
  }
`

const IFrameContainer = styled.div`
  display: flex;
  justify-content: center;
`

const ShowMostViewedAdCTA = props => {
  const [showModal, setShowModal] = useState(false)

  const handleClick = () => {
    setShowModal(!showModal)
  }

  return (
    <Container>
      <StyledButton onClick={handleClick}>{`👀 Show the most viewed ad in ${
        props.selectedConstituency.n
      }`}</StyledButton>
      <Modal show={showModal} onHide={handleClick}>
        <Modal.Header closeButton>
          <Modal.Title>{`Most viewed ad in ${
            props.selectedConstituency.n
          }`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <IFrameContainer>
            <iframe
              title={`Most viewed ad in ${props.selectedConstituency.n}`}
              width="560"
              height="315"
              src="https://www.youtube.com/embed/txY6JmP9ULg?autoplay=1"
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </IFrameContainer>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleClick}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default ShowMostViewedAdCTA
