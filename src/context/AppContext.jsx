import { createContext, useContext, useState } from "react";

// ---------------------------------------------------------------------------
// AppContext holds the "logged-in" user and their role.
//
// GROUP INTEGRATION NOTE:
// This is a lightweight stand-in because this module was built separately.
// When merging into the full MyDuka app, delete this context and read the
// user/role from your group's real authentication context instead.
// The rest of the module only depends on: currentUser.id, currentUser.name,
// currentUser.role — keep that shape and everything works unchanged.
// ---------------------------------------------------------------------------

const AppContext = createContext(null);

// Example users. "kosh" is the sample clerk used throughout this module.
const DEMO_USERS = {
  clerk: { id: 2, name: "kosh", role: "clerk" },
  admin: { id: 1, name: "admin", role: "admin" },
};

export function AppProvider({ children }) {
  const [role, setRole] = useState("clerk");
  const currentUser = DEMO_USERS[role];

  return (
    <AppContext.Provider value={{ currentUser, role, setRole }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
