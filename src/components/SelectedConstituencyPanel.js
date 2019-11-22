import React, { useEffect, useState } from "react"
import styled from "styled-components"

import AgeBreakdown from "./AgeBreakdown"
import GenderBreakdown from "./GenderBreakdown"
// import LastElection from "./LastElection"

import demographicData from "../data/demographic-breakdown.json"

const Container = styled.div``

const Title = styled.h4`
  display: block;
  text-align: center;
`

const SelectedConstituencyPanel = props => {
  const [ageData, setAgeData] = useState(null)

  useEffect(() => {
    if (!props.selectedConstituency) {
      setAgeData(null)
      return
    }

    const match = demographicData.constituencies.find(
      d => d.id === props.selectedConstituency.key
    )

    if (!match) {
      setAgeData(null)
      return
    }

    if (!match || !match.impressions || !match.impressions.age) {
      setAgeData(null)
      return
    }

    setAgeData(match.impressions.age)
  }, [props.selectedConstituency])

  const renderContent = () => {
    const { n } = props.selectedConstituency

    return (
      <>
        <Title>🗳 {n}</Title>
        <GenderBreakdown selectedConstituency={props.selectedConstituency} />
        {ageData ? <AgeBreakdown data={ageData} /> : null}
        {/*<LastElection selectedConstituency={props.selectedConstituency} />*/}
      </>
    )
  }

  return (
    <Container>{props.selectedConstituency ? renderContent() : null}</Container>
  )
}

export default SelectedConstituencyPanel
