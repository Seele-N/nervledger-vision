import { Farm } from "./types";
import seelenicon from "../assets/seelen.png";
import susdticon from "../assets/susdt.png";

export const OneDay = 86400;
export const stakePools: Farm[] = [
  {
    pid: 0,
    symbol: "Seele",
    name: "Seele(2 Weeks)",
    id: "0",
    icon: seelenicon,
    lockPeriod: OneDay * 14,
    unlockPeriod: OneDay * 2,
    allocPoint: 1,
    decimals: 18,
  },
  {
    pid: 1,
    symbol: "Seele",
    name: "Seele(1 Month)",
    id: "1",
    icon: seelenicon,
    lockPeriod: OneDay * 30,
    unlockPeriod: OneDay * 4,
    allocPoint: 1.5,
    decimals: 18,
  },
  {
    pid: 2,
    symbol: "Seele",
    name: "Seele(3 Months)",
    id: "2",
    icon: seelenicon,
    lockPeriod: OneDay * 90,
    unlockPeriod: OneDay * 7,
    allocPoint: 2.5,
    decimals: 18,
  },
  {
    pid: 3,
    symbol: "Seele",
    name: "Seele(Half Year)",
    id: "3",
    icon: seelenicon,
    lockPeriod: OneDay * 180,
    unlockPeriod: OneDay * 10,
    allocPoint: 4,
    decimals: 18,
  },
  {
    pid: 4,
    symbol: "Seele",
    name: "Seele(1 Year)",
    id: "4",
    icon: seelenicon,
    lockPeriod: OneDay * 365,
    unlockPeriod: OneDay * 14,
    allocPoint: 8,
    decimals: 18,
  },
  {
    pid: 5,
    symbol: "sUSDT",
    name: "sUSDT",
    id: "5",
    icon: susdticon,
    decimals: 6,
    lockPeriod: 20,
    unlockPeriod: 0,
    allocPoint: 100,
  },
];

export const getFarm = (id: string): Farm => {
  const farm = stakePools.find((farm) => farm.id === id);
  return farm;
};

export const getFarms = (): Farm[] => {
  return stakePools;
};

export const getFarmDecimals = (id: string): Number => {
  const farm = stakePools.find((farm) => farm.id === id);
  return farm.decimals;
};
