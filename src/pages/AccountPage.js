import React, {  useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { useUserTransactions } from '../contexts/User'
import TxnList from '../components/TxnList'
import Panel from '../components/Panel'
import { getDisplayBalance } from '../utils'
import  { AutoRow, RowBetween } from '../components/Row'
import { AutoColumn } from '../components/Column'
import { TYPE } from '../Theme'
import { PageWrapper, ContentWrapper, StyledIcon } from '../components'
import { Bookmark } from 'react-feather'
import Link from '../components/Link'
import { BasicLink } from '../components/Link'
import { useMedia } from 'react-use'

const AccountWrapper = styled.div`
  background-color: rgba(255, 255, 255, 0.2);
  padding: 6px 16px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Header = styled.div``

const DashboardWrapper = styled.div`
  width: 100%;
`


function AccountPage({ account }) {
  // get data for this account
  const transactions = useUserTransactions(account)

  // get data for user stats
  const transactionCount = transactions?.burns?.length + transactions?.mints?.length

  // get derived totals
  let totalAdd = useMemo(() => {
    return transactions?.mints
      ? transactions?.mints.reduce((total, mint) => {
          return total + parseFloat(mint.amount)
        }, 0)
      : 0
  }, [transactions])


  let totalRemove = useMemo(() => {
    return transactions?.burns
      ? transactions?.burns.reduce((total, burn) => {
          return total + parseFloat(burn.amount)
        }, 0)
      : 0
  }, [transactions])

  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0
    })
  }, [])

  const below600 = useMedia('(max-width: 600px)')

  return (
    <PageWrapper>
      <ContentWrapper>
        <RowBetween>
          <TYPE.body>
            <BasicLink to="/accounts">{'Accounts '}</BasicLink>→{' '}
            <Link lineHeight={'145.23%'} href={'https://etherscan.io/address/' + account} target="_blank">
              {' '}
              {account?.slice(0, 42)}{' '}
            </Link>
          </TYPE.body>
        </RowBetween>
        <Header>
          <RowBetween>
            <span>
              <TYPE.header fontSize={24}>{account?.slice(0, 6) + '...' + account?.slice(38, 42)}</TYPE.header>
              <Link lineHeight={'145.23%'} href={'https://etherscan.io/address/' + account} target="_blank">
                <TYPE.main fontSize={14}>View on Etherscan</TYPE.main>
              </Link>
            </span>
            <AccountWrapper>
              <StyledIcon>
                <Bookmark style={{ opacity: 0.4 }} />
              </StyledIcon>
            </AccountWrapper>
          </RowBetween>
        </Header>
        <DashboardWrapper>          
          <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '3rem' }}>
            Transactions
          </TYPE.main>{' '}
          <Panel
            style={{
              marginTop: '1.5rem'
            }}
          >
            <TxnList transactions={transactions} />
          </Panel>
          <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '3rem' }}>
            Wallet Stats
          </TYPE.main>{' '}
          <Panel
            style={{
              marginTop: '1.5rem'
            }}
          >
            <AutoRow gap="20px">
              <AutoColumn gap="8px">
                <TYPE.header fontSize={24}>{totalAdd ? getDisplayBalance(totalAdd, 18) : '-'}</TYPE.header>
                <TYPE.main>Total Add</TYPE.main>
              </AutoColumn>
              <AutoColumn gap="8px">
                <TYPE.header fontSize={24}>
                  {totalRemove ? getDisplayBalance(totalRemove, 18) : '-'}
                </TYPE.header>
                <TYPE.main>Total Remove</TYPE.main>
              </AutoColumn>
              <AutoColumn gap="8px">
                <TYPE.header fontSize={24}>{transactionCount ? transactionCount : '-'}</TYPE.header>
                <TYPE.main>Total Transactions</TYPE.main>
              </AutoColumn>
            </AutoRow>
          </Panel>
        </DashboardWrapper>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default AccountPage
