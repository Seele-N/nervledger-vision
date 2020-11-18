
import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'
import { clientnew } from '../apollo/client'
import {
  POOL_CHART,
  POOL_TXNS
} from '../apollo/queries'

import {
  getBalanceNumber
} from '../utils'


import dayjs from 'dayjs'

const UPDATE = 'UPDATE'
const UPDATE_CHART_DATA = 'UPDATE_CHART_DATA'
const UPDATE_POOL_TXNS = 'UPDATE_POOL_TXNS'

export function safeAccess(object, path) {
  return object
    ? path.reduce(
        (accumulator, currentValue) => (accumulator && accumulator[currentValue] ? accumulator[currentValue] : null),
        object
      )
    : null
}

const PoolDataContext = createContext()

function usePoolDataContext() {
  return useContext(PoolDataContext)
}


export function useAllPoolData() {
    const [state] = usePoolDataContext()
    return state || {}
  }

  function reducer(state, { type, payload }) {
    switch (type) {
      case UPDATE: {
        const { poolid, data } = payload
        return {
          ...state,
          [poolid]: {
            ...(safeAccess(state, [poolid]) || {}),
            ...data
          }
        }
      }
      case UPDATE_CHART_DATA: {
        const { poolid, chartData } = payload
        return {
          ...state,
          [poolid]: {
            ...(safeAccess(state, [poolid]) || {}),
            chartData
          }
        }
      }

      case UPDATE_POOL_TXNS: {
        const { poolid, transactions } = payload
        return {
          ...state,
          [poolid]: {
            ...(safeAccess(state, [poolid]) || {}),
            txns: transactions
          }
        }
      }
  
      default: {
        throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
      }
    }
  }

  export default function Provider({ children }) {
    const [state, dispatch] = useReducer(reducer, {})
  
    const update = useCallback((poolid, data) => {
      dispatch({
        type: UPDATE,
        payload: {
          poolid,
          data
        }
      })
    }, [])

    const updateChartData = useCallback((poolid, chartData) => {
      dispatch({
        type: UPDATE_CHART_DATA,
        payload: { poolid, chartData }
      })
    }, [])

    const updatePoolTxns = useCallback((poolid, transactions) => {
      dispatch({
        type: UPDATE_POOL_TXNS,
        payload: { poolid, transactions }
      })
    }, [])
  
  
    return (
      <PoolDataContext.Provider
        value={useMemo(() => [state, { update,updateChartData,updatePoolTxns }], [
          state,
          update,
          updateChartData,
          updatePoolTxns
        ])}
      >
        {children}
      </PoolDataContext.Provider>
    )
  }

  /**
 * Get most recent txns for a pool
 */
export function usePoolTransactions(poolid) {
  const [state, { updatePoolTxns }] = usePoolDataContext()
  const poolTxns = state?.[poolid]?.txns
  useEffect(() => {
    async function checkForTxns() {
      if (!poolTxns) {
        let transactions = await getPoolTransactions(poolid)
        updatePoolTxns(poolid, transactions)
      }
    }
    checkForTxns()
  }, [poolTxns, poolid, updatePoolTxns])
  return poolTxns
}

const getPoolTransactions = async poolid => {
  const transactions = {}

  try {
    let result = await clientnew.query({
      query: POOL_TXNS,
      variables: {
        poolid: poolid
      },
      fetchPolicy: 'no-cache'
    })
    transactions.mints = []
    transactions.burns = []
    result?.data?.snpPoolTransations &&
      result.data.snpPoolTransations.map(transaction => {
        if (transaction.operator == 0) {
          transactions.mints.push(transaction)
        }
        if (transaction.operator > 0) {
          transactions.burns.push(transaction)
        }
        return true
      })
  } catch (e) {
    console.log(e)
  }

  return transactions
}

  export function usePoolData(poolid) {
    const [state, { updateChartData }] = usePoolDataContext()
  
    const poolchartData = state?.[poolid]?.chartData
  
    useEffect(() => {
      async function fetchData() {
        if (!poolchartData && poolid) {
          let data = await getPoolChartData(poolid)
          if (!poolchartData){
            data && updateChartData(poolid, data)
          }
        }
      }
      fetchData()
      
    }, [poolchartData,poolid, updateChartData])
  
    return poolchartData
  }

  const getPoolChartData = async poolid => {
    
    let data = []
    let newdata = []
    const utcEndTime = dayjs.utc()
    let utcStartTime = utcEndTime.subtract(1, 'year').startOf('minute')
    let startTime = utcStartTime.unix() - 1
  
    try {
      let allFound = false
      let skip = 0
      while (!allFound) {
        let result = await clientnew.query({
          query: POOL_CHART,
          variables: {
            poolid: poolid,
            skip
          },
          fetchPolicy: 'cache-first'
        })
        skip += 1000
        data = data.concat(result.data.snpPoolDayDatas)
        if (result.data.snpPoolDayDatas.length < 1000) {
          allFound = true
        }
      }
  
    let dayIndexSet = new Set()
    let dayIndexArray = []
    const oneDay = 24 * 60 * 60
    data.forEach((dayData, i) => {
      // add the day index to the set of days
      dayIndexSet.add((data[i].date / oneDay).toFixed(0))
      dayIndexArray.push(data[i])
      newdata.push({
        date: dayData.date,
        totalToken: getBalanceNumber(dayData.totalToken,18),
      })
    })

    if (newdata[0]) {
      // fill in empty days
      let timestamp = newdata[0].date ? newdata[0].date : startTime
      let totalToken = newdata[0].totalToken
      let index = 1
      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay
        let currentDayIndex = (nextDay / oneDay).toFixed(0)
        if (!dayIndexSet.has(currentDayIndex)) {
          newdata.push({
            date: nextDay,
            totalToken: totalToken
          })
        } else {
          totalToken = getBalanceNumber(dayIndexArray[index].totalToken,18)
          index = index + 1
        }
        timestamp = nextDay
      }
    }
  
    newdata = newdata.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1))
    } catch (e) {
      console.log(e)
    }

    /*
    newdata.forEach((dayData, i) => {
      console.log("------------------")
      console.log(dayData.date)
      console.log(dayData.totalToken)
    })
    */
  
    return newdata
  }