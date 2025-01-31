import React, { useState } from "react"
import { graphql, useStaticQuery } from "gatsby"
import { Button, ButtonGroup, Glyphicon, Table } from "react-bootstrap"
import styled from "styled-components"

import InstallWTMAlert from "../components/InstallWTMAlert"
import InstallWTMCTA from "../components/InstallWTMCTA"
import Layout from "../components/layout"
import LeaderboardExtraData from "../components/LeaderboardExtraData"

import constituencyData from "../data/constituency-data.json"
import userCounts from "../data/users-by-constituency.json"
import partyColors from "../utils/partyColors"

const Title = styled.h2`
  margin-bottom: 0;
`

const SubTitle = styled.h3`
  margin-top: 5px;
  margin-bottom: 20px;
  font-size: 20px;
`

const TableContainer = styled.div`
  margin-bottom: 2rem;
  max-height: 80rem;
  overflow-y: auto;
`

const StyledTable = styled(Table)`
  max-height: 60rem;
  text-align: center;

  th {
    text-transform: uppercase;
    text-align: center;
    color: #666;
  }

  tr {
    cursor: pointer;
  }
`

const data = constituencyData.constituencies
  .filter(constituency => {
    const match = userCounts.find(d => d.geoid === constituency.id)
    return match.count >= 5
  })
  .map(constituency => ({
    ...constituency,
    ALL: {
      // Add party values together under ALL
      avgPerUserPerCampaignPeriod: Object.keys(constituency)
        .filter(key => key !== "id")
        .reduce((prev, key) => {
          return prev + constituency[key].avgPerUserPerCampaignPeriod
        }, 0),

      lastweek: Object.keys(constituency)
        .filter(key => key !== "id")
        .reduce((prev, key) => {
          return prev + constituency[key].lastweek
        }, 0),

      weekbeforelast: Object.keys(constituency)
        .filter(key => key !== "id")
        .reduce((prev, key) => {
          return prev + constituency[key].weekbeforelast
        }, 0),
    },
  }))
  .map(constituency => {
    const numberOfUsersInConstituency = userCounts.find(
      c => c.geoid === constituency.id
    ).count

    return {
      ...constituency,
      ...Object.keys(constituency)
        .filter(d => d !== "id")
        .reduce((prev, key) => {
          return {
            ...prev,
            [key]: {
              avgPerUserPerCampaignPeriod:
                constituency[key].avgPerUserPerCampaignPeriod /
                numberOfUsersInConstituency,

              lastweek:
                (constituency[key].lastweek || 0) / numberOfUsersInConstituency,

              weekbeforelast:
                (constituency[key].weekbeforelast || 0) /
                numberOfUsersInConstituency,
            },
          }
        }, {}),
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
  margin: 3rem 0 1rem 0;
  padding: 0 10px;
`

const StyledButton = styled(Button)`
  &.btn {
    margin-bottom: 1rem;
  }
`

const NoChangeIcon = styled(Glyphicon)`
  color: #aaa;
`

const TrendingUpIcon = styled(Glyphicon)`
  transform: rotate(-45deg);
  color: green;
`

const TrendingDownIcon = styled(Glyphicon)`
  transform: rotate(45deg);
  color: red;
`

const DataDisclaimer = styled.div`
  margin-bottom: 3rem;

  strong {
    display: block;
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
  const [selectedConstituency, setSelectedConstituency] = useState(null)

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

  // Concatenate data
  const mergedData = data.map(constituency => {
    return {
      ...constituency,
      ...majorityData.find(d => d.node.Code === constituency.id),
    }
  })

  const sortedData = mergedData
    .filter(d => !!d[filter])
    .sort(
      (a, b) =>
        b[filter].avgPerUserPerCampaignPeriod -
        a[filter].avgPerUserPerCampaignPeriod
    )
    .slice(0, 100)

  const handleTableRowClick = constituency => {
    if (selectedConstituency && selectedConstituency.id === constituency.id) {
      setSelectedConstituency(null)
      return
    }

    setSelectedConstituency(constituency)
  }

  const renderNoData = () => (
    <NoDataContainer>
      <p>
        We need more data about the{" "}
        {parties.find(party => party.filter === filter).label}.
      </p>
      <InstallWTMCTA />
    </NoDataContainer>
  )

  const renderTrend = constituency => {
    if (constituency[filter].weekbeforelast > constituency[filter].lastweek) {
      return <TrendingUpIcon glyph="arrow-right" title="Trending up" />
    } else if (
      constituency[filter].weekbeforelast < constituency[filter].lastweek
    ) {
      return <TrendingDownIcon glyph="arrow-right" title="Trending down" />
    }

    return <NoChangeIcon glyph="arrow-right" title="No change" />
  }

  const renderExtraDataRow = constituency => {
    return (
      <td colSpan="100%">
        <LeaderboardExtraData selectedConstituency={selectedConstituency} />
      </td>
    )
  }

  const renderTable = () => (
    <>
      <TableContainer>
        <StyledTable hover>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Constituency</th>
              <th>Avg. Ads per User *</th>
              <th>Trend ** </th>
              <th>2017 Winning Party</th>
              <th>Majority</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((d, index) => (
              <React.Fragment key={d.id + filter}>
                <tr onClick={() => handleTableRowClick(d)}>
                  <td>
                    <strong>{index + 1}</strong>
                  </td>
                  <td>{d.node.Constituency}</td>
                  <td>{+d[filter].avgPerUserPerCampaignPeriod.toFixed(1)}</td>
                  <td>{renderTrend(d)}</td>
                  <td style={{ color: partyColors[d.node["Party"]] }}>
                    {d.node.Party}
                  </td>
                  <td>{d.node.Majority}</td>
                </tr>
                <tr>
                  {selectedConstituency != null &&
                  selectedConstituency.id === d.id
                    ? renderExtraDataRow(d)
                    : null}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </StyledTable>
      </TableContainer>
      <DataDisclaimer>
        <strong>
          *Average ads seen by users by constituency in the period since the GE
          campaign started
        </strong>
        <strong>**Change in average versus seven days ago</strong>
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
      <h5>Last updated: 12th December 2019</h5>
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
