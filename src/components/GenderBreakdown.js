import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { withFauxDOM } from "react-faux-dom"

import GenderPie from "./GenderPie"

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
    flex: 1 1 auto;
    overflow: initial !important;
  }
`

const GenderBreakdown = props => {
  const { menData, womenData } = props.genderData

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
