import { useEffect } from "react"
import { withFauxDOM } from "react-faux-dom"

import { select } from "d3-selection"
import { arc, pie } from "d3-shape"

import partyColors from "../utils/partyColors"
import partyNames from "../utils/partyNames"

const d3 = { arc, pie, select }

const margin = { top: 60, right: 20, bottom: 10, left: 20 }
const width = 1000 - margin.left - margin.right
const height = 1000 - margin.top - margin.bottom

const GenderPie = props => {
  const arc = d3
    .arc()
    .innerRadius(180)
    .outerRadius(Math.min(width, height) / 2 - 120)

  useEffect(() => {
    const createSvg = () => {
      const faux = props.connectFauxDOM("svg", "genderChart")

      d3.select(faux)
        .attr("viewBox", "0 0 1000 1000")
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2 + 60})`)

      props.animateFauxDOM(100)
    }

    const drawResults = () => {
      const faux = props.connectFauxDOM("div", "genderChart")
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
        .attr("font-size", 65)
        .call(text => text.append("tspan"))
        .attr("y", "-0.4em")
        .text(d => partyNames[d.data.party])

      newData
        .join("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("font-size", 55)
        .attr("fill-opacity", 0.7)
        .call(text => text.filter(d => d.value > 0.25))
        .append("tspan")
        .attr("x", 0)
        .attr("y", "0.7em")
        .text(d => `${d.data.percentage.toFixed(0)}%`)

      props.animateFauxDOM(100)
    }

    createSvg()
    drawResults()
  }, [props, arc])

  return props.genderChart || null
}

export default withFauxDOM(GenderPie)
