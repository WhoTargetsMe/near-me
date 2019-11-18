import React, { useEffect, useLayoutEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"
import styled from "styled-components"

const Container = styled.div`
  padding: 0.5rem;
  overflow; hidden;
  font-family: "Poppins", sans-serif;
`

const Table = styled.table`
  border-spacing: 0 1rem;
  border-collapse: seperate;
  text-align: center;

  thead {
    text-transform: uppercase;
  }

  thead th {
    text-align: center;
  }

  tbody tr {
    margin: 0.5rem 0;
  }

  tbody tr td {
    padding: 0 1rem;
    text-align: center;
  }
`

const Attribution = styled.strong`
  display: block;
  text-align: right;
`

// Convert 123456 to £12,3456.00
const makePrettyCurrencyValue = currencyText => {
  return `£${parseFloat(currencyText)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,")}`
}

const TopAdvertisers = props => {
  const data = useStaticQuery(graphql`
    query {
      allTopAdvertisersLast7DaysCsv(limit: 30) {
        edges {
          node {
            Page_Name
            Disclaimer
            Amount_Spent__GBP_
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

      e.source.postMessage({ FrameSize: document.body.offsetHeight })
    })
  })

  useLayoutEffect(() => {
    window.top.postMessage({ FrameSize: document.body.offsetHeight }, "*")
  })

  return (
    <Container>
      <h4>Top Political Ad Spenders on Facebook</h4>
      <Table>
        <thead>
          <tr>
            <th>rank</th>
            <th>organisation</th>
            <th>spend</th>
          </tr>
        </thead>
        <tbody>
          {data.allTopAdvertisersLast7DaysCsv.edges
            .sort((a, b) => {
              return a["Amount_Spent__GBP_"] > b["Amount_Spent__GBP_"]
            })
            .map((row, i) => (
              <tr key={i}>
                <td>{`${i + 1}.`}</td>
                <td>{row.node["Page_Name"]}</td>
                <td>
                  {makePrettyCurrencyValue(row.node["Amount_Spent__GBP_"])}
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
      <Attribution>whotargets.me data</Attribution>
    </Container>
  )
}

export default TopAdvertisers
