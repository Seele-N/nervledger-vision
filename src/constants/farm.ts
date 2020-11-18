import { Farm } from "./types";
import seelenicon from "../assets/seelen.png";

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
  },
];

export const getFarm = (id: string): Farm => {
  const farm = stakePools.find((farm) => farm.id === id);
  return farm;
};

export const getFarms = (): Farm[] => {
  return stakePools;
};
