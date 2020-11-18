import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'
import { clientnew,clientuni} from '../apollo/client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useTimeframe } from './Application'
import {
  getTimeframe,
  getBalanceNumber
} from '../utils'

import {
  GLOBAL_TXNS,
  GLOBAL_CHART,
  ALL_POOLS,
  SNP_PAIR_DATA,
  TOP_STAKES
} from '../apollo/queries'
import weekOfYear from 'dayjs/plugin/weekOfYear'

const UPDATE = 'UPDATE'
const UPDATE_TXNS = 'UPDATE_TXNS'
const UPDATE_CHART = 'UPDATE_CHART'

const UPDATE_TOP_STAKES = 'UPDATE_TOP_STAKES'
const UPDATE_ALL_POOLS = 'UPDATE_ALL_POOLS'

// format dayjs with the libraries that we need
dayjs.extend(utc)
dayjs.extend(weekOfYear)

const GlobalDataContext = createContext()

function useGlobalDataContext() {
  return useContext(GlobalDataContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { data } = payload
      return {
        ...state,
        globalData: data
      }
    }
    case UPDATE_TXNS: {
      const { transactions } = payload
      return {
        ...state,
        transactions
      }
    }
    case UPDATE_CHART: {
      const { daily, weekly } = payload
      return {
        ...state,
        chartData: {
          daily,
          weekly
        }
      }
    }

    case UPDATE_ALL_POOLS: {
      const { allPools } = payload
      return {
        ...state,
        allPools
      }
    }


    case UPDATE_TOP_STAKES:{
      const { topStakes } = payload
      return {
        ...state,
        topStakes
      }

    }
    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, {})
  const update = useCallback(data => {
    dispatch({
      type: UPDATE,
      payload: {
        data
      }
    })
  }, [])

  const updateTransactions = useCallback(transactions => {
    dispatch({
      type: UPDATE_TXNS,
      payload: {
        transactions
      }
    })
  }, [])

  const updateChart = useCallback((daily, weekly) => {
    dispatch({
      type: UPDATE_CHART,
      payload: {
        daily,
        weekly
      }
    })
  }, [])

  const updateAllPools = useCallback(allPools => {
    dispatch({
      type: UPDATE_ALL_POOLS,
      payload: {
        allPools
      }
    })
  }, [])

  const updateTopStakes = useCallback(topStakes => {
    dispatch({
      type: UPDATE_TOP_STAKES,
      payload: {
        topStakes
      }
    })
  }, [])

  
  return (
    <GlobalDataContext.Provider
      value={useMemo(
        () => [
          state,
          {
            update,
            updateTransactions,
            updateChart,
            updateAllPools,
            updateTopStakes
          }
        ],
        [
          state,
          update,
          updateTransactions,
          updateChart,
          updateAllPools,
          updateTopStakes
        ]
      )}
    >
      {children}
    </GlobalDataContext.Provider>
  )
}


async function getGlobalData() {
  // data for each day , historic data used for % changes
  let data = {}

  try {

    let query = SNP_PAIR_DATA("0x0b41854f5d251c12b1de6a88dd4292944f04305c");
    let resultprice = await clientuni.query({
      query: query,
      fetchPolicy: 'no-cache'
    })

    data.snpPrice = new Number(resultprice.data.pairs[0].token1Price);

    /*
    // fetch the global data
    let result = await client.query({
      query: GLOBAL_DATA(),
      fetchPolicy: 'cache-first'
    })
    data = result.data.uniswapFactories[0]

    data.snpPrice = new Number(resultprice.data.pairs[0].token1Price);
    */

  } catch (e) {
    console.log(e)
  }

  return data
}

/**
 * Get historical data for volume and liquidity used in global charts
 * on main page
 * @param {*} oldestDateToFetch // start of window to fetch from
 */
const getChartData = async oldestDateToFetch => {
  let orgdata = []
  let dealdata = []
  let poolcount = 50 // temp 50 pools
  let newdata = []
  let weeklyData = []
  const utcEndTime = dayjs.utc()
  let skip = 0
  let allFound = false

  try {
    while (!allFound) {
      let result = await clientnew.query({
        query: GLOBAL_CHART,
        variables: {
          startTime: oldestDateToFetch,
          skip
        },
        fetchPolicy: 'cache-first'
      })
      skip += 1000
      orgdata = orgdata.concat(result.data.snpPoolDayDatas)
      if (result.data.snpPoolDayDatas.length < 1000) {
        allFound = true
      }
    }

    if (orgdata){
      let dayIndexSet = new Set()
      let index = 0
      const oneDay = 24 * 60 * 60
      let dayIndexArray = []
      orgdata.forEach((dayData, i) => {
        
        if (!dayIndexSet.has((orgdata[i].date / oneDay).toFixed(0))) {
          dayIndexSet.add((orgdata[i].date / oneDay).toFixed(0))
          index++
          dealdata[index-1] = new Array(poolcount)
          dealdata[index-1][dayData.poolid] = dayData
          
        }else{
          dealdata[index-1][dayData.poolid] = dayData
        }
      })

      for (var i = 0; i < poolcount; i++){
        dayIndexArray[i] = 0
      }

      for( var i = 0; i < dealdata.length;i++){
        if (dealdata[i]){
          var day = 0;
          var totalToken = 0;
          for(var j = 0;j < dealdata[i].length; j++){
              if (dealdata[i][j]){
                totalToken += getBalanceNumber(dealdata[i][j].totalToken,18);
                dayIndexArray[j] = getBalanceNumber(dealdata[i][j].totalToken,18);
                day = dealdata[i][j].date;
              }else{
                totalToken += dayIndexArray[j];
              }
          }
          newdata.push({
            date: day,
            totalToken: totalToken,
          })
        }
      }
    }

    // format weekly data for weekly sized chunks
    newdata = newdata.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1))
    let startIndexWeekly = -1
    let currentWeek = -1
    newdata.forEach((entry, i) => {
      const week = dayjs.utc(dayjs.unix(newdata[i].date)).week()
      if (week !== currentWeek) {
        currentWeek = week
        startIndexWeekly++
      }
      weeklyData[startIndexWeekly] = weeklyData[startIndexWeekly] || {}
      weeklyData[startIndexWeekly].date = newdata[i].date
      weeklyData[startIndexWeekly].weeklyVolumeUSD =
        (weeklyData[startIndexWeekly].weeklyVolumeUSD ?? 0) + newdata[i].totalToken
    })
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

  return [newdata, weeklyData]
}

