import { PowerSyncContext } from "@powersync/react";
import { ReactNode } from "react";
import { powerSync } from "./System";

export default function SystemProvider({ children }: { children: ReactNode }) {
  return (
    <PowerSyncContext.Provider value={powerSync}>
      {children}
    </PowerSyncContext.Provider>
  );
}

