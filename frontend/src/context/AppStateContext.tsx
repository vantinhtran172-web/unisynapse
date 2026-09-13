"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, UserProfile, TaskItem, DocumentItem, LedgerEntry } from "../lib/api";

interface AppStateContextType {
  user: UserProfile | null;
  unipoints: number;
  reputation: number;
  tasks: TaskItem[];
  documents: DocumentItem[];
  ledger: LedgerEntry[];
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  refreshState: () => Promise<void>;
  submitTask: (taskId: string, label: string) => Promise<any>;
  uploadDocument: (file: File) => Promise<any>;
  setWalletAddress: (address: string) => Promise<void>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [unipoints, setUnipoints] = useState<number>(0);
  const [reputation, setReputation] = useState<number>(100);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const refreshState = useCallback(async () => {
    try {
      const [u, t, d, l] = await Promise.all([
        api.getMe().catch(() => null),
        api.getOpenTasks().catch(() => []),
        api.getDocuments().catch(() => []),
        api.getLedger().catch(() => []),
      ]);

      if (u) {
        setUser(u);
        setUnipoints(u.unipoints);
        setReputation(u.reputation);
      }
      setTasks(t);
      setDocuments(d);
      setLedger(l);
    } catch (err) {
      console.error("Error loading app state:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshState();
    // Poll every 10 seconds for real-time peer votes/consensus
    const interval = setInterval(refreshState, 10000);
    return () => clearInterval(interval);
  }, [refreshState]);

  const setWalletAddress = async (address: string) => {
    try {
      const res = await api.connectWallet(address);
      if (res.user) {
        setUser(res.user);
        setUnipoints(res.user.unipoints);
        setReputation(res.user.reputation);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitTask = async (taskId: string, label: string) => {
    const res = await api.submitTask(taskId, label);
    await refreshState();
    return res;
  };

  const uploadDocument = async (file: File) => {
    const res = await api.uploadDocument(file, true);
    await refreshState();
    return res;
  };


  return (
    <AppStateContext.Provider
      value={{
        user,
        unipoints,
        reputation,
        tasks,
        documents,
        ledger,
        loading,
        activeTab,
        setActiveTab,
        refreshState,
        submitTask,
        uploadDocument,
        setWalletAddress,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
