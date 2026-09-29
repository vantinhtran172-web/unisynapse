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
  uploadDocument: (file: File, university?: string, subject_code?: string, subject_name?: string) => Promise<DocumentUploadResponse>;
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
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const p = new URLSearchParams(window.location.search).get("tab");
        if (p) return p;
      } catch {}
    }
    return "dashboard";
  });
  const refreshGeneration = useRef(0);

  const refreshState = useCallback(async () => {
    const generation = ++refreshGeneration.current;
    setRefreshing(true);
    setError(null);
    try {
      // 1. Get session status gracefully without generating 401 network errors
      const session = await api.getSession();
      if (generation !== refreshGeneration.current) return;

      const isAuthenticated = session.authenticated && Boolean(session.user);
      setAuthRequired(!isAuthenticated);

      if (isAuthenticated && session.user) {
        setUser(session.user);
        setUnipoints(session.user.unipoints);
        setReputation(session.user.reputation);
      } else {
        setUser(null);
        setUnipoints(0);
        setReputation(0);
        setLedger([]);
      }

      // 2. Fetch public tasks and documents; only fetch ledger for authenticated users
      const requests = [
        api.getOpenTasks(),
        api.getDocuments(),
        ...(isAuthenticated ? [api.getLedger()] : []),
      ] as const;

      const results = await Promise.allSettled(requests);
      if (generation !== refreshGeneration.current) return;

      const tasksResult = results[0];
      const documentsResult = results[1];
      const ledgerResult = results[2];

      if (tasksResult && tasksResult.status === "fulfilled") {
        setTasks(Array.isArray(tasksResult.value) ? tasksResult.value : []);
      }
      if (documentsResult && documentsResult.status === "fulfilled") {
        setDocuments(Array.isArray(documentsResult.value) ? documentsResult.value : []);
      }
      if (ledgerResult && ledgerResult.status === "fulfilled") {
        setLedger(Array.isArray(ledgerResult.value) ? ledgerResult.value : []);
      }

      setLastUpdated(Date.now());
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
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  useEffect(() => {
    const isAuthPage = typeof window !== "undefined" && (
      window.location.pathname.startsWith("/dang-ky") ||
      window.location.pathname.startsWith("/dang-nhap")
    );

    const timer = window.setTimeout(() => {
      void refreshState();
    }, 0);

    // On registration / login pages, do not poll
    if (isAuthPage) {
      return () => {
        window.clearTimeout(timer);
        refreshGeneration.current += 1;
      };
    }

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

  const uploadDocument = async (file: File, university?: string, subject_code?: string, subject_name?: string) => {
    const res = await api.uploadDocument(file, true, university, subject_code, subject_name);
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
