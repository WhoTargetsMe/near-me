import React, { useEffect, useLayoutEffect, useState } from "react"
import styled from "styled-components"
import { Button, Modal } from "react-bootstrap"

import demographicData from "../data/demographic-breakdown.json"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2rem 0;
`

const StyledButton = styled(Button)`
  &.btn {
    display: flex;
    justify-content: row;
    align-items: center;
    margin: 1rem 0;
    max-width: 75%;
    white-space: normal;
    font-size: 16px;
    transition: color 0.3s ease, border-color 0.3s ease;
    color: #03c49d;
    border-color: #03c49d;
    background-color: transparent;

    &:hover {
      color: #fcd549;
      border-color: #fcd549;
      background-color: transparent;
    }
  }
`

const IFrameContainer = styled.div`
  display: flex;
  justify-content: center;
`

const ShowMostViewedAdCTA = props => {
  const [ad, setAd] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const handleClick = () => {
    setShowModal(!showModal)
  }

  useEffect(() => {
    const match = demographicData.constituencies.find(
      d => d.id === props.selectedConstituency.key
    )

    if (!match || !match.top_post) {
      setAd(null)
      return
    }

    setAd(match.top_post)
  }, [props.selectedConstituency])

  useLayoutEffect(() => {
    if (window.FB) {
      window.FB.init({
        version: "v5.0",
        xfbml: true,
      })
    }
  })

  if (!ad) {
    return null
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
            <div
              className="fb-post"
              data-href={`https://www.facebook.com/${ad.advertiserId}/posts/${
                ad.postId
              }`}
              data-width="500"
              data-show-text="true"
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
