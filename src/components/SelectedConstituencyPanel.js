import React from "react"
import styled from "styled-components"

const Container = styled.div`
  padding: 1rem 0;
`

const Title = styled.h3`
  display: block;
  text-align: center;
`

const Description = styled.p``

const SelectedConstituencyPanel = props => {
  const renderContent = () => {
    const { n } = props.selectedConstituency

    return (
      <>
        <Title>🗳 {n}</Title>
        <Description>
          Here's some important info about {n}. Who will win?? 📺 Stay tuned.
        </Description>
      </>
    )
  }

  return (
    <Container>{props.selectedConstituency ? renderContent() : null}</Container>
  )
}

export default SelectedConstituencyPanel
