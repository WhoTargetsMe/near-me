import React, { useEffect, useLayoutEffect, useState } from "react"
import styled from "styled-components"
import { DropdownButton, MenuItem } from "react-bootstrap"
import { Typeahead } from "react-bootstrap-typeahead"
import { withFauxDOM } from "react-faux-dom"

import { max } from "d3-array"
import { renderHexJSON } from "d3-hexjson"
import { interpolateRgb } from "d3-interpolate"
import { scaleLinear } from "d3-scale"
import { select, selection } from "d3-selection"
import { transition } from "d3-transition"
import select_transition from "../../node_modules/d3-transition/src/selection/transition"

import Layout from "../components/layout"
import SelectedConstituencyPanel from "../components/SelectedConstituencyPanel"

import constituencyData from "../data/constituency-data.json"
import hexJSON from "../data/hexmap.json"

// Kind of hack to get d3-transition working with both tree-shaking and d3 modules
// (d3-transition has side effects)
const d3 = {
  interpolateRgb,
  max,
  scaleLinear,
  select,
  selection,
  transition,
}
d3.selection.prototype.transition = select_transition

const Container = styled.div`
  padding: 0.5rem;
  font-family: "Poppins", sans-serif;

  svg {
    max-width: 100%;
  }

  polygon {
    cursor: pointer;
  }

  .selectedHex {
    pointer-events: none;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 0.8;
      fill: deeppink;
    }
    100% {
      transform: scale(5);
      opacity: 0;
      fill: deeppink;
    }
  }

  .pulse {
    animation: pulse 2s linear infinite;
  }
`

const Attribution = styled.strong`
  display: block;
`

const MapAndData = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1 0 auto;
  position: relative;
  margin-top: 3rem;
`

const MapContainer = styled.div`
  flex: 1 0 auto;
`

const StyledDropdownButton = styled(DropdownButton)`
  & + .dropdown-menu {
    width: 100%;
  }
`

const SidePanelContainer = styled.div`
  width: 100%;
  max-width: 400px;
  font-family: "Poppins", sans-serif;
  background-color: white;

  @media (max-width: 768px) {
    position: absolute;
    top: 10rem;
    right: 0;
    bottom: 0;
    left: 0;
    visibility: ${props => (props.isVisible ? "visible" : "hidden")};
    max-width: none;
  }
`

const MobileTypeahead = styled(Typeahead)`
  display: block;
  margin-top: 1rem;

  @media (min-width: 768px) {
    display: none;
  }
