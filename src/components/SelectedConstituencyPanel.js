import React, { useEffect, useState } from "react"
import { graphql, useStaticQuery } from "gatsby"
import styled from "styled-components"
import { Button, Glyphicon } from "react-bootstrap"

import AgeBreakdown from "./AgeBreakdown"
import GenderBreakdown from "./GenderBreakdown"
import InstallWTMCTA from "./InstallWTMCTA"
import MarginalAlert from "./MarginalAlert"
import NoDataCTA from "./NoDataCTA"
import ShowMostViewedAdCTA from "./ShowMostViewedAdCTA"
// import LastElection from "./LastElection"

import demographicData from "../data/demographic-breakdown.json"

const Container = styled.div`
  background-color: white;
`

const StyledButton = styled(Button)``

const TitleAndClose = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (min-width: 768px) {
    margin-top: 2rem;

    ${StyledButton} {
      display: none;
    }
  }
`

const Title = styled.h4`
  flex: 1;
  display: block;
  text-align: center;
`

const SelectedConstituencyPanel = props => {
  const [ageData, setAgeData] = useState(null)

  const [genderData, setGenderData] = useState(null)

  const marginal = useStaticQuery(graphql`
    query {
      allMarginalsCsv {
        edges {
          node {
            Code
            Constituency
            Majority
            Majority_Party
            Runner_up_party
            Party
          }
        }
      }
    }
  `).allMarginalsCsv.edges.find(d => {
    if (!props.selectedConstituency || !props.selectedConstituency.key) {
      return false
    }
    return d.node.Code === props.selectedConstituency.key
  })

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

  useEffect(() => {
    if (!props.selectedConstituency) {
      setGenderData(null)
      return
    }

    const match = demographicData.constituencies.find(
      d => d.id === props.selectedConstituency.key
    )

    if (!match || !match.impressions || !match.impressions.gender) {
      setGenderData(null)
      return
    }

    const menData = match.impressions.gender.find(g => g.param === "men")
    const womenData = match.impressions.gender.find(g => g.param === "women")

    setGenderData({
      menData: menData ? menData : null,
      womenData: womenData ? womenData : null,
    })
  }, [props.selectedConstituency])

  const renderContent = () => {
    const { n } = props.selectedConstituency

    return (
      <>
        <TitleAndClose>
          <Title>🗳 {n}</Title>
          <StyledButton onClick={props.onUnselectConstituency}>
            <Glyphicon glyph="remove" />
          </StyledButton>
        </TitleAndClose>
        {marginal ? (
          <MarginalAlert
            marginal={marginal}
            selectedConstituency={props.selectedConstituency}
          />
        ) : null}
        {genderData ? <GenderBreakdown genderData={genderData} /> : null}
        {ageData ? <AgeBreakdown data={ageData} /> : null}
        <ShowMostViewedAdCTA
          selectedConstituency={props.selectedConstituency}
        />

        {!marginal && (genderData || ageData) ? <InstallWTMCTA /> : null}
        {!marginal && !genderData && !ageData ? <NoDataCTA /> : null}
        {/*<LastElection selectedConstituency={props.selectedConstituency} />*/}
      </>
    )
  }

  return (
    <Container>{props.selectedConstituency ? renderContent() : null}</Container>
  )
}

export default SelectedConstituencyPanel
