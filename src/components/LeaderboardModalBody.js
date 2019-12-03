import React, { useEffect, useState } from "react"
import { graphql, useStaticQuery } from "gatsby"

import AgeBreakdown from "../components/AgeBreakdown"
import GenderBreakdown from "../components/GenderBreakdown"
import MarginalAlert from "./MarginalAlert"
import NeedMoreDataCTA from "./NeedMoreDataCTA"

import demographicData from "../data/demographic-breakdown.json"

const LeaderboardModalBody = props => {
  const [ageData, setAgeData] = useState(null)
  const [genderData, setGenderData] = useState(null)

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
  `).allMarginalsCsv.edges.find(d => {
    if (!props.selectedConstituency || !props.selectedConstituency.id) {
      return false
    }
    return d.node.Code === props.selectedConstituency.id
  })

  useEffect(() => {
    if (!props.selectedConstituency) {
      setAgeData(null)
      return
    }

    const match = demographicData.constituencies.find(
      d => d.id === props.selectedConstituency.id
    )

    if (!match) {
      setAgeData(null)
      return
    }

    if (!match || !match.impressions || !match.impressions.age) {
      setAgeData(null)
      return
    }

    setAgeData(match.impressions.age)
  }, [props.selectedConstituency])

  useEffect(() => {
    if (!props.selectedConstituency) {
      setGenderData(null)
      return
    }

    const match = demographicData.constituencies.find(
      d => d.id === props.selectedConstituency.id
    )

    if (!match || !match.impressions || !match.impressions.gender) {
      setGenderData(null)
      return
    }

    const menData = match.impressions.gender.find(g => g.param === "men")
    const womenData = match.impressions.gender.find(g => g.param === "women")

    setGenderData({
      menData: menData ? menData : null,
      womenData: womenData ? womenData : null,
    })
  }, [props.selectedConstituency])

  return (
    <div>
      {marginal ? (
        <MarginalAlert
          marginal={marginal}
          selectedConstituency={props.selectedConstituency}
        />
      ) : null}
      {genderData ? <GenderBreakdown genderData={genderData} /> : null}
      {ageData ? <AgeBreakdown data={ageData} /> : null}
      {!marginal && !genderData && !ageData && props.selectedConstituency ? (
        <NeedMoreDataCTA name={props.selectedConstituency.node.Constituency} />
      ) : null}
    </div>
  )
}

export default LeaderboardModalBody
