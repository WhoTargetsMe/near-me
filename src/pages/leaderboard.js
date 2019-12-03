import React, { useState } from "react"
import { graphql, useStaticQuery } from "gatsby"
import { Button, ButtonGroup, Table } from "react-bootstrap"
import styled from "styled-components"

import InstallWTMAlert from "../components/InstallWTMAlert"
import InstallWTMCTA from "../components/InstallWTMCTA"
import Layout from "../components/layout"

import constituencyData from "../data/constituency-data.json"
import userCounts from "../data/users-by-constituency.json"
import partyColors from "../utils/partyColors"

const Title = styled.h2`
  margin-bottom: 0;
`

const SubTitle = styled.h3`
  margin-top: 5px;
  margin-bottom: 20px;
`

const TableContainer = styled.div`
  margin-bottom: 2rem;
  max-height: 80rem;
  overflow-y: auto;
`

const StyledTable = styled(Table)`
  max-height: 60rem;
`

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
    const numberOfUsersInConstituency = userCounts.find(
      c => c.geoid === constituency.id
    ).count

    return {
      ...constituency,
      ALL: {
        avgPerUserPerCampaignPeriod:
          constituency.ALL.avgPerUserPerCampaignPeriod /
          numberOfUsersInConstituency,
      },
    }
  })

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
  margin-top: 3rem;
  padding: 0 10px;
`

const StyledButton = styled(Button)`
  &.btn {
    margin-bottom: 1rem;
  }
`

const DataDisclaimer = styled.div`
  margin-bottom: 3rem;
`

const parties = [
  {
    filter: "ALL",
    label: "All",
  },
  {
    filter: "CON",
    label: "Conservative Party",
    titleLabel: "the Conservative Party",
  },
  {
    filter: "LAB",
    label: "Labour Party",
    titleLabel: "the Labour Party",
  },
  {
    filter: "LD",
    label: "Liberal Democrats",
    titleLabel: "the Liberal Democrats",
  },
  {
    filter: "SNP",
    label: "SNP",
    titleLabel: "the SNP",
  },
  {
    filter: "PC",
    label: "Plaid Cymru",
    titleLabel: "Plaid Cymru",
  },
  {
    filter: "GRE",
    label: "Green Party",
    titleLabel: "the Green Party",
  },
  {
    filter: "BRE",
    label: "Brexit Party",
    titleLabel: "the Brexit Party",
  },
]

const Leaderboard = props => {
  const [filter, setFilter] = useState("ALL")

  const majorityData = useStaticQuery(graphql`
    query {
      allMajorityCsv {
        edges {
          node {
            Constituency
            Code
            Party
            Majority
          }
        }
      }
    }
  `).allMajorityCsv.edges

  // Concatenate date
  const mergedData = data.map(constituency => {
    return {
      ...constituency,
      ...majorityData.find(d => d.node.Code === constituency.id),
    }
  })

  const sortedData = mergedData
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
    <>
      <TableContainer>
        <StyledTable hover striped>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Constituency</th>
              <th>Avg. Ads per User*</th>
              <th>2017 Winning Party</th>
              <th>
                <p>Current Majority</p>
                <p>(number of votes)</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((d, index) => (
              <tr key={d.id}>
                <td>{index + 1}</td>
                <td>{d.node.Constituency}</td>
                <td>{+d[filter].avgPerUserPerCampaignPeriod.toFixed(1)}</td>
                <td style={{ color: partyColors[d.node["Party"]] }}>
                  {d.node.Party}
                </td>
                <td>{d.node.Majority}</td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </TableContainer>
      <DataDisclaimer>
        <strong>
          *Average ads seen by users by constituency in the period since the GE
          campaign started
        </strong>
      </DataDisclaimer>
    </>
  )

  const subtitleSuffix = () => {
    if (filter === "ALL") {
      return ""
    }

    return `, paid for by ${
      parties.find(party => party.filter === filter).titleLabel
    }`
  }

  return (
    <Layout>
      <Title>Leaderboard</Title>
      <SubTitle>
        Average number of political ads per user seen{subtitleSuffix()}
      </SubTitle>
      <InstallWTMAlert />
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
      <InstallWTMAlert />
    </Layout>
  )
}

export default Leaderboard
