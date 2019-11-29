import React, { useState } from "react"
import { Button, ButtonGroup, Table } from "react-bootstrap"
import styled from "styled-components"

import InstallWTMCTA from "../components/InstallWTMCTA"
import Layout from "../components/layout"

import constituencyData from "../data/constituency-data.json"
import hexmap from "../data/hexmap.json"

const data = constituencyData.constituencies
  .map(constituency => ({
    ...constituency,
    ALL: {
      // Add party values together under ALL
      avgPerUserPerCampaignPeriod: Object.keys(constituency)
        .filter(key => key !== "id")
        .reduce((prev, key) => {
          return prev + constituency[key].avgPerUserPerCampaignPeriod
        }, 0),
    },
  }))
  .map(constituency => {
    const numberOfPartiesInConstituency = Object.keys(constituency).filter(
      key => key !== "id"
    ).length

    return {
      ...constituency,
      ALL: {
        avgPerUserPerCampaignPeriod:
          constituency.ALL.avgPerUserPerCampaignPeriod /
          numberOfPartiesInConstituency,
      },
    }
  })
  .map(constituency => ({
    ...constituency,
    name: hexmap.hexes[constituency.id].n,
  }))

const NoDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 3rem;
  text-align: center;
`

const Buttons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin-top: 1rem;
  padding: 0 10px;
`

const StyledButton = styled(Button)`
  &.btn {
    margin-bottom: 1rem;
  }
`

const parties = [
  {
    filter: "ALL",
    label: "All",
  },
  {
    filter: "CON",
    label: "Conservative Party",
  },
  {
    filter: "LAB",
    label: "Labour Party",
  },
  {
    filter: "LD",
    label: "Liberal Democrats",
  },
  {
    filter: "SNP",
    label: "SNP",
  },
  {
    filter: "PC",
    label: "Plaid Cymru",
  },
  {
    filter: "GRE",
    label: "Green Party",
  },
  {
    filter: "BRE",
    label: "Brexit Party",
  },
]

const Leaderboard = props => {
  const [filter, setFilter] = useState("ALL")

  const sortedData = data
    .filter(d => !!d[filter])
    .filter(d => d[filter].avgPerUserPerCampaignPeriod >= 5)
    .sort(
      (a, b) =>
        b[filter].avgPerUserPerCampaignPeriod -
        a[filter].avgPerUserPerCampaignPeriod
    )

  const renderNoData = () => (
    <NoDataContainer>
      <p>
        We need more data about the{" "}
        {parties.find(party => party.filter === filter).label}.
      </p>
      <InstallWTMCTA />
    </NoDataContainer>
  )

  const renderTable = () => (
    <div>
      <Table hover striped>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Constituency</th>
            <th>Ad/user</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((d, index) => (
            <tr key={d.id}>
              <th>{index + 1}</th>
              <th>{d.name}</th>
              <th>{+d[filter].avgPerUserPerCampaignPeriod.toFixed(1)}</th>
            </tr>
          ))}
        </tbody>
      </Table>
      <InstallWTMCTA />
    </div>
  )

  return (
    <Layout>
      <Buttons>
        <ButtonGroup>
          {parties.map(party => (
            <StyledButton
              key={party.filter}
              active={party.filter === filter}
              onClick={() => setFilter(party.filter)}
            >
              {party.label}
            </StyledButton>
          ))}
        </ButtonGroup>
      </Buttons>
      {sortedData.length ? renderTable() : renderNoData()}
    </Layout>
  )
}

export default Leaderboard
