"use client";

import Inspx from "inspx";

export function InspxProvider({ children }: { children: React.ReactElement }) {
  return <Inspx>{children}</Inspx>;
}
