import React, { useEffect, useState } from "react"

import Layout from "../components/layout"

const IndexPage = () => {
  const [topAdvertisersHeight, setTopAdvertisersHeight] = useState(0)
  const [cumulativeTotalsHeight, setCumulativeTotalsHeight] = useState(0)
  const [hexMapHeight, setHexMapHeight] = useState(0)

  useEffect(
    () =>
      window.addEventListener("message", e => {
        if (e.data.FrameSize) {
          setTopAdvertisersHeight(e.data.FrameSize)
        } else if (e.data.CumulativeTotalsFrameSize) {
          setCumulativeTotalsHeight(e.data.CumulativeTotalsFrameSize)
        } else if (e.data.HexMapFrameSize) {
          setHexMapHeight(e.data.HexMapFrameSize)
        }
      }),
    []
  )

  return (
    <Layout>
      <iframe
        id="hex-map"
        title="Hex Map"
        src="/hex-map"
        style={{
          border: 0,
          width: "100%",
          height: hexMapHeight,
          overflow: "hidden",
        }}
      />
      <iframe
        id="top-advertisers-table"
        title="Top Advertisers"
        src="/top-advertisers-table"
        style={{
          border: 0,
          width: "100%",
          height: topAdvertisersHeight,
          overflow: "hidden",
        }}
      />
      <iframe
        id="all-party-cumulative-totals-line"
        title="Cumulative Spending Totals"
        src="/all-party-cumulative-totals-line"
        style={{
          border: 0,
          width: "100%",
          height: cumulativeTotalsHeight,
          overflow: "hidden",
        }}
      />
    </Layout>
  )
}

export default IndexPage
