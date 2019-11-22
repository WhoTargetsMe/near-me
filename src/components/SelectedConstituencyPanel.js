import React from "react"
import styled from "styled-components"

import GenderBreakdown from "./GenderBreakdown"
import LastElection from "./LastElection"

const Container = styled.div``

const Title = styled.h4`
  display: block;
  text-align: center;
`

const SelectedConstituencyPanel = props => {
  const renderContent = () => {
    const { n } = props.selectedConstituency

    return (
      <>
        <Title>🗳 {n}</Title>
        <GenderBreakdown selectedConstituency={props.selectedConstituency} />
        {/*<LastElection selectedConstituency={props.selectedConstituency} />*/}
      </>
    )
  }

  return (
    <Container>{props.selectedConstituency ? renderContent() : null}</Container>
  )
}

export default SelectedConstituencyPanel
