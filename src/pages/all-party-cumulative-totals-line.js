import React, { useEffect, useLayoutEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"
import styled from "styled-components"

import { axisBottom, axisLeft } from "d3-axis"
import { scaleBand, scaleLinear } from "d3-scale"
import { select } from "d3-selection"

const Container = styled.div`
  padding: 0.5rem;
  overflow; hidden;
  font-family: "Poppins", sans-serif;
`

const Attribution = styled.strong`
  display: block;
  text-align: right;
`

const AllPartyCumulativeTotalsLine = () => {
  const data = useStaticQuery(graphql`
    query {
      allAllPartiesCumulativesCsv {
        edges {
          node {
            group
            variable
            value
          }
        }
      }
    }
  `)

  useEffect(() => {
    window.addEventListener("message", e => {
      if (e.data !== "CheckSize") {
        return
      }

      e.source.postMessage({
        CumulativeTotalsFrameSize: document.body.offsetHeight,
      })
    })
  })

  useLayoutEffect(() => {
    window.top.postMessage(
      { CumulativeTotalsFrameSize: document.body.offsetHeight },
      "*"
    )
  })

  const myGroups = data.allAllPartiesCumulativesCsv.edges.map(d => d.node.group)
  const myVars = [
    "Cons",
    "Lab",
    "LD",
    "BP",
    "SNP",
    "PC",
    "Green",
    "Ind",
    "Remain",
    "Leave",
  ]

  useLayoutEffect(() => {
    const margin = { top: 30, right: 30, bottom: 30, left: 60 }
    const width = 450 - margin.left - margin.right
    const height = 450 - margin.top - margin.bottom

    // append the svg object to the body of the page
    const svg = select("#cumulative-totals-chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    const x = scaleBand()
      .range([0, width])
      .domain(myGroups)
      .padding(0.01)

    const y = scaleBand()
      .range([height, 0])
      .domain(myVars)
      .padding(0.01)
    svg.append("g").call(axisLeft(y))

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(axisBottom(x))

    const biggest = Math.max(
      ...data.allAllPartiesCumulativesCsv.edges.map(d =>
        parseInt(d.node.value, 10)
      )
    )

    const colorScale = scaleLinear()
      .range(["white", "red"])
      .domain([0, biggest])

    svg
      .selectAll()
      .data(data.allAllPartiesCumulativesCsv.edges, d => {
        return d.node.group + ":" + d.node.variable
      })
      .enter()
      .append("rect")
      .attr("x", d => x(d.node.group))
      .attr("y", d => y(d.node.variable))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", d => colorScale(d.node.value))

    window.top.postMessage(
      { CumulativeTotalsFrameSize: document.body.offsetHeight },
      "*"
    )
  })

  return (
    <Container>
      <h4>All Parties Cumulative Totals</h4>
      <svg id="cumulative-totals-chart" />
      <Attribution>whotargets.me data</Attribution>
    </Container>
  )
}

export default AllPartyCumulativeTotalsLine
