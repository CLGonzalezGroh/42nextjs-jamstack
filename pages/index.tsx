import { useState, useEffect } from 'react'
import { Grid } from '@ui/Grid'
import { Button } from '@ui/Button'
import { Typography } from '@ui/Typography'
import { Layout } from '@components/Layout'
import { PlantCollection } from '@components/PlantCollection'
import { getPlantList } from '@api'

export default function Home() {
  const [data, setData] = useState<Plant[]>([])
  useEffect(() => {
    getPlantList({ limit: 10 }).then((dataReceived) => setData(dataReceived))
  }, [])

  return (
    <Layout>
      <PlantCollection plants={data} variant="square" />
    </Layout>
  )
}
