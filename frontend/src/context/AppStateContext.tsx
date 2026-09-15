"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { api, UserProfile, TaskItem, DocumentItem, LedgerEntry, TaskSubmissionResult, DocumentUploadResponse } from "../lib/api";

interface AppStateContextType {
  user: UserProfile | null;
  unipoints: number;
  reputation: number;
  tasks: TaskItem[];
  documents: DocumentItem[];
  ledger: LedgerEntry[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  authRequired: boolean;
  lastUpdated: number | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  refreshState: () => Promise<void>;
  submitTask: (taskId: string, label: string) => Promise<TaskSubmissionResult>;
  uploadDocument: (file: File) => Promise<DocumentUploadResponse>;
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
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const refreshGeneration = useRef(0);

  const refreshState = useCallback(async () => {
    const generation = ++refreshGeneration.current;
    setRefreshing(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        api.getMe(),
        api.getOpenTasks(),
        api.getDocuments(),
        api.getLedger(),
      ]);
      if (generation !== refreshGeneration.current) return;

      const [userResult, tasksResult, documentsResult, ledgerResult] = results;
      const failures = results.filter((result) => result.status === "rejected");
      const sessionExpired = userResult.status === "rejected" && userResult.reason instanceof Error &&
        "status" in userResult.reason && userResult.reason.status === 401;
      setAuthRequired(sessionExpired);
      if (sessionExpired) {
        setUser(null);
        setUnipoints(0);
        setReputation(0);
        setTasks([]);
        setDocuments([]);
        setLedger([]);
        setLastUpdated(null);
      } else if (userResult.status === "fulfilled") {
        setUser(userResult.value);
        setUnipoints(userResult.value.unipoints);
        setReputation(userResult.value.reputation);
      }
      if (tasksResult.status === "fulfilled" && !sessionExpired) setTasks(Array.isArray(tasksResult.value) ? tasksResult.value : []);
      if (documentsResult.status === "fulfilled" && !sessionExpired) setDocuments(Array.isArray(documentsResult.value) ? documentsResult.value : []);
      if (ledgerResult.status === "fulfilled" && !sessionExpired) setLedger(Array.isArray(ledgerResult.value) ? ledgerResult.value : []);
      if (failures.length > 0 && !sessionExpired) {
        setError("Một số dữ liệu chưa tải được. Hãy thử làm mới lại.");
      } else if (!sessionExpired) {
        setLastUpdated(Date.now());
      }
    } catch (err) {
      if (generation === refreshGeneration.current) {
        setError(err instanceof Error ? err.message : "Không thể tải dữ liệu ứng dụng.");
      }
    } finally {
      if (generation === refreshGeneration.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshState();
    }, 0);
    // Poll every 10 seconds for real-time peer votes/consensus
    const interval = setInterval(() => {
      void refreshState();
    }, 10000);
    return () => {
      window.clearTimeout(timer);
      clearInterval(interval);
      refreshGeneration.current += 1;
    };
  }, [refreshState]);

  const setWalletAddress = async (address: string) => {
    void address;
    // Wallet authentication is performed by useUserProfile.verifyWallet,
    // which completes the server-issued challenge/signature flow.
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
        refreshing,
        error,
        authRequired,
        lastUpdated,
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