/**
 * Get and format transactions for global page
 */
const getGlobalTransactions = async () => {
  let transactions = {}

  try {
    let result = await clientnew.query({
      query: GLOBAL_TXNS,
      fetchPolicy: 'cache-first'
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


const POOLS_TO_FETCH = 50

async function getAllPools() {
  try {
    let allFound = false
    let pools = []
    let skipCount = 0
    while (!allFound) {
      let result = await clientnew.query({
        query: ALL_POOLS,
        variables: {
          skip: skipCount
        },
        fetchPolicy: 'cache-first'
      })
      skipCount = skipCount + POOLS_TO_FETCH
      pools = pools.concat(result?.data?.snpMasterPools)
      if (result?.data?.snpMasterPools.length < POOLS_TO_FETCH || pools.length > POOLS_TO_FETCH) {
        allFound = true
      }
    }
    return pools
  } catch (e) {
    console.log(e)
  }
}

/**
 * Hook that fetches overview data, plus all tokens and pairs for search
 */
export function useGlobalData() {
  const [state, { update,updateAllPools }] = useGlobalDataContext()

  const data = state?.globalData

  useEffect(() => {
    async function fetchData() {
      let globalData = await getGlobalData()
      globalData && update(globalData)

      let allPools = await getAllPools()
      updateAllPools(allPools)

    }
    if (!data ) {
      fetchData()
    }
  }, [update, data,updateAllPools])

  return data || {}
}

export function useGlobalChartData() {
  const [state, { updateChart }] = useGlobalDataContext()
  const [oldestDateFetch, setOldestDateFetched] = useState()
  const [activeWindow] = useTimeframe()

  const chartDataDaily = state?.chartData?.daily
  const chartDataWeekly = state?.chartData?.weekly

  /**
   * Keep track of oldest date fetched. Used to
   * limit data fetched until its actually needed.
   * (dont fetch year long stuff unless year option selected)
   */
  useEffect(() => {
    // based on window, get starttime
    let startTime = getTimeframe(activeWindow)

    if ((activeWindow && startTime < oldestDateFetch) || !oldestDateFetch) {
      setOldestDateFetched(startTime)
    }
  }, [activeWindow, oldestDateFetch])

  /**
   * Fetch data if none fetched or older data is needed
   */
  useEffect(() => {
    async function fetchData() {
      // historical stuff for chart
      let [newChartData, newWeeklyData] = await getChartData(oldestDateFetch)
      updateChart(newChartData, newWeeklyData)
    }
    if (oldestDateFetch && !(chartDataDaily && chartDataWeekly)) {
      fetchData()
    }
  }, [chartDataDaily, chartDataWeekly, oldestDateFetch, updateChart])

  return [chartDataDaily, chartDataWeekly]
}

export function useGlobalTransactions() {
  const [state, { updateTransactions }] = useGlobalDataContext()
  const transactions = state?.transactions
  useEffect(() => {
    async function fetchData() {
      if (!transactions) {
        let txns = await getGlobalTransactions()
        updateTransactions(txns)
      }
    }
    fetchData()
  }, [updateTransactions, transactions])
  return transactions
}

export function useAllPairsInUniswap() {
  const [state] = useGlobalDataContext()
  let allPairs = state?.allPairs

  return allPairs || []
}

export function useAllPools() {
  const [state] = useGlobalDataContext()
  let allPools = state?.allPools

  return allPools || []
}


export function useTopStakes() {
  const [state, { updateTopStakes }] = useGlobalDataContext()
  let topStakes = state?.topStakes

  useEffect(() => {
    async function fetchData() {
      let topstakes = await getTopStakesData()
      updateTopStakes(topstakes)
    }
    if (!topStakes) {
      fetchData()
    }
  })
  return topStakes
}

async function getTopStakesData(){
  let topstakes = {}

  try {
    let result = await clientnew.query({
      query: TOP_STAKES,
      fetchPolicy: 'cache-first'
    })
    
    if (result?.data?.snpMasterPoolUsers){
      topstakes = result.data.snpMasterPoolUsers
    }
    
  } catch (e) {
    console.log(e)
  }

  return topstakes
}
