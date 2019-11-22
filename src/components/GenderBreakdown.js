import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { withFauxDOM } from "react-faux-dom"

import GenderPie from "./GenderPie"

import demographicData from "../data/demographic-breakdown.json"

const Container = styled.div`
  margin-top: 36px;
`

const Title = styled.h5`
  display: block;
  margin-bottom: 2rem;
  text-align: center;
`

const GenderPies = styled.div`
  display: flex;
  height: 150px;

  svg {
    flex: 1 0 auto;
    overflow: initial !important;
  }
`

const GenderBreakdown = props => {
  const [menData, setMenData] = useState(null)
  const [womenData, setWomenData] = useState(null)

  useEffect(() => {
    const match = demographicData.constituencies.find(
      d => d.id === props.selectedConstituency.key
    )

    if (!match || !match.impressions || !match.impressions.gender) {
      setMenData(null)
      setWomenData(null)
      return
    }

    const menData = match.impressions.gender.find(g => g.param === "men")
    const womenData = match.impressions.gender.find(g => g.param === "women")

    setMenData(menData ? menData : null)
    setWomenData(womenData ? womenData : null)
  }, [props.selectedConstituency])

  if (!menData && !womenData) {
    return null
  }

  return (
    <Container>
      <Title>% share of advert impressions by gender</Title>
      <GenderPies>
        {womenData ? <GenderPie title="Women" data={womenData} /> : null}
        {menData ? <GenderPie title="Men" data={menData} /> : null}
      </GenderPies>
    </Container>
  )
}

export default withFauxDOM(GenderBreakdown)
