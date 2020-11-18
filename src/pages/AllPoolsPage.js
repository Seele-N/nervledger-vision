import React, { useEffect } from 'react'
import 'feather-icons'

import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import {useAllPools } from '../contexts/GlobalData'
import PoolList from '../components/PoolList'

import { PageWrapper, FullWrapper } from '../components'
import { RowBetween } from '../components/Row'
import { useMedia } from 'react-use'

function AllPoolsPage() {
  const allPools = useAllPools()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const below800 = useMedia('(max-width: 800px)')

  return (
    <PageWrapper>
      <FullWrapper>
        <RowBetween>
          <TYPE.largeHeader>Top Pools</TYPE.largeHeader>
        </RowBetween>
        <Panel style={{ padding: below800 && '1rem 0 0 0 ' }}>
          <PoolList pools={allPools} />
        </Panel>
      </FullWrapper>
    </PageWrapper>
  )
}

export default AllPoolsPage
