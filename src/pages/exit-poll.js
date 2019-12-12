import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import styled from "styled-components"
import { Table } from "react-bootstrap"

import Layout from "../components/layout"

import constituencyData from "../data/constituency-data.json"
import hexmap from "../data/hexmap.json"

import partyNames from "../utils/partyNames"

const Container = styled.div``

const Title = styled.h2``

const SeatProjection = styled.div`
  margin-bottom: 60px;
`

const SeatCounts = styled.div`
  max-width: 180px;

  p {
    display: flex;
    justify-content: space-between;
  }
`

const TableContainer = styled.div``

const ExitPoll = () => {
  const majorityData = useStaticQuery(graphql`
    query {
      allMajorityCsv {
        edges {
          node {
            Constituency
            Code
            Party
          }
        }
      }
    }
  `).allMajorityCsv.edges

  const data = constituencyData.constituencies
    .map(constituency => {
      const parties = Object.keys(constituency).filter(d => d !== "id")

      if (!parties.length) {
        return null
      }

      const winner = parties.reduce((prev, curr) => {
        if (!prev) {
          return prev
        }

        if (
          constituency[prev].totalImpressions >
          constituency[curr].totalImpressions
        ) {
          return prev
        }

        return curr
      })

      return {
        id: constituency.id,
        name: hexmap.hexes[constituency.id].n,
        winner,
        winningValue: constituency[winner].totalImpressions,
        incumbent: majorityData.find(
          majorityDatum => majorityDatum.node.Code === constituency.id
        ).node.Party,
      }
    })
    .filter(d => d !== null)
    .sort((a, b) => (b.name < a.name ? 1 : -1))

  const numberOfWinners = data.reduce((prev, curr) => {
    const abbr =
      curr.winner === "OTH" || curr.winner === "NI" ? "Ind" : curr.winner

    if (!prev[abbr]) {
      return {
        ...prev,
        [abbr]: 1,
      }
    }

    return {
      ...prev,
      [abbr]: prev[abbr] + 1,
    }
  }, {})

  const sortedWinners = Object.keys(numberOfWinners)
    .map(d => {
      return {
        party: d,
        seats: numberOfWinners[d],
      }
    })
    .sort((a, b) => (a.seats < b.seats ? 1 : -1))

  const renderSummary = () => {
    return (
      <SeatProjection>
        <h3>Seat Projection</h3>
        <SeatCounts>
          {sortedWinners.map(d => (
            <p key={d.party}>
              <span>{partyNames[d.party]}</span>
              <span>{d.seats}</span>
            </p>
          ))}
        </SeatCounts>
      </SeatProjection>
    )
  }

  const renderTable = () => {
    return (
      <TableContainer>
        <h3>Constituency Results</h3>
        <Table hover>
          <thead>
            <tr>
              <th>Constituency</th>
              <th>2019 Exit Poll Winner</th>
              <th>Incumbent</th>
            </tr>
          </thead>
          <tbody>
            {data.map(d => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>
                  {d.winner === "OTH" || d.winner === "NI"
                    ? "Independent"
                    : partyNames[d.winner]}
                </td>
                <td>{d.incumbent}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    )
  }

  return (
    <Layout>
      <Container>
        <Title>🇬🇧🗳 Who Targets Me 2019 Exit Poll</Title>
        {renderSummary()}
        {renderTable()}
      </Container>
    </Layout>
  )
}

export default ExitPoll
