import React, { useEffect, useLayoutEffect, useState } from "react"
import styled from "styled-components"

import { withFauxDOM } from "react-faux-dom"

import { renderHexJSON } from "d3-hexjson"
import { interpolateRgb } from "d3-interpolate"
import { scaleLinear } from "d3-scale"
import { select, selection } from "d3-selection"
import { transition } from "d3-transition"

import select_transition from "../../node_modules/d3-transition/src/selection/transition"

import SelectedConstituencyPanel from "../components/SelectedConstituencyPanel"

import constituencyData from "../data/constituency-data.json"
import hexJSON from "../data/hexmap.json"

// Kind of hack to get d3-transition working with both tree-shaking and d3 modules
// (d3-transition has side effects)
const d3 = { interpolateRgb, scaleLinear, select, selection, transition }
d3.selection.prototype.transition = select_transition

const Container = styled.div`
  padding: 0.5rem;
  font-family: "Poppins", sans-serif;
`

const Attribution = styled.strong`
  display: block;
`

const Buttons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 5px solid black;
  padding-bottom: 6px;
`

const Button = styled.button`
  margin-right: 15px;
  border: 0;
  padding: 6px;
  user-select: none;

  &:hover {
    font-weight: bold;
    text-decoration: underline;
    cursor: pointer;
  }
`

const MapAndData = styled.div`
  display: flex;
  flex-direction: row;
`

const groups = [
  { label: "🌳 Conservative", color: "blue", key: "CON" },
  { label: "🌹 Labour", color: "red", key: "LAB" },
  { label: "➡️ Brexit Party", color: "#61D8F1", key: "BRE" },
  { label: "🦜 Lib Dem", color: "orange", key: "LD" },
  { label: "🇪🇺 Remain", color: "#2c4d92", key: "Remain" },
  { label: "🏴󠁧󠁢󠁷󠁬󠁳󠁿 Plaid Cymru", color: "green", key: "PC" },
]

const margin = { top: 30, right: 30, bottom: 30, left: 60 }
const width = 500 - margin.left - margin.right
const height = 750 - margin.top - margin.bottom

const hexes = renderHexJSON(hexJSON, width, height)
const mergedHexes = hexes.map(hex => ({
  ...hex,
  ...constituencyData.constituencies.find(c => c.id === hex.key),
}))

const AllPartyCumulativeTotalsLine = props => {
  const [selectedConstituency, setSelectedConstituency] = useState(null)

  const handleClick = groupKey => {
    drawMap(groupKey)
  }

  const drawMap = groupKey => {
    const faux = props.connectFauxDOM("div", "hexMap")
    const svg = d3.select(faux).select("svg g")

    const largestImpressionValue = constituencyData.constituencies.reduce(
      (prev, current) => {
        if (!prev[groupKey] && !current[groupKey]) {
          return prev
        } else if (!prev[groupKey] && current[groupKey]) {
          return current
        } else if (prev[groupKey] && !current[groupKey]) {
          return prev
        }

        return prev[groupKey].totalImpressions >
          current[groupKey].totalImpressions
          ? prev
          : current
      }
    )[groupKey].totalImpressions

    const colorScale = d3
      .scaleLinear()
      .range(["#eee", groups.find(group => group.key === groupKey).color])
      .domain([0, largestImpressionValue])

    const hexmap = svg.selectAll("g").data(mergedHexes)

    const newHexes = hexmap
      .enter()
      .append("g")
      .attr("transform", hex => `translate(${hex.x}, ${hex.y})`)
      .append("polygon")
      .attr("points", hex => hex.points)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("fill", d => {
        if (!d) {
          return colorScale(0)
        } else if (!d[groupKey] || !d[groupKey].totalImpressions) {
          return colorScale(0)
        } else {
          return colorScale(d[groupKey].totalImpressions)
        }
      })
      .on("mouseenter", setSelectedConstituency)

    newHexes
      .merge(hexmap)
      .transition()
      .duration(450)
      .selectAll("polygon")
      .attrTween("fill", function(d) {
        let newColor

        if (!d) {
          newColor = colorScale(0)
        } else if (!d[groupKey] || !d[groupKey].totalImpressions) {
          newColor = colorScale(0)
        } else {
          newColor = colorScale(d[groupKey].totalImpressions)
        }

        return d3.interpolateRgb(this.getAttribute("fill"), newColor)
      })

    props.animateFauxDOM(450)

    // Tell parent window iFrame might have changed height
    window.top.postMessage({ HexMapFrameSize: document.body.offsetHeight }, "*")
  }

  useEffect(() => {
    window.addEventListener("message", e => {
      if (e.data !== "CheckSize") {
        return
      }

      e.source.postMessage({
        HexMapFrameSizeFrameSize: document.body.offsetHeight,
      })
    })
  }, [])

  useLayoutEffect(() => {
    window.top.postMessage({ HexMapFrameSize: document.body.offsetHeight }, "*")
  })

  useEffect(() => {
    const faux = props.connectFauxDOM("div", "hexMap")

    d3.select(faux)
      .append("svg")
      .attr("id", "hex-map-container")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // Draw map
    drawMap("CON")
  }, [])

  return (
    <Container>
      <h4>Hex Map</h4>
      <Buttons>
        {groups.map(group => (
          <Button key={group.key} onClick={() => handleClick(group.key)}>
            {group.label}
          </Button>
        ))}
      </Buttons>
      <MapAndData>
        {props.hexMap}
        <SelectedConstituencyPanel
          selectedConstituency={selectedConstituency}
        />
      </MapAndData>
      <Attribution>whotargets.me data</Attribution>
    </Container>
  )
}

export default withFauxDOM(AllPartyCumulativeTotalsLine)
