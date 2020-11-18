import React, { useState, useEffect } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import LocalLoader from '../LocalLoader'
import utc from 'dayjs/plugin/utc'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'

import { getFarm } from '../../constants/farm'

import { CustomLink } from '../Link'
import { Divider } from '..'
import { withRouter } from 'react-router-dom'
import { formattedNum,getDisplayBalance } from '../../utils'
import { TYPE } from '../../Theme'
import DoubleTokenLogo from '../DoubleLogo'
import { RowFixed } from '../Row'

dayjs.extend(utc)

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 0.5em;
`

const Arrow = styled.div`
  color: ${({ theme }) => theme.primary1};
  opacity: ${props => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  :hover {
    cursor: pointer;
  }
`

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 40px 1fr 1fr 1fr;
  grid-template-areas: 'number name value allocPoint';
  padding: 0 4px;

  > * {
    justify-content: flex-end;
  }

  @media screen and (max-width: 1080px) {
    grid-template-columns: 40px 1fr 1fr 1fr;
    grid-template-areas: 'number name value allocPoint';
  }

  @media screen and (max-width: 600px) {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-areas: 'name value allocPoint';
  }
`

const ListWrapper = styled.div``

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text1};
  & > * {
    font-size: 14px;
  }

  @media screen and (max-width: 600px) {
    font-size: 13px;
  }
`

function PoolList({ pools, disbaleLinks, maxItems = 10 }) {
  const below600 = useMedia('(max-width: 600px)')
  const below800 = useMedia('(max-width: 800px)')

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const ITEMS_PER_PAGE = maxItems


  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [pools])

  useEffect(() => {
    if (pools) {
      let extraPages = 1
      if (Object.keys(pools).length % ITEMS_PER_PAGE === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(Object.keys(pools).length / ITEMS_PER_PAGE) + extraPages)
    }
  }, [ITEMS_PER_PAGE, pools])

  const ListItem = ({ pool, index }) => {

    const farm = getFarm(pool.id)
    return (
      <DashGrid style={{ height: '48px' }} disbaleLinks={disbaleLinks} focus={true}>
        {!below600 && (
          <DataText area="number" fontWeight="500" justifyContent="center">
            {index-1}
          </DataText>
        )}
        <DataText area="name" fontWeight="500" justifyContent="flex-start">
          <img src={farm.icon} height="40" />
          <CustomLink style={{ marginLeft: below600 ? 0 : '1rem', whiteSpace: 'nowrap' }} to={'/pool/' + pool.id}>
            {farm.name}
          </CustomLink>
        </DataText>

        
        <DataText area="amount">{getDisplayBalance(pool.balance, 18)}</DataText>
        <DataText area="allocPoint">{formattedNum(pool.allocPoint*0.01, false)}</DataText>
      </DashGrid>
    )
  }

  const lpList =
  pools &&
  pools.slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE).map((pool, index) => {
      return (
        <div key={index}>
          <ListItem key={index} index={(page - 1) * 10 + index + 1} pool={pool} />
          <Divider />
        </div>
      )
    })

  return (
    <ListWrapper>
      <DashGrid center={true} disbaleLinks={disbaleLinks} style={{ height: 'fit-content', padding: ' 0 0 0 1rem' }}>
        {!below600 && (
          <Flex alignItems="center" justifyContent="flex-start">
            <TYPE.main area="number">#</TYPE.main>
          </Flex>
        )}
        <Flex alignItems="center" justifyContent="flex-start">
          <TYPE.main area="name">Token</TYPE.main>
        </Flex>
        {/* {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <TYPE.main area="type">Type</TYPE.main>
          </Flex>
        )} */}
        <Flex alignItems="center" justifyContent="flexEnd">
          <TYPE.main area="amount">Amount</TYPE.main>
        </Flex>
        <Flex alignItems="center" justifyContent="flexEnd">
          <TYPE.main area="allocPoint">Alloc Point</TYPE.main>
        </Flex>
        
      </DashGrid>
      <Divider />
      <List p={0}>{!lpList ? <LocalLoader /> : lpList}</List>
      <PageButtons>
        <div onClick={() => setPage(page === 1 ? page : page - 1)}>
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
        <div onClick={() => setPage(page === maxPage ? page : page + 1)}>
          <Arrow faded={page === maxPage ? true : false}>→</Arrow>
        </div>
      </PageButtons>
    </ListWrapper>
  )
}

export default withRouter(PoolList)