import React, { useEffect } from "react"
import styled, { keyframes } from "styled-components"
import { withFauxDOM } from "react-faux-dom"

import { max } from "d3-array"
import { axisBottom, axisLeft } from "d3-axis"
import { scaleLinear, scaleBand } from "d3-scale"
import { select } from "d3-selection"

import partyColors from "../utils/partyColors"

const d3 = { axisBottom, axisLeft, max, scaleBand, scaleLinear, select }

const grow = keyframes`
  0% {
    max-height: 0;
  }

  100% {
    max-height: 400px;
  }
`

const Container = styled.div`
  animation ${grow} 0.6s linear;
  overflow:hidden;

`

const Title = styled.strong`
  display: block;
`

const fixedData = [
  { value: 0, key: "CON" },
  { value: 0, key: "LAB" },
  { value: 0, key: "LD" },
  { value: 0, key: "BRE" },
  { value: 0, key: "SNP" },
  { value: 0, key: "NI" },
  { value: 0, key: "PC" },
  { value: 0, key: "GRE" },
  { value: 0, key: "IND" },
]

const LeaderboardExtraData = props => {
  const drawChart = () => {
    const faux = props.connectFauxDOM("svg", "barChart")
    d3.select(faux).attr("viewBox", `0 0 500 250`)

    const margin = { top: 30, right: 0, bottom: 30, left: 0 }
    const width = 500 - margin.left - margin.right
    const height = 250 - margin.top - margin.bottom

    const data = fixedData.map(d => {
      if (props.selectedConstituency[d.key]) {
        return {
          key: d.key,
          value: props.selectedConstituency[d.key].avgPerUserPerCampaignPeriod,
        }
      }

      return d
    })

    const x = d3
      .scaleBand()
      .range([0, width])
      .padding(0.1)
    const y = d3.scaleLinear().range([height, 0])

    const svg = d3
      .select(faux)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)

    x.domain(data.map(d => d.key))
    y.domain([0, d3.max(data, d => d.value)])

    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.key))
      .attr("width", () => {
        return x.bandwidth()
      })
      .attr("y", d => y(d.value))
      .attr("height", d => height - y(d.value))
      .attr("fill", d => partyColors[d.key])

    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .attr("style", {
        fontFamily: "Poppins, sans-serif",
        fontSize: 18,
        fontWeight: "bold",
        textTransform: "uppercase",
      })
      .selectAll(".domain, .tick line")
      .remove()

    props.drawFauxDOM()
  }

  useEffect(() => {
    drawChart()
  }, [props.selectedConstituency])

  return (
    <Container>
      <Title>
        % of ad views in {props.selectedConstituency.node.Constituency}
      </Title>
      {props.barChart}
    </Container>
  )
}

export default withFauxDOM(LeaderboardExtraData)
