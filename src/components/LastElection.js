import React, { useEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"
import styled from "styled-components"
import { withFauxDOM } from "react-faux-dom"

import { max } from "d3-array"
import { axisLeft } from "d3-axis"
import { interpolate } from "d3-interpolate"
import { scaleBand, scaleLinear } from "d3-scale"
import { select, selection } from "d3-selection"
import { transition } from "d3-transition"
import select_transition from "../../node_modules/d3-transition/src/selection/transition"

// Kind of hack to get d3-transition working with both tree-shaking and d3 modules
// (d3-transition has side effects)
const d3 = {
  axisLeft,
  interpolate,
  max,
  scaleBand,
  scaleLinear,
  select,
  selection, // required for d3-transition on .select
  transition,
}
d3.selection.prototype.transition = select_transition

const partyColors = {
  Alliance: "#f6cb2f",
  BNP: "#2e3b74",
  C: "#0087dc",
  DUP: "#d46a4c",
  "Eng Dem": "#915f6d",
  Green: "#6ab023",
  Ind: "#dddddd",
  Lab: "#dc241f",
  LD: "#faa61a",
  NF: "#191970",
  SDLP: "#3a9e84",
  SF: "#326760",
  SNP: "#fdf38e",
  TUSC: "#ec008c",
  UKIP: "#70147a",
  UUP: "#48a5ee",
}

const Container = styled.div`
  margin-top: 36px;
`

const Title = styled.h5`
  display: block;
  text-align: center;
`

const margin = { top: 15, right: 25, bottom: 15, left: 200 }
const width = 960 - margin.left - margin.right
const height = 500 - margin.top - margin.bottom

const LastElection = props => {
  const results = useStaticQuery(graphql`
    query {
      allResults2017Csv {
        edges {
          node {
            Code
            Constituency
            Party
            Party_Abbreviation
            Candidate_Votes
            Year
          }
        }
      }
    }
  `)
    .allResults2017Csv.edges.filter(d => d.node.Year === "2017")
    .filter(d => {
      return d.node.Code === props.selectedConstituency.key
    })

  const createSvg = () => {
    const faux = props.connectFauxDOM("div", "resultsGraph")
    d3.select(faux)
      .append("svg")
      .attr("width", "100%")

      .attr("viewBox", `0 0 960 500`)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)

    props.animateFauxDOM(100)
  }

  const drawResults = () => {
    const faux = props.connectFauxDOM("div", "resultsGraph")
    const svg = d3.select(faux).select("svg g")
    svg.selectAll("*").remove()

    // Sort data by votes
    const sortedData = results.sort((a, b) =>
      a.node.Candidate_Votes > b.node.Candidate_Votes ? a : b
    )

    const x = d3.scaleLinear().range([0, width])

    const highestVoteCount = d3.max(sortedData, d =>
      parseInt(d.node.Candidate_Votes, 10)
    )
    x.domain([0, highestVoteCount])

    const y = d3
      .scaleBand()
      .range([height, 0])
      .padding(0.1)

    y.domain(sortedData.map(d => d.node.Party).reverse())

    const bars = svg
      .selectAll(".bar")
      .data(sortedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("width", 0)
      .attr("y", d => y(d.node.Party))
      .attr("height", y.bandwidth())
      .attr("fill", d => partyColors[d.node.Party_Abbreviation] || "#dddddd")

    bars
      .transition()
      .duration(450)
      .attrTween("width", d => {
        return d3.interpolate(0, x(d.node.Candidate_Votes))
      })

    svg
      .append("g")
      .style("font-size", 24)
      .style("font-family", "Poppins, sans-serif")
      .style("color", "#333")
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").remove())

    props.animateFauxDOM(450)
  }

  useEffect(() => {
    createSvg()
  }, [])

  useEffect(() => {
    drawResults()
  }, [props.selectedConstituency])

  return (
    <Container>
      <Title>2017 Election Results</Title>
      {props.resultsGraph}
    </Container>
  )
}

export default withFauxDOM(LastElection)