`

const NotMobileTypeahead = styled(Typeahead)`
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`

const groups = [
  { label: "All", color: "black", key: "ALL", titleLabel: "all" },
  {
    label: "Conservative",
    color: "blue",
    key: "CON",
    titleLabel: "Conservative Party",
  },
  { label: "Labour", color: "red", key: "LAB", titleLabel: "Labour Party" },
  {
    label: "Liberal Democrats",
    color: "orange",
    key: "LD",
    titleLabel: "Liberal Democrats",
  },
  { label: "SNP", color: "navy", key: "SNP", titleLabel: "SNP" },
  {
    label: "Plaid Cymru",
    color: "green",
    key: "PC",
    titleLabel: "Plaid Cymru",
  },
  {
    label: "Green Party",
    color: "green",
    key: "Gre",
    titleLabel: "Green Party",
  },
  {
    label: "Brexit Party",
    color: "#61D8F1",
    key: "BRE",
    titleLabel: "Brexit Party",
  },
]

const margin = { top: 30, right: 30, bottom: 30, left: 60 }
const width = 500 - margin.left - margin.right
const height = 750 - margin.top - margin.bottom

const hexes = renderHexJSON(hexJSON, width, height)
const mergedHexes = hexes
  .map(hex => ({
    ...hex,
    ...constituencyData.constituencies.find(c => c.id === hex.key),
  }))

  .map(mergedHex => {
    const match = constituencyData.constituencies.find(
      c => c.id === mergedHex.key
    )

    if (!match) {
      return mergedHex
    }

    return {
      ...mergedHex,
      ALL: {
        totalImpressions: Object.keys(match)
          .filter(key => key !== "id")
          .reduce((prev, key) => {
            const match = constituencyData.constituencies.find(
              c => c.id === mergedHex.key
            )
            if (!match || !match[key] || !match[key].totalImpressions) {
              return prev
            }

            return prev + match[key].totalImpressions
          }, 0),
      },
    }
  })

const HexMap = props => {
  const [selectedConstituency, setSelectedConstituency] = useState(null)
  const [selectedGroupKey, setSelectedGroupKey] = useState("ALL")

  const drawMap = groupKey => {
    const faux = props.connectFauxDOM("div", "hexMap")
    const fullMapG = d3.select(faux).select("svg g.fullMap")

    const largestImpressionValue = d3.max(mergedHexes, d => {
      return d && d[groupKey] && d[groupKey].totalImpressions
    })

    const colorScale = d3
      .scaleLinear()
      .range(["#eee", groups.find(group => group.key === groupKey).color])
      .domain([0, largestImpressionValue])

    const hexmap = fullMapG.selectAll("g").data(mergedHexes)

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
      .on("mousedown", setSelectedConstituency)

    newHexes
      .merge(hexmap)
      .transition()
      .duration(450)
      .selectAll("polygon")
      .filter(d => {
        if (selectedConstituency) {
          return d.key !== selectedConstituency.key
        } else {
          return true
        }
      })
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

  const drawSelectedConstituency = () => {
    const faux = props.connectFauxDOM("div", "hexMap")
    const selectedHexG = d3.select(faux).select("svg g.selectedHex")

    const selectedHex =
      selectedConstituency &&
      mergedHexes.find(mergedHex => mergedHex.key === selectedConstituency.key)

    const selectedHexData =
      selectedHex === null || selectedHex === undefined ? [] : [selectedHex]
    const selected = selectedHexG.selectAll("g").data(selectedHexData)

    const newlySelected = selected
      .enter()
      .append("g")
      .attr("transform", hex => `translate(${hex.x}, ${hex.y})`)
      .append("polygon")
      .attr("class", "pulse")
      .attr("points", hex => hex.points)

    newlySelected
      .merge(selected)
      .attr("transform", hex => `translate(${hex.x}, ${hex.y})`)
      .selectAll("polygon")
      .attr("class", "pulse")

    newlySelected
      .exit()
      .selectAll("polygon")
      .attr("class", "")

    props.drawFauxDOM()
  }

  useLayoutEffect(() => {
    window.top.postMessage({ HexMapFrameSize: document.body.offsetHeight }, "*")
  })

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

  useEffect(() => {
    const faux = props.connectFauxDOM("div", "hexMap")

    const svg = d3
      .select(faux)
      .append("svg")
      .attr("id", "hex-map-container")
      .attr(
        "viewBox",
        `0 0 ${width + margin.left + margin.right} ${height +
          margin.top +
          margin.bottom}`
      )

    svg
      .append("g")
      .attr("class", "fullMap")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    svg
      .append("g")
      .attr("class", "selectedHex")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // Draw map
    drawMap("ALL")
  }, [])

  useEffect(() => {
    drawMap(selectedGroupKey)
  }, [selectedGroupKey])

  useEffect(() => {
    drawSelectedConstituency()
  }, [selectedConstituency])

  const handleConstituencyChange = constituency => {
    setSelectedConstituency(constituency[0])
  }

  const handleSelectChange = groupKey => {
    setSelectedGroupKey(groupKey)
  }

  return (
    <Layout>
      <Container>
        <h4>
          {`Showing ${
            groups.find(group => group.key === selectedGroupKey).titleLabel
          } advert impressions per
          constituency`}
        </h4>
        <MapAndData>
          <MapContainer>
            <StyledDropdownButton
              id="group-dropdown"
              title="Show advertising intensity by political group"
              bsRole="toggle"
              key={selectedConstituency ? selectedConstituency.key : "ALL"}
              onSelect={handleSelectChange}
            >
              {groups.map(group => (
                <MenuItem
                  active={
                    selectedConstituency &&
                    selectedConstituency.key === group.key
                  }
                  eventKey={group.key}
                  key={group.key}
                >
                  {group.label}
                </MenuItem>
              ))}
            </StyledDropdownButton>
            <MobileTypeahead
              id="search-constituencies-mobile"
              placeholder="Search constituencies"
              options={mergedHexes}
              onChange={handleConstituencyChange}
              labelKey={option => option.n}
            />
            {props.hexMap}
          </MapContainer>
          <SidePanelContainer isVisible={!!selectedConstituency}>
            <NotMobileTypeahead
              autoFocus
              id="search-constituencies"
              placeholder="Search constituencies"
              options={mergedHexes}
              onChange={handleConstituencyChange}
              labelKey={option => option.n}
            />
            <SelectedConstituencyPanel
              selectedConstituency={selectedConstituency}
              onUnselectConstituency={() => setSelectedConstituency(null)}
            />
          </SidePanelContainer>
        </MapAndData>
        <Attribution>whotargets.me data</Attribution>
      </Container>
    </Layout>
  )
}

export default withFauxDOM(HexMap)
