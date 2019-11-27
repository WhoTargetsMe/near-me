import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import styled from "styled-components"
import { Alert } from "react-bootstrap"

import InstallWTMCTA from "./InstallWTMCTA"

const Container = styled.div`
  .alert p {
    margin-bottom: 2rem;
  }
`

const PartyNames = {
  C: "The Conservative Party",
  DUP: "The Democratic Unionist Party",
  Ind: "an independent",
  Lab: "The Labour Party",
  LD: "The Liberal Democrats",
  "Lib Dem": "The Liberal Democrats",
  SF: "Sinn Féin",
  SNP: "The Scottish National Party",
}

const MarginalAlert = props => {
  const marginal = useStaticQuery(graphql`
    query {
      allMarginalsCsv {
        edges {
          node {
            Code
            Constituency
            Majority
            Majority_Party
            Runner_up_party
            Party
          }
        }
      }
    }
  `).allMarginalsCsv.edges.find(
    d => d.node.Code === props.selectedConstituency.key
  )

  if (!marginal || !marginal.node) {
    return null
  }

  const { Constituency, Majority, Majority_Party } = marginal.node

  return (
    <Container>
      <Alert bsStyle="warning">
        <p>
          {`${Constituency} is a marginal seat. At the last election `}{" "}
          <strong>{PartyNames[Majority_Party] || Majority_Party}</strong>
          {` won here by just `}
          <strong>
            {Majority}
            {` votes.`}
          </strong>
        </p>
        <p>We need your help. Get involved — download our browser extension.</p>
        <InstallWTMCTA horizontal />
      </Alert>
    </Container>
  )
}

export default MarginalAlert
