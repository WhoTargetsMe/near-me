import React, { useEffect } from "react"
import styled from "styled-components"
import { withFauxDOM } from "react-faux-dom"

import { axisLeft, axisTop } from "d3-axis"
import { scaleBand, scaleLinear } from "d3-scale"
import { select } from "d3-selection"
import { stack, stackOffsetExpand } from "d3-shape"

import partyColors from "../utils/partyColors"

const d3 = {
  axisLeft,
  axisTop,
  scaleBand,
  scaleLinear,
  select,
  stack,
  stackOffsetExpand,
}

const Container = styled.div`
  margin-top: 36px;
`

const Title = styled.h5`
  display: block;
  text-align: center;
`

const margin = { top: 10, right: 10, bottom: 0, left: 60 }
const width = 500 - margin.right - margin.left

const yAxisNames = {
  "18": "18-24",
  "25": "25-34",
  "35": "35-44",
  "45": "45-54",
  "55": "55-64",
  "65": "65-74",
  "75": "75+",
}

const x = d3
  .scaleLinear()
  .domain([0, 100])
  .range([margin.left, width - margin.right])

const barHeight = dataLength => dataLength * 40 + margin.top + margin.bottom

const AgeBreakdown = props => {
  useEffect(() => {
    const drawChart = () => {
      const faux = props.connectFauxDOM("svg", "ageChart")
      d3.select(faux)
        .attr("viewBox", `0 0 500 ${barHeight(props.data.length)}`)
        .append("g")

      const svg = d3.select(faux).select("svg g")
      svg.selectAll("*").remove()

      const chartData = props.data.map(d => {
        return d.parties.reduce(
          (prev, next) => ({ ...prev, [next.party]: next.percentage }),
          { name: d.param }
        )
      })

      // Somwhat convoluted way of getting all the unique keys
      // (aka party keys) from the nested data
      const keys = [
        ...new Set([
          ...[].concat(
            ...chartData.map(d => Object.keys(d).filter(key => key !== "name"))
          ),
        ]),
      ]

      const series = d3
        .stack()
        .keys(keys)
        .value((d, key) => d[key] || 0)(chartData)

      const y = d3
        .scaleBand()
        .domain(chartData.map(d => yAxisNames[d.name]))
        .range([margin.top, barHeight(props.data.length) - margin.bottom])
        .padding(0.1)

      svg
        .selectAll("g")
        .data(series)
        .enter()
        .append("g")
        .attr("fill", d => partyColors[d.key])
        .attr("fill-opacity", 0.7)
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => x(d[0]))
        .attr("y", d => y(yAxisNames[d.data.name]))
        .attr("width", d => {
          if (isNaN(d[0]) || isNaN(d[1])) {
            return x(0)
          }

          return x(d[1]) - x(d[0])
        })
        .attr("height", y.bandwidth())

      svg
        .append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y).tickSizeOuter(0))
        .call(g => g.selectAll(".domain").remove())
        .call(g => g.selectAll("line").remove())
        .call(g =>
          g
            .selectAll("text")
            .attr("font-family", "Poppins, sans-serif")
            .attr("font-size", "15")
        )

      props.drawFauxDOM()
    }

    drawChart()
  }, [props.data])

  if (!props.ageChart) {
    return null
  }

  return (
    <Container>
      <Title>% share of advert impressions by age</Title>
      {props.ageChart}
    </Container>
  )
}

export default withFauxDOM(AgeBreakdown)
