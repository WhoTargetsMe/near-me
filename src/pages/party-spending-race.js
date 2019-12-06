import React, { useEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"
import { Button } from "react-bootstrap"
import styled from "styled-components"
import { withFauxDOM } from "react-faux-dom"

import { ascending, descending, groups, pairs, range, rollup } from "d3-array"
import { axisTop } from "d3-axis"
import { easeLinear } from "d3-ease"
import { format, formatDefaultLocale } from "d3-format"
import { interpolateNumber } from "d3-interpolate"
import { scaleLinear, scaleBand } from "d3-scale"
import { select, selection } from "d3-selection"
import { utcFormat } from "d3-time-format"

import { transition } from "d3-transition"
import select_transition from "../../node_modules/d3-transition/src/selection/transition"

import InstallWTMAlert from "../components/InstallWTMAlert"
import Layout from "../components/layout"

import partyColors from "../utils/partyColors"

const d3 = {
  ascending,
  axisTop,
  descending,
  easeLinear,
  format,
  formatDefaultLocale,
  groups,
  interpolateNumber,
  pairs,
  range,
  rollup,
  scaleLinear,
  scaleBand,
  select,
  selection,
  transition,
  utcFormat,
}
d3.selection.prototype.transition = select_transition

const partyNames = {
  Con: "Conservative Party",
  Lab: "Labour Party",
  "Lib Dem": "Liberal Democrats",
  Brexit: "Brexit Party",
  Plaid: "Plaid Cymru",
  SNP: "SNP",
  Green: "Green Party",
}

const Title = styled.h2``

const Container = styled.div``

const ButtonContainer = styled.div`
  margin: 2rem 0;
`

const PartySpendingRace = props => {
  const data = useStaticQuery(graphql`
    query {
      allPartyDailySpendingCsv {
        nodes {
          name
          date
          value
        }
      }
    }
  `).allPartyDailySpendingCsv.nodes.map(d => ({
    ...d,
    date: new Date(d.date),
    value: parseInt(d.value, 10),
  }))

  const drawChart = async () => {
    const isMobile = document.body.scrollWidth <= 768

    const faux = props.connectFauxDOM("svg", "chart")

    const duration = 200
    const n = 7

    const barSize = isMobile ? 144 : 48
    const margin = { top: 16, right: 6, bottom: 6, left: 0 }
    const width = 1000
    const height = margin.top + barSize * n + margin.bottom

    const locale = d3.formatDefaultLocale({
      decimal: ".",
      thousands: ",",
      grouping: [3],
      currency: ["£", ""],
    })
    const formatDate = d3.utcFormat("%d %B")
    const formatNumber = locale.format("$,d")

    const svg = d3.select(faux).attr("viewBox", [0, 0, width, height])
    svg.selectAll("*").remove()
    const names = new Set(data.map(d => d.name))

    const datevalues = Array.from(
      d3.rollup(data, ([d]) => d.value, d => +d.date, d => d.name)
    )
      .map(([date, data]) => [new Date(date), data])
      .sort(([a], [b]) => d3.ascending(a, b))

    const k = 10
    const keyframes = (() => {
      const keyframesArr = []
      let ka, a, kb, b
      for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
        for (let i = 0; i < k; ++i) {
          const t = i / k
          keyframesArr.push([
            new Date(ka * (1 - t) + kb * t),
            rank(name => a.get(name) * (1 - t) + b.get(name) * t),
          ])
        }
      }
      keyframesArr.push([new Date(kb), rank(name => b.get(name))])
      return keyframesArr
    })()

    const nameframes = d3.groups(
      keyframes.flatMap(([, data]) => data),
      d => d.name
    )

    function textTween(a, b) {
      const i = d3.interpolateNumber(a, b)
      return function(t) {
        this.textContent = formatNumber(i(t))
      }
    }

    const x = d3.scaleLinear([0, 1], [margin.left, width - margin.right])

    const y = d3
      .scaleBand()
      .domain(d3.range(n + 1))
      .rangeRound([margin.top, margin.top + barSize * (n + 1 + 0.1)])
      .padding(0.1)

    function rank(value) {
      const data = Array.from(names, name => ({
        name,
        value: value(name) || 0,
      })).sort((a, b) => d3.descending(a.value, b.value))
      for (let i = 0; i < data.length; ++i) {
        data[i].rank = Math.min(n, i)
      }
      return data
    }

    const prev = new Map(
      nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a]))
    )

    const next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)))

    function bars(svg) {
      let bar = svg
        .append("g")
        .attr("fill-opacity", 0.7)
        .selectAll("rect")

      return ([date, data], transition) =>
        (bar = bar
          .data(data.slice(0, n), d => d.name)
          .join(
            enter =>
              enter
                .append("rect")
                .attr("fill", d => partyColors[d.name])
                .attr("height", y.bandwidth())
                .attr("x", x(0))
                .attr("y", d => y((prev.get(d) || d).rank))
                .attr("width", d => x((prev.get(d) || d).value) - x(0)),
            update => update,
            exit =>
              exit
                .transition(transition)
                .remove()
                .attr("y", d => y((next.get(d) || d).rank))
                .attr("width", d => x((next.get(d) || d).value) - x(0))
          )
          .call(bar =>
            bar
              .transition(transition)
              .attr("y", d => y(d.rank))
              .attr("width", d => x(d.value) - x(0))
          ))
    }

    function axis(svg) {
      const g = svg.append("g").attr("transform", `translate(0,${margin.top})`)

      const axis = d3
        .axisTop(x)
        .ticks(width / 160)
        .tickSizeOuter(0)
        .tickSizeInner(-barSize * (n + y.padding()))
        .tickFormat(locale.format("$,d"))

      return (_, transition) => {
        g.transition(transition).call(axis)
        g.select(".tick:first-of-type text").remove()
        g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white")
        g.select(".domain").remove()
      }
    }

    function labels(svg) {
      let label = svg
        .append("g")
        .attr("text-anchor", "end")
        .selectAll("text")

      return ([date, data], transition) =>
        (label = label
          .data(data.slice(0, n), d => d.name)
          .join(
            enter => {
              const elements = enter
                .append("text")
                .attr(
                  "transform",
                  d =>
                    `translate(${x((prev.get(d) || d).value)},${y(
                      (prev.get(d) || d).rank
                    )})`
                )
                .attr("y", y.bandwidth() / 2)
                .attr("x", -6)
                .attr("dy", "-0.25em")
                .attr("font-size", isMobile ? 36 : 16)

              elements.call(text =>
                text.append("tspan").text(d => partyNames[d.name])
              )

              elements.call(text =>
                text
                  .append("tspan")
                  .attr("class", "value")
                  .attr("font-family", "monospace")
                  .attr("fill-opacity", 0.7)
                  .attr("font-weight", "normal")
                  .attr("x", -6)
                  .attr("dy", "1.15em")
              )

              return elements
            },
            update => update,
            exit =>
              exit
                .transition(transition)
                .remove()
                .attr(
                  "transform",
                  d =>
                    `translate(${x((next.get(d) || d).value)},${y(
                      (next.get(d) || d).rank
                    )})`
                )
                .call(g =>
                  g
                    .select("tspan.value")
                    .tween("text", d =>
                      textTween(d.value, (next.get(d) || d).value)
                    )
                )
          )
          .call(bar =>
            bar
              .transition(transition)
              .attr("transform", d => {
                const xValue = Math.max(x(d.value), isMobile ? 250 : 120)
                return `translate(${xValue},${y(d.rank)})`
              })
              .call(g =>
                g
                  .select("tspan.value")
                  .tween("text", d =>
                    textTween((prev.get(d) || d).value, d.value)
                  )
              )
          ))
    }

    function ticker(svg) {
      const now = svg
        .append("text")
        .attr("fontSize", `${36}px`)
        .attr("text-anchor", "end")
        .attr("x", width - 6)
        .attr("y", margin.top + barSize * (n - 0.45))
        .attr("dy", "0.32em")
        .text(formatDate(keyframes[0][0]))

      return ([date], transition) => {
        transition.end().then(() => now.text(formatDate(date)))
      }
    }

    const updateBars = bars(svg)
    const updateAxis = axis(svg)
    const updateLabels = labels(svg)
    const updateTicker = ticker(svg)

    for (const keyframe of keyframes) {
      const transition = svg
        .transition()
        .duration(duration)
        .ease(d3.easeLinear)

      // Extract the top bar’s value.
      x.domain([0, keyframe[1][0].value])

      updateAxis(keyframe, transition)
      updateBars(keyframe, transition)
      updateLabels(keyframe, transition)
      updateTicker(keyframe, transition)

      await transition.end()
      props.animateFauxDOM(duration)
    }
  }

  useEffect(() => {
    drawChart()
  }, [])

  return (
    <Layout>
      <Title>Party Spending Race During #GE2019</Title>
      <Container>
        {props.chart}
        <ButtonContainer>
          <Button onClick={drawChart}>
            <span role="img" aria-label="replay">
              🔄
            </span>{" "}
            Replay
          </Button>
        </ButtonContainer>
      </Container>
      <InstallWTMAlert />
    </Layout>
  )
}

export default withFauxDOM(PartySpendingRace)
