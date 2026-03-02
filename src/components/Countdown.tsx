"use client";

import { differenceInSeconds, isAfter } from "date-fns";
import { useEffect, useState } from "react";

interface Props {
  until: Date;
}

export default function Countdown({ until }: Props) {
  const [countdown, setCountdown] = useState<string>();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = isAfter(until, now)
        ? differenceInSeconds(until, now)
        : 0;

      const days = Math.floor(difference / 60 / 60 / 24);
      const hours = Math.floor((difference / 60 / 60) % 24);
      const minutes = Math.floor((difference / 60) % 60);
      const seconds = Math.floor(difference % 60);
      let str = "";

      if (days > 0) {
        str += `${days} day${days !== 1 ? "s" : ""}, `;
      }

      if (days > 0 || hours > 0) {
        str += `${hours} hour${hours !== 1 ? "s" : ""}, `;
      }

      if (days > 0 || hours > 0 || minutes > 0) {
        str += `${minutes} minute${minutes !== 1 ? "s" : ""}${hours > 0 ? "," : ""} and `;
      }

      if (days > 0 || hours > 0 || minutes > 0 || seconds > 0) {
        str += `${seconds} second${seconds !== 1 ? "s" : ""}`;
      }

      setCountdown(str);
    }, 1000);

    return () => clearInterval(interval);
  }, [until]);

  return countdown;
}
