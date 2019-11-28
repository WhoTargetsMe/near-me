import { useEffect } from "react"
import { withFauxDOM } from "react-faux-dom"

import { select } from "d3-selection"
import { arc, pie } from "d3-shape"

import partyAbbrs from "../utils/partyAbbrs"
import partyColors from "../utils/partyColors"

const d3 = { arc, pie, select }

const margin = { top: 60, right: 20, bottom: 10, left: 20 }
const width = 1000 - margin.left - margin.right
const height = 1000 - margin.top - margin.bottom

const GenderPie = props => {
  const arc = d3
    .arc()
    .innerRadius(180)
    .outerRadius(Math.min(width, height) / 2 - 120)

  const drawResults = () => {
    const faux = props.connectFauxDOM("svg", "genderChart")
    d3.select(faux)
      .attr("viewBox", "0 0 1000 1000")
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2 + 60})`)

    const svg = d3.select(faux).select("svg g")
    svg.selectAll("*").remove()

    const arcs = d3.pie().value(d => d.percentage)(props.data.parties)

    svg
      .selectAll("path")
      .data(arcs)
      .join("path")
      .attr("fill", d => partyColors[d.data.party] || "#eee")
      .attr("opacity", 0.7)
      .attr("d", arc)

    svg
      .append("text")
      .attr("x", 0)
      .attr("y", -height / 2)
      .attr("font-family", "Poppins, sans-serif")
      .attr("font-size", 90)
      .attr("text-anchor", "middle")
      .text(props.title)

    const newData = svg
      .append("g")
      .attr("font-family", "Poppins, sans-serif")
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(arcs)

    newData
      .join("text")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("font-size", 80)
      .call(text => text.append("tspan"))
      .attr("y", "0.2em")
      .text(d => partyAbbrs[d.data.party])

    props.drawFauxDOM()
  }

  useEffect(() => {
    drawResults()
  }, [props.data])

  return props.genderChart || null
}

export default withFauxDOM(GenderPie)
