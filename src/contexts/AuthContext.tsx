import React, { createContext, useContext, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { User, AuthContextType, InternalUser } from "@/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 Load users from localStorage or Excel
  useEffect(() => {
    const storedUser = localStorage.getItem("calllogger_user");
    const storedUsers = localStorage.getItem("calllogger_users");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
      setIsLoading(false);
      return;
    }

    // Load from public Excel file
    fetch("/login_users.xlsx")
      .then(res => res.arrayBuffer())
      .then(data => {
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsedUsers = XLSX.utils.sheet_to_json<InternalUser>(sheet);

        setUsers(parsedUsers);
        localStorage.setItem("calllogger_users", JSON.stringify(parsedUsers));
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load users Excel:", err);
        setIsLoading(false);
      });
  }, []);

  // 🔐 Login
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = users.find(
      u => u.email === email && u.password === password
    );

    if (!foundUser) {
      setIsLoading(false);
      return false;
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem(
      "calllogger_user",
      JSON.stringify(userWithoutPassword)
    );

    setIsLoading(false);
    return true;
  };

  // 🚪 Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("calllogger_user");
  };

  // 👤 Admin: Add user
  const addUser = (newUser: InternalUser) => {
    const updated = [...users, newUser];
    setUsers(updated);
    localStorage.setItem("calllogger_users", JSON.stringify(updated));
  };

  // 🔑 Admin: Update password
  const updateUserPassword = (email: string, password: string) => {
    const updated = users.map(u =>
      u.email === email ? { ...u, password } : u
    );
    setUsers(updated);
    localStorage.setItem("calllogger_users", JSON.stringify(updated));
  };

  // 🗑️ Admin: Delete user
  const deleteUser = (email: string) => {
    const updated = users.filter(u => u.email !== email);
    setUsers(updated);
    localStorage.setItem("calllogger_users", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        users,
        addUser,
        updateUserPassword,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
