import React, { useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { Box } from 'rebass'
import styled from 'styled-components'

import { AutoRow, RowBetween } from '../components/Row'
import { AutoColumn } from '../components/Column'
import TxnList from '../components/TxnList'
import PoolChart from '../components/PoolChart'

import { usePoolData,usePoolTransactions } from '../contexts/PoolData'

import { useMedia } from 'react-use'
import Panel from '../components/Panel'
import { formattedNum, formattedPercent } from '../utils'
import { TYPE, ThemedBackground } from '../Theme'
import { transparentize } from 'polished'

import { PageWrapper, ContentWrapper } from '../components'

import { getFarm } from '../constants/farm'


function PoolPage({poolid}) {
  // get data for lists and totals
  const transactions = usePoolTransactions(poolid)

  const poolData = usePoolData(poolid)

  let totaltoken = 0;
  if (poolData&& poolData.length>0){
    totaltoken = poolData[poolData.length -1].totalToken;
  }
  
  let baseChange = 100;
  if (poolData && poolData.length>1){
    baseChange = 100*(poolData[poolData.length -1].totalToken - poolData[poolData.length -2].totalToken)/poolData[poolData.length -2].totalToken;
  }

  const farm = getFarm(poolid)
  // breakpoints
  const below800 = useMedia('(max-width: 800px)')

  // scrolling refs

  useEffect(() => {
    document.querySelector('body').scrollTo({
      behavior: 'smooth',
      top: 0
    })
  }, [])

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={transparentize(0.8, '#705240')} />
      <ContentWrapper>
        <div>
          <AutoColumn gap="24px" style={{ paddingBottom: below800 ? '0' : '24px' }}>
            <TYPE.largeHeader>{ farm.name }</TYPE.largeHeader>
          </AutoColumn>
          {below800 && ( // mobile card
            <Box mb={20}>
              <Panel>
                <Box>
                  <AutoColumn gap="36px">
                    <AutoColumn gap="20px">
                      <RowBetween>
                        <TYPE.main>Total Staked</TYPE.main>
                        <div />
                      </RowBetween>
                      <RowBetween align="flex-end">
                        <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                          {formattedNum(totaltoken, false)}
                        </TYPE.main>
                        <TYPE.main fontSize={12}>{formattedPercent(baseChange)}</TYPE.main>
                      </RowBetween>
                    </AutoColumn>
                  </AutoColumn>
                </Box>
              </Panel>
            </Box>
          )}
          
          <AutoColumn style={{ marginTop: '6px' }} gap="24px">
            <Panel style={{ height: '100%', minHeight: '300px' }}>
              <PoolChart poolid={poolid} />
            </Panel>
          </AutoColumn>

          <span>
            <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '2rem' }}>
              Transactions
            </TYPE.main>
          </span>
          <Panel style={{ margin: '1rem 0' }}>
            <TxnList transactions={transactions} />
          </Panel>
        </div>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default withRouter(PoolPage)