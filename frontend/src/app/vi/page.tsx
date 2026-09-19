"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import bs58 from "bs58";
import { Buffer } from "buffer";
import { api, LedgerEntry, BankDepositIntent, BankDepositRecord } from "@/lib/api";
import { useAppState } from "@/context/AppStateContext";
import ThemeToggle from "@/components/ThemeToggle";
import styles from "./wallet.module.css";

const DEVNET = "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG";

type Review = { sender: string; recipient: string; amount: string; lamports: bigint; fee: number };

const PRESETS = [
  { sol: "0.08", points: 80, desc: "1 lượt hỏi AI" },
  { sol: "0.24", points: 240, desc: "3 lượt hỏi AI" },
  { sol: "0.50", points: 500, desc: "6 lượt hỏi AI" },
  { sol: "1.00", points: 1000, desc: "12 lượt hỏi AI" },
];

const BANK_PRESETS = [
  { amount: 10000, points: 1000, bonus: "", desc: "12 lượt hỏi AI Luna" },
  { amount: 20000, points: 2200, bonus: "+10% Thưởng", desc: "27 lượt hỏi AI Luna" },
  { amount: 50000, points: 6000, bonus: "+20% Thưởng", desc: "75 lượt hỏi AI Luna (Hot)" },
  { amount: 100000, points: 13000, bonus: "+30% Thưởng", desc: "162 lượt hỏi AI Luna (Tiết kiệm)" },
];

const SOL_SWAP_PRESETS = [
  { amount: 10000, sol: 0.05, points: 500, bonus: "", desc: "Trải nghiệm dApp Solana" },
  { amount: 20000, sol: 0.12, points: 1100, bonus: "+20% SOL", desc: "Đủ phí gas 50+ task" },
  { amount: 50000, sol: 0.35, points: 3000, bonus: "+40% SOL (Hot)", desc: "Xác thực minh chứng & NFT" },
  { amount: 100000, sol: 0.80, points: 7000, bonus: "+60% SOL (Tiết kiệm)", desc: "Gói Web3 Hacker" },
];

function calculateBankPoints(vnd: number): number {
  if (vnd < 10000) return 0;
  const basePoints = Math.floor((vnd / 10000) * 1000);
  let bonusRate = 0;
  if (vnd >= 100000) bonusRate = 0.30;
  else if (vnd >= 50000) bonusRate = 0.20;
  else if (vnd >= 20000) bonusRate = 0.10;
  return Math.round(basePoints * (1 + bonusRate));
}

function calculateSolAmount(vnd: number): number {
  if (vnd < 10000) return 0;
  if (vnd >= 100000) return Math.round((vnd / 125000) * 1000) / 1000;
  if (vnd >= 50000) return Math.round((vnd / 142857) * 1000) / 1000;
  if (vnd >= 20000) return Math.round((vnd / 166666) * 1000) / 1000;
  return Math.round((vnd / 200000) * 1000) / 1000;
}

export default function WalletPage() {
  const router = useRouter();
  const { connection } = useConnection();
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const { refreshState, user } = useAppState();

  const [activeTab, setActiveTab] = useState<"bank" | "deposit" | "transfer" | "history">("bank");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("0.08");
  const [selectedPreset, setSelectedPreset] = useState<string | null>("0.08");

  // ACB VietQR Bank Deposit & Solana On-Ramp State
  const [bankPayoutMode, setBankPayoutMode] = useState<"sol_swap" | "unipoints">("sol_swap");
  const [customSolWallet, setCustomSolWallet] = useState<string>("");
  const [bankAmount, setBankAmount] = useState<number>(20000);
  const [bankCustomInput, setBankCustomInput] = useState<string>("20000");
  const [bankSelectedPreset, setBankSelectedPreset] = useState<number | null>(20000);
  const [bankOrder, setBankOrder] = useState<BankDepositIntent | null>(null);
  const [bankLoading, setBankLoading] = useState<boolean>(false);
  const [bankTimeLeft, setBankTimeLeft] = useState<number>(600);
  const [bankHistory, setBankHistory] = useState<BankDepositRecord[]>([]);
  const [bankHistoryLoading, setBankHistoryLoading] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [recoverySignature, setRecoverySignature] = useState("");
  const [deposit, setDeposit] = useState<{ intent_id: string; memo: string; treasury: string } | null>(null);
  const [walletAuthenticated, setWalletAuthenticated] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const recoveryKey = useRef("");

  // Load economy & initial state
  useEffect(() => {
    let active = true;

    void api.economy().then((econ) => {
      if (active && econ.treasury) {
        setRecipient(econ.treasury);
      }
    }).catch(() => {});

    void api.getMe().then((profile) => {
      if (!active) return;
      setPoints(profile.unipoints);
      if (wallet.publicKey && profile.address === wallet.publicKey.toBase58()) {
        setWalletAuthenticated(true);
      }
      recoveryKey.current = `unisynapse:deposit:${profile.id}`;
      try {
        const saved = localStorage.getItem(recoveryKey.current);
        if (saved) {
          const pending = JSON.parse(saved);
          if (
            typeof pending.signature === "string" &&
            typeof pending.deposit?.intent_id === "string" &&
            typeof pending.deposit?.treasury === "string"
          ) {
            setDeposit(pending.deposit);
            setRecipient(pending.deposit.treasury);
            setSignature(pending.signature);
            setMessage("Giao dịch nạp gần nhất đã được lưu. Bạn có thể đối soát lại bất kỳ lúc nào.");
          }
        }
      } catch {
        /* storage fallback */
      }
    }).catch(() => {});

    return () => {
      active = false;
    };
  }, [wallet.publicKey]);

  // Update balance when wallet connected
  useEffect(() => {
    if (!wallet.publicKey) {
      setBalance(null);
      setWalletAuthenticated(false);
      return;
    }
    void connection.getBalance(wallet.publicKey, "confirmed")
      .then((b) => setBalance(b))
      .catch(() => {});
  }, [wallet.publicKey, connection]);

  // Load ledger when switching to history tab
  useEffect(() => {
    if (activeTab === "history" && user) {
      loadLedger();
    }
  }, [activeTab, user]);

  async function loadLedger() {
    setLedgerLoading(true);
    try {
      const data = await api.getLedger();
      setLedger(data);
    } catch {
      /* ignore */
    } finally {
      setLedgerLoading(false);
    }
  }

  async function refreshPoints() {
    try {
      const me = await api.getMe();
      setPoints(me.unipoints);
      refreshState();
    } catch {
      /* ignore */
    }
  }

  // Load bank history
  async function loadBankHistory() {
    if (!user) return;
    setBankHistoryLoading(true);
    try {
      const history = await api.getBankDepositHistory();
      setBankHistory(history);
    } catch {
      /* ignore */
    } finally {
      setBankHistoryLoading(false);
    }
  }

  // Load bank history when user or tab changes
  useEffect(() => {
    if (user && (activeTab === "bank" || activeTab === "history")) {
      void loadBankHistory();
    }
  }, [activeTab, user]);

  // 10-Minute Countdown Timer for active VietQR
  useEffect(() => {
    if (!bankOrder || bankOrder.status !== "pending") return;

    // Calculate remaining seconds from created_at (max 600s = 10 minutes)
    const createdSec = bankOrder.created_at || Math.floor(Date.now() / 1000);
    const elapsed = Math.floor(Date.now() / 1000) - createdSec;
    const remaining = Math.max(0, Math.floor(600 - elapsed));
    setBankTimeLeft(remaining);

    if (remaining <= 0) {
      setBankOrder((prev) => (prev ? { ...prev, status: "expired" } : null));
      setMessage("⌛ Đã hết thời gian chờ thanh toán (10 phút). Mã VietQR đã bị ngắt để đảm bảo an toàn giao dịch.");
      return;
    }

    const timer = setInterval(() => {
      setBankTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setBankOrder((curr) => (curr ? { ...curr, status: "expired" } : null));
          setMessage("⌛ Đã hết thời gian chờ thanh toán (10 phút). Mã VietQR đã bị ngắt để đảm bảo an toàn giao dịch.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [bankOrder?.order_code, bankOrder?.status, bankOrder?.created_at]);

  // Polling bank deposit status when an order is pending
  useEffect(() => {
    if (!bankOrder || bankOrder.status !== "pending") return;

    const interval = setInterval(async () => {
      try {
        const check = await api.checkBankDeposit(bankOrder.order_code);
        if (check.status === "paid") {
          setBankOrder((prev) => (prev ? {
            ...prev,
            status: "paid",
            solana_signature: check.solana_signature,
            solana_explorer_url: check.solana_explorer_url,
            sol_amount: check.sol_amount,
            payout_mode: check.payout_mode,
          } : null));
          if (check.payout_mode === "sol_swap") {
            setMessage(`🎉 ĐỔI SOL THÀNH CÔNG! Đã chuyển +${check.sol_amount} SOL vào ví Phantom của bạn trên Solana Devnet.`);
          } else {
            setMessage(`🎉 Giao dịch ACB hoàn tất! Đã cộng +${check.points.toLocaleString("vi-VN")} UniPoints.`);
          }
          await refreshPoints();
          void loadBankHistory();
          clearInterval(interval);
        } else if (check.status === "expired") {
          setBankOrder((prev) => (prev ? { ...prev, status: "expired" } : null));
          setBankTimeLeft(0);
          setMessage("⌛ Đơn thanh toán đã hết hạn chờ (10 phút). Ảnh mã QR đã bị ngắt.");
          clearInterval(interval);
        }
      } catch {
        /* quiet polling retry */
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [bankOrder?.order_code, bankOrder?.status]);

  function handleSelectBankPreset(val: number) {
    setBankSelectedPreset(val);
    setBankAmount(val);
    setBankCustomInput(String(val));
    setBankOrder(null);
  }

  function handleBankCustomChange(val: string) {
    setBankCustomInput(val);
    setBankSelectedPreset(null);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setBankAmount(num);
    } else {
      setBankAmount(0);
    }
  }

  async function handleCreateBankIntent() {
    if (!user) {
      setMessage("Vui lòng đăng nhập tài khoản sinh viên trước khi thực hiện giao dịch.");
      return;
    }
    if (bankAmount < 10000) {
      setMessage("Số tiền nạp tối thiểu là 10.000 VNĐ.");
      return;
    }
    let targetWallet = customSolWallet.trim();
    if (bankPayoutMode === "sol_swap") {
      if (!targetWallet && wallet.publicKey) {
        targetWallet = wallet.publicKey.toBase58();
      }
      if (!targetWallet) {
        setMessage("Vui lòng kết nối ví Phantom hoặc nhập địa chỉ ví Solana để nhận SOL.");
        return;
      }
    }

    setBankLoading(true);
    setMessage("");
    try {
      const intent = await api.createBankDeposit(bankAmount, bankPayoutMode, targetWallet || undefined);
      setBankOrder(intent);
      setBankTimeLeft(600);
      if (bankPayoutMode === "sol_swap") {
        setMessage(`Đã tạo mã VietQR đổi ${intent.sol_amount || calculateSolAmount(bankAmount)} SOL vào ví Phantom (${targetWallet.slice(0, 4)}...${targetWallet.slice(-4)}). Quét mã để nhận SOL trong 5 giây!`);
      } else {
        setMessage(`Đã tạo mã VietQR thanh toán cho đơn ${intent.order_code}. Mã có hiệu lực trong 10 phút. Quét mã bằng app ACB hoặc bất kỳ app ngân hàng nào.`);
      }
    } catch (err) {
      setMessage((err as Error).message || "Không thể tạo mã VietQR. Vui lòng thử lại.");
    } finally {
      setBankLoading(false);
    }
  }

  // Tự động kiểm tra và đối soát giao dịch ACB (Tự động mỗi 3 giây)
  useEffect(() => {
    if (!user) return;
    let isCancelled = false;

    const pollStatus = async () => {
      try {
        if (bankOrder && bankOrder.status === "pending") {
          const res = await api.checkBankDeposit(bankOrder.order_code);
          if (isCancelled) return;
          if (res.status === "paid") {
            setBankOrder((prev) => (prev ? {
              ...prev,
              status: "paid",
              solana_signature: res.solana_signature,
              solana_explorer_url: res.solana_explorer_url,
              sol_amount: res.sol_amount,
              payout_mode: res.payout_mode,
            } : null));
            if (res.payout_mode === "sol_swap") {
              setMessage(`🎉 ACB ĐÃ XÁC NHẬN TIỀN VÀO! Hệ thống đã tự động bắn +${res.sol_amount} SOL vào ví Phantom của bạn trên Solana Devnet.`);
            } else {
              setMessage(`🎉 ACB ĐÃ XÁC NHẬN TIỀN VÀO! Hệ thống đã tự động cộng +${res.points.toLocaleString("vi-VN")} UniPoints vào tài khoản.`);
            }
            await refreshPoints();
            void loadBankHistory();
            return;
          } else if (res.status === "expired") {
            setBankOrder((prev) => (prev ? { ...prev, status: "expired" } : null));
            setBankTimeLeft(0);
            return;
          }
        }

        const history = await api.getBankDepositHistory();
        if (isCancelled) return;
        setBankHistory(history);

        const anyPending = history.find((h) => h.status === "pending");
        if (anyPending) {
          const check = await api.checkBankDeposit(anyPending.order_code);
          if (isCancelled) return;
          if (check.status === "paid") {
            if (bankOrder && bankOrder.order_code === anyPending.order_code) {
              setBankOrder((prev) => (prev ? {
                ...prev,
                status: "paid",
                solana_signature: check.solana_signature,
                solana_explorer_url: check.solana_explorer_url,
                sol_amount: check.sol_amount,
                payout_mode: check.payout_mode,
              } : null));
            }
            if (check.payout_mode === "sol_swap") {
              setMessage(`🎉 ACB ĐÃ XÁC NHẬN TIỀN VÀO! Hệ thống đã tự động bắn +${check.sol_amount} SOL vào ví Phantom của bạn.`);
            } else {
              setMessage(`🎉 ACB ĐÃ XÁC NHẬN TIỀN VÀO! Hệ thống đã tự động cộng +${check.points.toLocaleString("vi-VN")} UniPoints vào tài khoản.`);
            }
            await refreshPoints();
            void loadBankHistory();
          } else if (check.status === "expired") {
            if (bankOrder && bankOrder.order_code === anyPending.order_code) {
              setBankOrder((prev) => (prev ? { ...prev, status: "expired" } : null));
              setBankTimeLeft(0);
            }
          }
        }
      } catch {
        // Bỏ qua lỗi mạng nền
      }
    };

    const interval = setInterval(pollStatus, 3000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [user, bankOrder?.order_code, bankOrder?.status]);



  function handleCopy(text: string, field: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  }

  function handleConnectWalletClick() {
    setVisible(true);
  }

  async function authenticateWallet() {
    if (!wallet.publicKey) {
      setMessage("Hãy kết nối Phantom trước khi xác thực ví.");
      setVisible(true);
      return;
    }
    if (!wallet.signMessage) {
      setMessage("Ví này không hỗ trợ ký message. Hãy dùng Phantom.");
      return;
    }
    setAuthenticating(true);
    setMessage("Đang tạo yêu cầu xác thực. Hãy ký message trong Phantom…");
    try {
      const address = wallet.publicKey.toBase58();
      const challenge = await api.challengeWallet(address);
      const signed = await wallet.signMessage(new TextEncoder().encode(challenge.message));
      await api.verifyWallet(address, challenge.nonce, challenge.message, bs58.encode(signed));
      setWalletAuthenticated(true);
      await refreshState();
      const profile = await api.getMe();
      setPoints(profile.unipoints);
      recoveryKey.current = `unisynapse:deposit:${profile.id}`;
      setMessage("✓ Đã xác thực ví thành công! Bạn có thể nạp SOL đổi UniPoints ngay.");
    } catch (e) {
      setWalletAuthenticated(false);
      setMessage(e instanceof Error ? e.message : "Xác thực ví thất bại. Hãy thử lại.");
    } finally {
      setAuthenticating(false);
    }
  }

  async function handleUnlinkWallet() {
    if (!confirm("Bạn có chắc muốn hủy liên kết ví này khỏi tài khoản?")) return;
    setBusy(true);
    try {
      await api.unlinkWallet();
      setWalletAuthenticated(false);
      setMessage("Đã hủy liên kết ví khỏi tài khoản.");
      await refreshState();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Không thể hủy liên kết ví.");
    } finally {
      setBusy(false);
    }
  }

  function handleSelectPreset(val: string) {
    setAmount(val);
    setSelectedPreset(val);
    setReview(null);
  }

  function handleAmountChange(val: string) {
    setAmount(val);
    setSelectedPreset(null);
    setReview(null);
  }

  function addMemo(tx: Transaction, memoText: string) {
    tx.add(
      new TransactionInstruction({
        keys: [],
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
        data: Buffer.from(memoText),
      })
    );
    return tx;
  }

  // --- STREAMLINED 1-CLICK DEPOSIT FLOW ---
  async function executeOneClickDeposit() {
    if (busy || lock.current) return;
    if (!user) {
      setMessage("Vui lòng đăng nhập tài khoản trước khi nạp UniPoints.");
      router.push("/dang-nhap");
      return;
    }
    if (!wallet.publicKey) {
      setMessage("Hãy kết nối ví Phantom trước.");
      setVisible(true);
      return;
    }
    if (!walletAuthenticated) {
      setMessage("Vui lòng xác thực ví trước khi nạp SOL.");
      await authenticateWallet();
      return;
    }

    lock.current = true;
    setBusy(true);
    setMessage("");
    setStep(1);

    try {
      if (await connection.getGenesisHash() !== DEVNET) {
        throw new Error("RPC không phải Solana Devnet. Đã chặn giao dịch để bảo vệ ví.");
      }

      // 1. Validate amount
      if (!/^(0|[1-9]\d*)(\.\d{1,9})?$/.test(amount)) {
        throw new Error("Số SOL phải dương, tối đa 9 chữ số thập phân.");
      }
      const [whole, fraction = ""] = amount.split(".");
      const lamports = BigInt(whole) * BigInt(1_000_000_000) + BigInt(fraction.padEnd(9, "0"));
      if (lamports < BigInt(1_000_000) || lamports % BigInt(1_000_000) !== BigInt(0) || lamports > BigInt(10_000_000_000)) {
        throw new Error("Nạp từ 0.001 đến 10 SOL, theo bội số 0.001 SOL.");
      }

      // 2. Create deposit intent from backend
      const intentData = await api.createDeposit();
      setDeposit(intentData);
      setRecipient(intentData.treasury);

      const target = new PublicKey(intentData.treasury);
      const latest = await connection.getLatestBlockhash("confirmed");
      let tx = new Transaction({ ...latest, feePayer: wallet.publicKey }).add(
        SystemProgram.transfer({ fromPubkey: wallet.publicKey, toPubkey: target, lamports })
      );
      tx = addMemo(tx, intentData.memo);

      const fee = (await connection.getFeeForMessage(tx.compileMessage(), "confirmed")).value;
      if (fee === null) throw new Error("Không lấy được phí mạng. Vui lòng thử lại.");

      const available = await connection.getBalance(wallet.publicKey, "confirmed");
      setBalance(available);
      if (BigInt(available) < lamports + BigInt(fee)) {
        throw new Error(`Số dư ví (${available / 1e9} SOL) không đủ cho ${amount} SOL và phí mạng.`);
      }

      // 3. Prompt Phantom to sign & send
      setStep(2);
      setMessage("Đang chờ bạn xác nhận giao dịch trong ví Phantom…");
      const sent = await wallet.sendTransaction(tx, connection, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
        maxRetries: 3,
      });

      setSignature(sent);
      if (recoveryKey.current) {
        try {
          localStorage.setItem(recoveryKey.current, JSON.stringify({ deposit: intentData, signature: sent }));
        } catch {
          /* ignore */
        }
      }

      // 4. Confirm on Solana Devnet
      setStep(3);
      setMessage("Đã phát giao dịch! Đang xác nhận trên Solana Devnet…");
      const result = await connection.confirmTransaction({ ...latest, signature: sent }, "confirmed");
      if (result.value.err) {
        throw new Error("Giao dịch bị từ chối trên mạng Solana.");
      }

      // 5. Verify & credit UniPoints (auto-retry up to 8 times if indexing)
      setMessage("Đang đối soát và cộng UniPoints vào tài khoản…");
      let verifiedCredited = 0;
      for (let attempt = 1; attempt <= 8; attempt++) {
        try {
          const res = await api.verifyDeposit(intentData.intent_id, sent);
          verifiedCredited = res.credited;
          break;
        } catch {
          if (attempt < 8) {
            setMessage(`Mạng đang đồng bộ slot (thử lần ${attempt}/8)…`);
            await new Promise((r) => setTimeout(r, 2000));
          } else {
            throw new Error("Giao dịch đã gửi thành công lên Solana! Bấm 'Đối soát và cộng điểm' bên dưới để nhận điểm.");
          }
        }
      }

      // Success
      setStep(4);
      setMessage(`🎉 Nạp thành công! Đã cộng +${verifiedCredited.toLocaleString("vi-VN")} UniPoints vào tài khoản.`);
      await refreshPoints();
      await refreshState();
      try {
        setBalance(await connection.getBalance(wallet.publicKey, "confirmed"));
      } catch {
        /* ignore */
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Không thể hoàn tất nạp SOL.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  // --- MANUAL VERIFY EXISTING DEPOSIT ---
  async function verifyDeposit() {
    if (!deposit || !signature) return;
    setBusy(true);
    setMessage("Đang đối soát giao dịch…");
    try {
      const r = await api.verifyDeposit(deposit.intent_id, signature);
      setMessage(`✓ Đã ghi nhận +${r.credited.toLocaleString("vi-VN")} UniPoints. Giao dịch đã được khóa.`);
      setStep(4);
      await refreshPoints();
      await refreshState();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  // --- 1-CLICK AUTO-SYNC DIRECT DEPOSITS ---
  async function handleAutoSync() {
    if (!walletAuthenticated) {
      setMessage("Hãy xác thực ví trước khi quét giao dịch.");
      return;
    }
    setIsSyncing(true);
    setMessage("Đang quét các giao dịch chuyển SOL gần nhất từ ví vào hệ thống…");
    try {
      const res = await api.syncDeposits();
      if (res.credited > 0) {
        setMessage(`🎉 Tuyệt vời! Đã phát hiện ${res.count} giao dịch hợp lệ và cộng ngay +${res.credited.toLocaleString("vi-VN")} UniPoints!`);
        await refreshPoints();
        await refreshState();
        if (activeTab === "history") loadLedger();
      } else {
        setMessage("ℹ Không có giao dịch chuyển SOL mới nào chưa được cộng điểm.");
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lỗi khi quét giao dịch.");
    } finally {
      setIsSyncing(false);
    }
  }

  // --- MANUAL SIGNATURE RECOVERY ---
  async function recoverDeposit() {
    const value = recoverySignature.trim();
    if (!value) {
      setMessage("Hãy dán mã giao dịch (signature) trước khi đối soát.");
      return;
    }
    if (!walletAuthenticated) {
      setMessage("Hãy bấm 'Xác thực ví' và ký message bằng đúng ví đã gửi SOL trước.");
      return;
    }
    setBusy(true);
    setMessage("Đang đối soát giao dịch trên Solana Devnet…");
    try {
      const r = await api.recoverDeposit(value);
      setSignature(value);
      setRecoverySignature("");
      setMessage(`🎉 Đã cộng +${r.credited.toLocaleString("vi-VN")} UniPoints từ giao dịch. Không gửi lại SOL.`);
      await refreshPoints();
      await refreshState();
      if (activeTab === "history") loadLedger();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Không thể đối soát giao dịch. Hãy xác thực đúng ví đã gửi SOL.");
    } finally {
      setBusy(false);
    }
  }

  // --- GENERIC TRANSFER PREPARE / SEND (For Tab 2 & tests) ---
  async function prepare() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    setReview(null);
    try {
      if (!wallet.publicKey) throw new Error("Hãy kết nối Phantom trước.");
      if (await connection.getGenesisHash() !== DEVNET) throw new Error("RPC không phải Solana Devnet.");
      if (!/^(0|[1-9]\d*)(\.\d{1,9})?$/.test(amount)) throw new Error("Số SOL phải dương, tối đa 9 chữ số thập phân.");
      const [whole, fraction = ""] = amount.split(".");
      const lamports = BigInt(whole) * BigInt(1_000_000_000) + BigInt(fraction.padEnd(9, "0"));
      if (lamports <= BigInt(0) || lamports > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("Số lượng nằm ngoài giới hạn.");
      if (deposit && (lamports < BigInt(1_000_000) || lamports % BigInt(1_000_000) !== BigInt(0) || lamports > BigInt(10_000_000_000))) {
        throw new Error("Nạp từ 0.001 đến 10 SOL, theo bội số 0.001 SOL.");
      }
      const target = new PublicKey(recipient.trim());
      if (!PublicKey.isOnCurve(target.toBytes())) throw new Error("Chỉ hỗ trợ gửi tới địa chỉ ví thông thường.");
      if (target.equals(wallet.publicKey)) throw new Error("Ví nhận phải khác ví gửi.");
      const latest = await connection.getLatestBlockhash("confirmed");
      let tx = new Transaction({ ...latest, feePayer: wallet.publicKey }).add(
        SystemProgram.transfer({ fromPubkey: wallet.publicKey, toPubkey: target, lamports })
      );
      if (deposit) tx = addMemo(tx, deposit.memo);
      const fee = (await connection.getFeeForMessage(tx.compileMessage(), "confirmed")).value;
      if (fee === null) throw new Error("Không lấy được phí. Vui lòng thử lại.");
      const available = await connection.getBalance(wallet.publicKey, "confirmed");
      setBalance(available);
      if (BigInt(available) < lamports + BigInt(fee)) throw new Error("Không đủ SOL cho số tiền và phí mạng.");
      setReview({ sender: wallet.publicKey.toBase58(), recipient: target.toBase58(), amount, lamports, fee });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Không thể chuẩn bị giao dịch.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function send() {
    if (lock.current || !review || signature) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    let sent = "";
    try {
      if (!wallet.publicKey || wallet.publicKey.toBase58() !== review.sender) throw new Error("Ví đã thay đổi. Hãy kiểm tra lại.");
      if (deposit) {
        const profile = await api.getMe();
        if (profile.address !== review.sender) throw new Error("Ví gửi không khớp ví đã xác thực của tài khoản.");
        recoveryKey.current = `unisynapse:deposit:${profile.id}`;
      }
      if (await connection.getGenesisHash() !== DEVNET) throw new Error("Sai mạng Devnet.");
      const latest = await connection.getLatestBlockhash("confirmed");
      let tx = new Transaction({ ...latest, feePayer: wallet.publicKey }).add(
        SystemProgram.transfer({ fromPubkey: wallet.publicKey, toPubkey: new PublicKey(review.recipient), lamports: review.lamports })
      );
      if (deposit) tx = addMemo(tx, deposit.memo);
      const fee = (await connection.getFeeForMessage(tx.compileMessage(), "confirmed")).value;
      if (fee === null || fee !== review.fee) throw new Error("Phí đã thay đổi. Hãy xem lại giao dịch.");
      if (BigInt(await connection.getBalance(wallet.publicKey, "confirmed")) < review.lamports + BigInt(fee)) throw new Error("Số dư không đủ.");
      setMessage("Đang chờ bạn xác nhận trong Phantom…");
      sent = await wallet.sendTransaction(tx, connection, { skipPreflight: false, preflightCommitment: "confirmed", maxRetries: 0 });
      setSignature(sent);
      setReview(null);
      if (deposit && recoveryKey.current) {
        try {
          localStorage.setItem(recoveryKey.current, JSON.stringify({ deposit, signature: sent }));
        } catch {
          /* ignore */
        }
      }
      setMessage("Đã gửi. Đang chờ mạng xác nhận — không gửi lại.");
      const result = await connection.confirmTransaction({ ...latest, signature: sent }, deposit ? "finalized" : "confirmed");
      if (result.value.err) {
        setMessage("Giao dịch thất bại trên mạng. Kiểm tra Explorer.");
        return;
      }
      if (deposit) {
        try {
          const credited = await api.verifyDeposit(deposit.intent_id, sent);
          setMessage(`Đã nạp thành công ${credited.credited} UniPoints.`);
          await refreshPoints();
          await refreshState();
        } catch {
          setMessage("Đã gửi SOL. Bấm Đối soát để thử cộng điểm lại; không gửi lại SOL.");
        }
      } else {
        setMessage("Đã xác nhận chuyển SOL trên Devnet.");
      }
      try {
        setBalance(await connection.getBalance(wallet.publicKey, "confirmed"));
      } catch {
        /* ignore */
      }
    } catch (e) {
      setReview(null);
      setMessage(sent ? "Chưa xác định kết quả. Kiểm tra Explorer trước khi gửi lại." : e instanceof Error ? e.message : "Không thể gửi giao dịch.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  // Calculate projected points
  const parsedAmount = Number(amount);
  const isValidAmount = /^(0|[1-9]\d*)(\.\d{1,9})?$/.test(amount) && parsedAmount >= 0.001 && parsedAmount <= 10;
  const projectedPoints = isValidAmount ? Math.round(parsedAmount * 1000) : 0;
  const projectedQueries = Math.floor(projectedPoints / 80);

  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        {/* Header navigation & status */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "var(--surface, #030712)", border: "1px solid #06b6d4", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#22d3ee", fontSize: "10px" }}>WIT</div>
            <Link href="/" style={{ color: "var(--teal, #06b6d4)", textDecoration: "none", fontWeight: 700, fontSize: "0.875rem" }}>Trang chủ</Link>
            <Link href="/?tab=labeling" style={{ color: "var(--muted, #94a3b8)", textDecoration: "none", fontSize: "0.8rem", padding: "0.2rem 0.6rem", borderRadius: "4px", background: "var(--surface-secondary, rgba(255,255,255,0.06))", border: "1px solid var(--line, rgba(255,255,255,0.1))" }}>◈ Gán nhãn</Link>
            <Link href="/?tab=upload" style={{ color: "var(--muted, #94a3b8)", textDecoration: "none", fontSize: "0.8rem", padding: "0.2rem 0.6rem", borderRadius: "4px", background: "var(--surface-secondary, rgba(255,255,255,0.06))", border: "1px solid var(--line, rgba(255,255,255,0.1))" }}>⇪ Góp tài liệu</Link>
            <Link href="/?tab=tutor" style={{ color: "var(--muted, #94a3b8)", textDecoration: "none", fontSize: "0.8rem", padding: "0.2rem 0.6rem", borderRadius: "4px", background: "var(--surface-secondary, rgba(255,255,255,0.06))", border: "1px solid var(--line, rgba(255,255,255,0.1))" }}>✦ AI Tutor</Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <ThemeToggle compact />
            <span className={styles.badge}>SOLANA DEVNET · THỬ NGHIỆM</span>
          </div>
        </div>

        {!user && (
          <div style={{ padding: "0.75rem 1rem", borderRadius: "8px", background: "rgba(6, 182, 212, 0.15)", border: "1px solid rgba(6, 182, 212, 0.4)", color: "#22d3ee", margin: "1rem 0", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <span>⚡ <strong>Sign-in With Solana:</strong> Kết nối ví Phantom và bấm &quot;Xác thực ví&quot; để đăng nhập hoặc nhận ngay 100 UP khởi đầu.</span>
            <Link href="/dang-nhap" style={{ color: "#fff", background: "#0284c7", padding: "0.35rem 0.75rem", borderRadius: "6px", textDecoration: "none", fontWeight: "bold", fontSize: "0.8rem" }}>Đăng nhập truyền thống</Link>
          </div>
        )}

        <h1>Đổi SOL thành<br /><em>UniPoints.</em></h1>
        <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
          Nạp SOL Devnet tự động quy đổi thành UniPoints để trò chuyện với Trợ lý Gia sư AI (80 điểm/câu hỏi). Giao dịch được xác nhận an toàn on-chain.
        </p>

        {/* Stats Grid: Current Points & Wallet Balance */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Số Dư Điểm Thưởng</div>
            <div className={styles.statValue}>
              {points !== null ? points.toLocaleString("vi-VN") : "0"} <span style={{ fontSize: "0.9rem", color: "#67e8f9" }}>UP</span>
            </div>
            <div className={styles.statSub}>
              ≈ {points !== null ? Math.floor(points / 80) : 0} lượt hỏi AI
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>Số Dư SOL Trong Ví</div>
            <div className={styles.statValue}>
              {balance !== null ? (balance / 1e9).toFixed(3) : "—"} <span style={{ fontSize: "0.9rem", color: "#67e8f9" }}>SOL</span>
            </div>
            <div className={styles.statSub}>
              {wallet.publicKey ? "Ví Phantom đã kết nối" : "Chưa kết nối ví"}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>Tỷ Giá Quy Đổi</div>
            <div className={styles.statValue}>
              1.000 <span style={{ fontSize: "0.9rem", color: "#67e8f9" }}>UP/SOL</span>
            </div>
            <div className={styles.statSub}>0.08 SOL = 80 UP (1 lượt AI)</div>
          </div>
        </div>

        {/* Wallet Connection & Authentication Box */}
        <div style={{ margin: "1rem 0" }}>
          <button id="wallet-connect" disabled={busy || authenticating} onClick={handleConnectWalletClick}>
            {wallet.publicKey ? "Thay đổi / Kết nối lại ví Phantom" : "Chọn / kết nối Phantom"}
          </button>
          <p className={styles.address} style={{ marginTop: "0.4rem" }}>
            {wallet.publicKey ? wallet.publicKey.toBase58() : "Chưa kết nối ví"}
          </p>
        </div>

        {wallet.publicKey && (
          <div className={styles.walletAuth} aria-live="polite">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              <strong>{walletAuthenticated ? "✓ Ví đã xác thực & liên kết với tài khoản" : "⚠ Ví mới chỉ kết nối, chưa xác thực liên kết"}</strong>
              {walletAuthenticated && (
                <button type="button" onClick={handleUnlinkWallet} disabled={busy} style={{ background: "transparent", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.3)", borderRadius: "4px", padding: "0.2rem 0.5rem", fontSize: "0.75rem", cursor: "pointer" }}>
                  Hủy liên kết ví
                </button>
              )}
            </div>
            <p>
              {walletAuthenticated
                ? "Ví này đã được liên kết với tài khoản sinh viên của bạn. Mọi khoản nạp sẽ tự động ghi có vào tài khoản này."
                : "Ký một thông điệp miễn phí để liên kết ví Phantom với phiên học tập UniSynapse. Không gửi SOL."}
            </p>
            {!walletAuthenticated && (
              <button type="button" id="wallet-authenticate" disabled={busy || authenticating} onClick={authenticateWallet}>
                {authenticating ? "Đang chờ xác thực trong Phantom…" : "Xác thực ví để nạp / đối soát"}
              </button>
            )}
          </div>
        )}

        {/* Tab Selection */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "bank" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("bank")}
          >
            ⚡ Đổi VNĐ Sang SOL (VietQR ACB)
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "deposit" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("deposit")}
          >
            💎 Nạp SOL Devnet
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "transfer" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("transfer")}
          >
            ⚡ Chuyển SOL P2P
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "history" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("history")}
          >
            📜 Lịch Sử & Đối Soát
          </button>
        </div>

        {/* TAB 0: CỔNG ON-RAMP VIETQR ACB -> SOLANA DEVNET */}
        {activeTab === "bank" && (
          <div className={styles.bankCard}>
            {/* Mode Switcher */}
            <div className={styles.onrampModeSwitch}>
              <button
                type="button"
                className={`${styles.modePillBtn} ${bankPayoutMode === "sol_swap" ? styles.modePillActiveSol : ""}`}
                onClick={() => {
                  setBankPayoutMode("sol_swap");
                  setBankOrder(null);
                }}
              >
                <span>⚡ Đổi VNĐ Lấy SOL Devnet</span>
                <span className={styles.solanaBadgeGlow}>Khuyên dùng</span>
              </button>
              <button
                type="button"
                className={`${styles.modePillBtn} ${bankPayoutMode === "unipoints" ? styles.modePillActivePoints : ""}`}
                onClick={() => {
                  setBankPayoutMode("unipoints");
                  setBankOrder(null);
                }}
              >
                <span>🎓 Nạp Điểm UniPoints (AI Luna)</span>
              </button>
            </div>

            {bankPayoutMode === "sol_swap" ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  <h2 style={{ fontSize: "1.2rem", margin: 0, color: "#e0f2fe", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>⚡</span> Cổng On-Ramp Tức Thì: VietQR (ACB) ➔ Solana Devnet
                  </h2>
                  <span className={styles.solanaBadgeGlow}>
                    Instant Solana On-Ramp
                  </span>
                </div>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.4rem" }}>
                  Giải pháp Web2.5 giúp sinh viên Việt Nam sở hữu ngay SOL Devnet vào ví Phantom chỉ bằng 1 thao tác quét mã VietQR ngân hàng ACB trên điện thoại — <strong>hoàn toàn không cần KYC, không cần nạp tiền lên sàn CEX/DEX phức tạp</strong>!
                </p>

                {/* Target Phantom Wallet Selection */}
                <div className={styles.solanaWalletBox}>
                  <label style={{ margin: "0 0 0.35rem 0", color: "#a5f3fc", fontSize: "0.82rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.4rem" }}>
                    <span>Ví Phantom nhận SOL Devnet:</span>
                    {wallet.publicKey ? (
                      <span className={styles.solanaConnectedBadge}>
                        ✓ Đã kết nối ví Phantom ({wallet.publicKey.toBase58().slice(0, 4)}...{wallet.publicKey.toBase58().slice(-4)})
                      </span>
                    ) : (
                      <span style={{ color: "#fbbf24", fontSize: "0.75rem" }}>
                        ⚠️ Chưa kết nối ví — Bạn có thể dán địa chỉ ví hoặc bấm nút kết nối bên dưới:
                      </span>
                    )}
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      type="text"
                      value={customSolWallet || (wallet.publicKey ? wallet.publicKey.toBase58() : "")}
                      onChange={(e) => setCustomSolWallet(e.target.value)}
                      placeholder={wallet.publicKey ? wallet.publicKey.toBase58() : "Dán địa chỉ ví Phantom của bạn hoặc bấm kết nối..."}
                      style={{ flex: 1, fontFamily: "monospace", fontSize: "0.82rem", borderColor: "rgba(153, 69, 255, 0.5)" }}
                    />
                    {!wallet.connected && (
                      <button
                        type="button"
                        onClick={() => setVisible(true)}
                        style={{ margin: 0, padding: "0.55rem 0.85rem", fontSize: "0.78rem", whiteSpace: "nowrap", background: "linear-gradient(135deg, #9945FF, #14F195)", color: "#030712", fontWeight: 800, borderRadius: "8px" }}
                      >
                        Kết nối ví Phantom
                      </button>
                    )}
                  </div>
                </div>

                <label style={{ marginTop: "1rem" }}>Chọn nhanh gói đổi SOL Devnet (Tặng kèm UniPoints):</label>
                <div className={styles.presetGrid}>
                  {SOL_SWAP_PRESETS.map((p) => (
                    <button
                      key={p.amount}
                      type="button"
                      className={`${styles.presetBtn} ${bankSelectedPreset === p.amount ? styles.activePreset : ""}`}
                      onClick={() => handleSelectBankPreset(p.amount)}
                      style={bankSelectedPreset === p.amount ? { borderColor: "#14F195", boxShadow: "0 0 14px rgba(20, 241, 149, 0.4)" } : {}}
                    >
                      <strong>{p.amount.toLocaleString("vi-VN")} đ</strong>
                      <span style={{ color: "#14F195", fontWeight: 800 }}>⚡ {p.sol} SOL</span>
                      {p.bonus && <span className={styles.bonusBadge} style={{ background: "rgba(153, 69, 255, 0.25)", color: "#c084fc", borderColor: "rgba(153, 69, 255, 0.6)" }}>{p.bonus}</span>}
                      <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{p.desc} (+{p.points} UP)</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  <h2 style={{ fontSize: "1.2rem", margin: 0, color: "#e0f2fe", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>🏦</span> Nạp UniPoints qua Ngân hàng ACB (VietQR)
                  </h2>
                  <span className={styles.pulseStatus}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22d3ee", display: "inline-block" }}></span>
                    Tự động duyệt 24/7
                  </span>
                </div>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.4rem" }}>
                  Chuyển khoản nhanh qua VietQR bằng bất kỳ App ngân hàng nào (ACB, Vietcombank, MB, Techcombank, Momo, v.v.). Hệ thống tự động ghi có UniPoints vào tài khoản ngay khi nhận được tiền.
                </p>

                <label style={{ marginTop: "1rem" }}>Chọn nhanh gói nạp điểm (Khuyến mãi tích lũy):</label>
                <div className={styles.presetGrid}>
                  {BANK_PRESETS.map((p) => (
                    <button
                      key={p.amount}
                      type="button"
                      className={`${styles.presetBtn} ${bankSelectedPreset === p.amount ? styles.activePreset : ""}`}
                      onClick={() => handleSelectBankPreset(p.amount)}
                    >
                      <strong>{p.amount.toLocaleString("vi-VN")} đ</strong>
                      <span style={{ color: "#67e8f9" }}>+{p.points.toLocaleString("vi-VN")} UP</span>
                      {p.bonus && <span className={styles.bonusBadge}>{p.bonus}</span>}
                      <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{p.desc}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <label htmlFor="bank-custom-amount" style={{ marginTop: "1rem" }}>
              Hoặc nhập số tiền VNĐ tùy chọn (tối thiểu 10.000đ):
            </label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                id="bank-custom-amount"
                type="number"
                min="10000"
                step="5000"
                value={bankCustomInput}
                onChange={(e) => handleBankCustomChange(e.target.value)}
                placeholder="Ví dụ: 20000"
                style={{ flex: 1 }}
              />
              <span style={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.9rem", minWidth: "40px" }}>VNĐ</span>
            </div>

            {bankPayoutMode === "sol_swap" ? (
              <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#a5f3fc" }}>
                Dự kiến nhận: <strong style={{ color: "#14F195", fontSize: "1.1rem" }}>{calculateSolAmount(bankAmount)} SOL</strong>
                <span style={{ marginLeft: "0.5rem", color: "#38bdf8" }}>+ Tặng {Math.round(calculateBankPoints(bankAmount) / 2).toLocaleString("vi-VN")} UP</span>
                <span style={{ marginLeft: "0.5rem", color: "#94a3b8" }}>➔ Chuyển thẳng về ví Phantom trên Solana Devnet</span>
              </div>
            ) : (
              <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#a5f3fc" }}>
                Dự kiến nhận: <strong style={{ color: "#38bdf8", fontSize: "1.05rem" }}>{calculateBankPoints(bankAmount).toLocaleString("vi-VN")} UP</strong>
                {bankAmount >= 100000 && <span style={{ marginLeft: "0.5rem", color: "#fbbf24" }}>(Đã gồm +30% Thưởng)</span>}
                {bankAmount >= 50000 && bankAmount < 100000 && <span style={{ marginLeft: "0.5rem", color: "#fbbf24" }}>(Đã gồm +20% Thưởng)</span>}
                {bankAmount >= 20000 && bankAmount < 50000 && <span style={{ marginLeft: "0.5rem", color: "#fbbf24" }}>(Đã gồm +10% Thưởng)</span>}
                <span style={{ marginLeft: "0.5rem", color: "#94a3b8" }}>≈ {Math.floor(calculateBankPoints(bankAmount) / 80)} lượt hỏi AI</span>
              </div>
            )}

            {!bankOrder ? (
              <button
                type="button"
                id="create-vietqr-btn"
                disabled={bankLoading || bankAmount < 10000}
                onClick={handleCreateBankIntent}
                style={{
                  marginTop: "1.2rem",
                  width: "100%",
                  background: bankPayoutMode === "sol_swap" ? "linear-gradient(135deg, #9945FF, #14F195)" : undefined,
                  color: bankPayoutMode === "sol_swap" ? "#030712" : undefined,
                  boxShadow: bankPayoutMode === "sol_swap" ? "0 0 20px rgba(20, 241, 149, 0.4)" : undefined,
                }}
              >
                {bankLoading
                  ? "Đang tạo mã VietQR…"
                  : bankPayoutMode === "sol_swap"
                  ? `⚡ Tạo Mã VietQR Đổi ${bankAmount.toLocaleString("vi-VN")}đ Lấy ${calculateSolAmount(bankAmount)} SOL Devnet`
                  : `Tạo Mã VietQR Nạp ${bankAmount.toLocaleString("vi-VN")}đ (+${calculateBankPoints(bankAmount).toLocaleString("vi-VN")} UP)`
                }
              </button>
            ) : (
              <div className={styles.bankQrSection}>
                <div className={styles.bankQrWrapper}>
                  {bankOrder.status === "expired" ? (
                    <div className={styles.expiredQrWrapper}>
                      <div className={styles.expiredIcon}>⌛</div>
                      <div className={styles.expiredTitle}>HẾT THỜI GIAN CHỜ</div>
                      <div className={styles.expiredSubtitle}>
                        Thời gian 10 phút đã hết.<br />Ảnh mã VietQR đã bị ngắt tự động.
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* VietQR Code Image */}
                      <img
                        src={bankOrder.qr_url}
                        alt={`Mã VietQR ${bankOrder.order_code}`}
                        className={styles.bankQrImg}
                      />
                      <div style={{ marginTop: "0.5rem", textAlign: "center" }}>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Quét mã bằng App Ngân Hàng</span>
                      </div>
                    </>
                  )}
                </div>

                <div className={styles.bankDetailsCol}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.85rem", color: "#38bdf8", fontWeight: 700 }}>
                      MÃ ĐƠN: {bankOrder.order_code}
                    </span>
                    {bankOrder.status === "paid" && (
                      <span className={styles.badgeVerified}>✓ ĐÃ THANH TOÁN</span>
                    )}
                    {bankOrder.status === "expired" && (
                      <span className={styles.badgeExpired}>⌛ HẾT THỜI GIAN CHỜ</span>
                    )}
                    {bankOrder.status === "pending" && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span className={styles.pulseStatus}>⏳ Đang chờ quét mã</span>
                        <span className={`${styles.countdownBadge} ${bankTimeLeft <= 120 ? styles.countdownUrgent : ""}`}>
                          ⏱️ {Math.floor(bankTimeLeft / 60).toString().padStart(2, "0")}:{Math.floor(bankTimeLeft % 60).toString().padStart(2, "0")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles.bankDetailRow}>
                    <span className={styles.bankDetailLabel}>Loại giao dịch:</span>
                    <span className={styles.bankDetailValue} style={{ color: bankOrder.payout_mode === "sol_swap" ? "#14F195" : "#38bdf8", fontWeight: 700 }}>
                      {bankOrder.payout_mode === "sol_swap"
                        ? `⚡ Đổi lấy ${bankOrder.sol_amount || calculateSolAmount(bankOrder.amount_vnd)} SOL Devnet`
                        : "🎓 Nạp UniPoints (Hỏi bài AI)"}
                    </span>
                  </div>

                  {bankOrder.target_wallet && (
                    <div className={styles.bankDetailRow}>
                      <span className={styles.bankDetailLabel}>Ví Phantom nhận SOL:</span>
                      <span className={styles.bankDetailValue} style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>
                        {bankOrder.target_wallet.slice(0, 6)}...{bankOrder.target_wallet.slice(-6)}
                      </span>
                    </div>
                  )}

                  <div className={styles.bankDetailRow}>
                    <span className={styles.bankDetailLabel}>Ngân hàng thụ hưởng:</span>
                    <span className={styles.bankDetailValue}>
                      {bankOrder.bank_name} (ACB - Á Châu)
                    </span>
                  </div>

                  <div className={styles.bankDetailRow}>
                    <span className={styles.bankDetailLabel}>Số tài khoản:</span>
                    <span className={styles.bankDetailValue}>
                      {bankOrder.account_number}
                      <button
                        type="button"
                        className={styles.copyButton}
                        onClick={() => handleCopy(bankOrder.account_number, "acc")}
                      >
                        {copiedField === "acc" ? "✓ Đã chép" : "Sao chép"}
                      </button>
                    </span>
                  </div>

                  <div className={styles.bankDetailRow}>
                    <span className={styles.bankDetailLabel}>Tên người thụ hưởng:</span>
                    <span className={styles.bankDetailValue}>
                      {bankOrder.account_name}
                    </span>
                  </div>

                  <div className={styles.bankDetailRow}>
                    <span className={styles.bankDetailLabel}>Số tiền chuyển:</span>
                    <span className={styles.bankDetailValue} style={{ color: "#34d399" }}>
                      {bankOrder.amount_vnd.toLocaleString("vi-VN")} VNĐ
                      <button
                        type="button"
                        className={styles.copyButton}
                        onClick={() => handleCopy(String(bankOrder.amount_vnd), "amt")}
                      >
                        {copiedField === "amt" ? "✓ Đã chép" : "Sao chép"}
                      </button>
                    </span>
                  </div>

                  <div className={styles.bankDetailRow} style={{ borderColor: "rgba(234, 179, 8, 0.4)", background: "rgba(234, 179, 8, 0.08)" }}>
                    <span className={styles.bankDetailLabel} style={{ color: "#fde047" }}>
                      Nội dung chuyển khoản (bắt buộc):
                    </span>
                    <span className={styles.bankDetailValue} style={{ color: "#fde047" }}>
                      {bankOrder.order_code}
                      <button
                        type="button"
                        className={styles.copyButton}
                        style={{ background: "rgba(234, 179, 8, 0.25) !important", color: "#fde047 !important", borderColor: "rgba(234, 179, 8, 0.6) !important" }}
                        onClick={() => handleCopy(bankOrder.order_code, "code")}
                      >
                        {copiedField === "code" ? "✓ Đã chép" : "Sao chép"}
                      </button>
                    </span>
                  </div>

                  {/* Action buttons & Real-time boxes */}
                  <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {bankOrder.status === "paid" && (
                      <div className={styles.solanaTxSuccessCard}>
                        <div style={{ color: "#14F195", fontWeight: 800, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span>🎉</span> GIAO DỊCH HOÀN TẤT THÀNH CÔNG!
                        </div>
                        {bankOrder.payout_mode === "sol_swap" && (
                          <>
                            <p style={{ color: "#e2e8f0", fontSize: "0.82rem", margin: "0.4rem 0 0.6rem 0", lineHeight: 1.4 }}>
                              Đã chuyển <strong>+{bankOrder.sol_amount || calculateSolAmount(bankOrder.amount_vnd)} SOL</strong> trực tiếp vào ví Phantom của bạn. Kiểm tra số dư trên ví hoặc xem bằng chứng on-chain:
                            </p>
                            {bankOrder.solana_signature && (
                              <a
                                href={bankOrder.solana_explorer_url || `https://explorer.solana.com/tx/${bankOrder.solana_signature}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.solanaExplorerBtn}
                              >
                                <span>🔗</span> Xem Giao Dịch Trên Solana Explorer (Devnet) ↗
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {bankOrder.status === "pending" && (
                      <div className={styles.autoDetectBox}>
                        <div className={styles.pulseRadar}>
                          <span className={styles.pulseDot}></span>
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "#38bdf8", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <span>⚡ Đang tự động đối soát ACB theo thời gian thực...</span>
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "0.25rem", lineHeight: 1.4 }}>
                            {bankOrder.payout_mode === "sol_swap"
                              ? `Hệ thống quét số dư ACB mỗi 3 giây. Ngay khi tiền về, Treasury sẽ ký lệnh Solana và chuyển ngay ${bankOrder.sol_amount || calculateSolAmount(bankOrder.amount_vnd)} SOL vào ví Phantom của bạn.`
                              : "Hệ thống tự động quét số dư ACB mỗi 3 giây. Ngay khi bạn chuyển khoản thành công, UniPoints sẽ tự động nhảy số mà không cần bấm bất kỳ nút nào."
                            }
                          </div>
                        </div>
                      </div>
                    )}

                    {bankOrder.status === "expired" && (
                      <div className={styles.expiredNoticeBox}>
                        <span style={{ fontSize: "1.5rem" }}>⚠️</span>
                        <div>
                          <div style={{ fontWeight: 700, color: "#f87171", fontSize: "0.85rem" }}>
                            Hết thời gian chờ thanh toán (10 phút)
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "0.25rem", lineHeight: 1.4 }}>
                            Mã VietQR này đã hết thời gian chờ tối đa và đã được ngắt kết nối an toàn. Vui lòng bấm nút bên dưới để tạo mã mới.
                          </div>
                          <button
                            type="button"
                            className={styles.newQrBtn}
                            onClick={handleCreateBankIntent}
                          >
                            🔄 Tạo mã VietQR mới
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setBankOrder(null)}
                      style={{ background: "transparent", border: "1px solid rgba(148,163,184,0.3)", color: "#94a3b8", padding: "0.4rem 0.8rem", borderRadius: "8px", fontSize: "0.8rem", cursor: "pointer", marginTop: "0.25rem" }}
                    >
                      ← Tạo đơn giao dịch khác
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Deposit History Table */}
            <div style={{ marginTop: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <h3 style={{ fontSize: "0.95rem", color: "#a5f3fc", margin: 0 }}>
                  Lịch sử nạp & On-Ramp ACB ({bankHistory.length})
                </h3>
                <button
                  type="button"
                  onClick={loadBankHistory}
                  disabled={bankHistoryLoading}
                  style={{ background: "transparent", border: "none", color: "#06b6d4", fontSize: "0.8rem", cursor: "pointer", padding: 0, marginTop: 0 }}
                >
                  {bankHistoryLoading ? "Đang tải…" : "🔄 Làm mới"}
                </button>
              </div>

              {bankHistory.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: "0.85rem", fontStyle: "italic" }}>
                  Chưa có giao dịch nạp tiền hoặc đổi SOL nào.
                </p>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.ledgerTable}>
                    <thead>
                      <tr>
                        <th>Mã Đơn</th>
                        <th>Thời gian</th>
                        <th>Số tiền (VNĐ)</th>
                        <th>Quyền lợi nhận</th>
                        <th>Trạng thái</th>
                        <th>Solana Explorer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bankHistory.map((item) => (
                        <tr key={item.id}>
                          <td style={{ fontFamily: "monospace", color: "#38bdf8", fontWeight: 700 }}>
                            {item.order_code}
                          </td>
                          <td style={{ whiteSpace: "nowrap", fontSize: "0.78rem" }}>
                            {new Date(item.created_at * 1000).toLocaleString("vi-VN", {
                              month: "numeric",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            {item.amount_vnd.toLocaleString("vi-VN")} đ
                          </td>
                          <td className={styles.pointsPlus}>
                            {item.payout_mode === "sol_swap" ? (
                              <span className={styles.badgeSolanaSwap}>
                                ⚡ +{item.sol_amount || calculateSolAmount(item.amount_vnd)} SOL
                                <span style={{ fontSize: "0.7rem", opacity: 0.85, marginLeft: "4px" }}>(+{item.points} UP)</span>
                              </span>
                            ) : (
                              <span>+{item.points.toLocaleString("vi-VN")} UP</span>
                            )}
                          </td>
                          <td>
                            {item.status === "paid" && (
                              <span className={styles.badgeVerified}>✓ Đã hoàn tất</span>
                            )}
                            {item.status === "expired" && (
                              <span className={styles.badgeExpired}>✕ Hết hạn</span>
                            )}
                            {item.status === "pending" && (
                              <span className={styles.pulseStatus}>Đang chờ</span>
                            )}
                          </td>
                          <td>
                            {item.solana_signature ? (
                              <a
                                href={`https://explorer.solana.com/tx/${item.solana_signature}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.explorerLinkSmall}
                                title={`Solana Tx: ${item.solana_signature}`}
                              >
                                <span>🔗</span> Devnet TX ↗
                              </a>
                            ) : item.status === "pending" ? (
                              <span style={{ color: "#fbbf24", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                                <span className={styles.pulseDotSmall}></span> Đối soát ACB
                              </span>
                            ) : (
                              <span style={{ color: "#64748b", fontSize: "0.75rem" }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: NẠP UNIPOINTS (ĐỔI SOL DEVNET) */}
        {activeTab === "deposit" && (
          <div>
            <label style={{ marginTop: "0.5rem" }}>Chọn nhanh gói nạp điểm:</label>
            <div className={styles.presetGrid}>
              {PRESETS.map((p) => (
                <button
                  key={p.sol}
                  type="button"
                  className={`${styles.presetBtn} ${selectedPreset === p.sol ? styles.activePreset : ""}`}
                  onClick={() => handleSelectPreset(p.sol)}
                >
                  <strong>{p.sol} SOL</strong>
                  <span>+{p.points} UP</span>
                  <span style={{ fontSize: "0.68rem", color: "#06b6d4" }}>{p.desc}</span>
                </button>
              ))}
            </div>

            <label htmlFor="sol-amount">Hoặc tự nhập số lượng SOL muốn nạp:</label>
            <input
              id="sol-amount"
              inputMode="decimal"
              value={amount}
              disabled={busy}
              placeholder="Ví dụ: 0.08"
              onChange={(e) => handleAmountChange(e.target.value)}
            />

            {/* Treasury info */}
            <div className={styles.systemWallet} aria-live="polite">
              <label htmlFor="sol-recipient" style={{ marginTop: 0 }}>Ví hệ thống tiếp nhận (UniSynapse Treasury)</label>
              <input id="sol-recipient" value={recipient} disabled={true} readOnly />
              <p id="system-wallet-note">Khoản SOL này được dùng để duy trì hạn ngạch GPU máy chủ AI và lưu trữ IPFS phân tán.</p>
            </div>

            {/* Summary calculation */}
            <div className={styles.summaryCard}>
              <div className={styles.summaryRow}>
                <span>Số SOL gửi:</span>
                <strong>{amount || "0"} SOL</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Phí mạng ước tính:</span>
                <span>~0.000005 SOL (Devnet)</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Điểm quy đổi:</span>
                <span style={{ color: "#34d399", fontWeight: 700 }}>
                  +{projectedPoints.toLocaleString("vi-VN")} UniPoints
                </span>
              </div>
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Quyền lợi nhận được:</span>
                <span>≈ {projectedQueries} câu hỏi Gia Sư AI</span>
              </div>
            </div>

            {/* Stepper when deposit in progress */}
            {step > 0 && (
              <div className={styles.stepper}>
                <div className={`${styles.stepItem} ${step >= 1 ? (step === 1 ? styles.stepActive : styles.stepDone) : ""}`}>
                  <div className={styles.stepIcon}>{step > 1 ? "✓" : "1"}</div>
                  <div>Tạo yêu cầu</div>
                </div>
                <div className={`${styles.stepItem} ${step >= 2 ? (step === 2 ? styles.stepActive : styles.stepDone) : ""}`}>
                  <div className={styles.stepIcon}>{step > 2 ? "✓" : "2"}</div>
                  <div>Ký Phantom</div>
                </div>
                <div className={`${styles.stepItem} ${step >= 3 ? (step === 3 ? styles.stepActive : styles.stepDone) : ""}`}>
                  <div className={styles.stepIcon}>{step > 3 ? "✓" : "3"}</div>
                  <div>Solana Devnet</div>
                </div>
                <div className={`${styles.stepItem} ${step >= 4 ? styles.stepDone : ""}`}>
                  <div className={styles.stepIcon}>{step === 4 ? "✓" : "4"}</div>
                  <div>Cộng điểm</div>
                </div>
              </div>
            )}

            {/* Primary Action Button (1-Click) */}
            <button
              id="deposit-start"
              className={styles.primaryActionBtn}
              disabled={busy || !isValidAmount}
              onClick={executeOneClickDeposit}
            >
              {busy ? "Đang xử lý nạp SOL…" : `🚀 Nạp ${amount || "0"} SOL để nhận ${projectedPoints.toLocaleString("vi-VN")} UniPoints`}
            </button>

            {/* Secondary: Detailed Review & Send for manual/script compatibility */}
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                id="sol-review"
                disabled={busy || !wallet.connected}
                style={{ flex: 1, background: "rgba(15, 23, 42, 0.6)", borderColor: "#164e63", color: "#94a3b8", fontSize: "0.8rem", marginTop: 0 }}
                onClick={prepare}
              >
                Kiểm tra số dư và phí →
              </button>
              {deposit && signature && (
                <button
                  type="button"
                  id="deposit-verify"
                  disabled={busy}
                  style={{ flex: 1, background: "#0e7490", borderColor: "#22d3ee", color: "#ecfeff", fontSize: "0.8rem", marginTop: 0 }}
                  onClick={verifyDeposit}
                >
                  Đối soát và cộng điểm
                </button>
              )}
            </div>

            {review && (
              <aside className={styles.review}>
                <h2>Xác nhận thông tin giao dịch</h2>
                <p className={styles.address}>Từ: {review.sender}<br />Đến: {review.recipient}</p>
                <p>{review.amount} SOL · Phí ước tính {review.fee / 1e9} SOL</p>
                <p>Mạng: Devnet. Bạn sẽ ký xác nhận trong ví Phantom.</p>
                <button id="sol-send" disabled={busy || wallet.publicKey?.toBase58() !== review.sender} onClick={send}>
                  Xác nhận qua Phantom
                </button>
              </aside>
            )}

            {/* Direct Wallet Transfer Auto-Sync Banner */}
            <div className={styles.syncBanner}>
              <div>
                <strong style={{ color: "#e9d5ff", fontSize: "0.9rem" }}>Đã gửi SOL trực tiếp từ ví Phantom?</strong>
                <p style={{ margin: "0.2rem 0 0", color: "#c4b5fd", fontSize: "0.78rem" }}>
                  Hệ thống có thể tự động quét 15 giao dịch gần nhất từ ví của bạn và cộng điểm ngay lập tức.
                </p>
              </div>
              <button
                type="button"
                className={styles.syncBtn}
                disabled={isSyncing || !walletAuthenticated}
                onClick={handleAutoSync}
              >
                {isSyncing ? "Đang quét ví…" : "🔄 Quét & Tự động cộng điểm"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: CHUYỂN SOL THỬ NGHIỆM P2P */}
        {activeTab === "transfer" && (
          <div>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.5rem" }}>
              Chuyển SOL Devnet thử nghiệm tới ví đồng nghiệp hoặc sinh viên khác. Giao dịch này không tạo ra UniPoints.
            </p>

            <label htmlFor="sol-recipient-transfer">Địa chỉ ví nhận SOL:</label>
            <input
              id="sol-recipient-transfer"
              value={recipient}
              disabled={busy}
              placeholder="Nhập địa chỉ ví Solana người nhận"
              onChange={(e) => {
                setRecipient(e.target.value);
                setReview(null);
              }}
            />

            <label htmlFor="sol-amount-transfer">Số lượng SOL muốn gửi:</label>
            <input
              id="sol-amount-transfer"
              inputMode="decimal"
              value={amount}
              disabled={busy}
              placeholder="Ví dụ: 0.1"
              onChange={(e) => {
                setAmount(e.target.value);
                setReview(null);
              }}
            />

            <button
              type="button"
              disabled={busy || !wallet.connected}
              onClick={prepare}
              style={{ width: "100%" }}
            >
              Kiểm tra số dư và phí mạng →
            </button>

            {review && (
              <aside className={styles.review}>
                <h2>Xác nhận chuyển SOL P2P</h2>
                <p className={styles.address}>Từ: {review.sender}<br />Đến: {review.recipient}</p>
                <p>{review.amount} SOL · Phí ước tính {review.fee / 1e9} SOL</p>
                <button id="sol-send-p2p" disabled={busy || wallet.publicKey?.toBase58() !== review.sender} onClick={send}>
                  Xác nhận chuyển SOL
                </button>
              </aside>
            )}
          </div>
        )}

        {/* TAB 3: LỊCH SỬ & ĐỐI SOÁT */}
        {activeTab === "history" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>
                Toàn bộ biến động điểm UniPoints và lịch sử nạp SOL on-chain.
              </p>
              <button
                type="button"
                className={styles.syncBtn}
                disabled={isSyncing || !walletAuthenticated}
                onClick={handleAutoSync}
              >
                {isSyncing ? "Đang quét ví…" : "🔄 Quét giao dịch ví"}
              </button>
            </div>

            {/* Manual Recovery Box */}
            <div className={styles.recovery} aria-live="polite">
              <h2>Đối soát thủ công bằng mã giao dịch (Signature)</h2>
              <p>Nếu bạn có mã giao dịch từ Solana Explorer chưa được cộng điểm, dán vào đây để đối soát ngay:</p>
              <input
                id="deposit-signature"
                value={recoverySignature}
                disabled={busy || !walletAuthenticated}
                onChange={(e) => setRecoverySignature(e.target.value)}
                placeholder="Dán signature giao dịch Solana (88 ký tự base58)"
                autoComplete="off"
              />
              <button
                type="button"
                id="deposit-recover"
                disabled={busy || !walletAuthenticated}
                onClick={recoverDeposit}
              >
                {busy ? "Đang đối soát…" : walletAuthenticated ? "Đối soát giao dịch và cộng điểm" : "Xác thực ví trước khi đối soát"}
              </button>
            </div>

            {/* Bank ACB Deposits in History */}
            {bankHistory.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <h3 style={{ fontSize: "0.95rem", color: "#a5f3fc", marginBottom: "0.5rem" }}>
                  🏦 Lịch sử giao dịch nạp tiền ACB ({bankHistory.length})
                </h3>
                <div className={styles.tableWrapper}>
                  <table className={styles.ledgerTable}>
                    <thead>
                      <tr>
                        <th>Mã Đơn</th>
                        <th>Thời gian</th>
                        <th>Số tiền (VNĐ)</th>
                        <th>UniPoints</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bankHistory.map((item) => (
                        <tr key={item.id}>
                          <td style={{ fontFamily: "monospace", color: "#38bdf8", fontWeight: 700 }}>
                            {item.order_code}
                          </td>
                          <td style={{ whiteSpace: "nowrap", fontSize: "0.78rem" }}>
                            {new Date(item.created_at * 1000).toLocaleString("vi-VN", {
                              month: "numeric",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            {item.amount_vnd.toLocaleString("vi-VN")} đ
                          </td>
                          <td className={styles.pointsPlus}>
                            +{item.points.toLocaleString("vi-VN")} UP
                          </td>
                          <td>
                            <span className={item.status === "paid" ? styles.badgeVerified : styles.pulseStatus}>
                              {item.status === "paid" ? "✓ Đã thanh toán" : "Đang chờ"}
                            </span>
                          </td>
                          <td>
                            {item.status === "pending" ? (
                              <span style={{ color: "#fbbf24", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                                <span className={styles.pulseDotSmall}></span> Tự động đối soát
                              </span>
                            ) : (
                              <span style={{ color: "#34d399", fontSize: "0.75rem", fontWeight: 600 }}>✓ Hoàn tất</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Ledger Table */}
            <h3 style={{ fontSize: "0.95rem", color: "#a5f3fc", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
              Nhật ký sổ cái UniPoints (Ledger)
            </h3>
            {ledgerLoading ? (
              <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Đang tải lịch sử giao dịch…</p>
            ) : ledger.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Chưa có giao dịch nạp hoặc tiêu điểm nào.</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.ledgerTable}>
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Lý do / Loại</th>
                      <th>Điểm (UP)</th>
                      <th>Bằng chứng Solana</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((item) => (
                      <tr key={item.id}>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {new Date(item.created_at * 1000).toLocaleString("vi-VN", {
                            month: "numeric",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td>{item.reason || item.source_type}</td>
                        <td className={item.delta >= 0 ? styles.pointsPlus : styles.pointsMinus}>
                          {item.delta >= 0 ? `+${item.delta}` : item.delta} UP
                        </td>
                        <td>
                          {item.solana_signature ? (
                            <a
                              href={item.explorer_url || `https://explorer.solana.com/tx/${item.solana_signature}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontFamily: "monospace", fontSize: "0.75rem" }}
                            >
                              {item.solana_signature.slice(0, 4)}…{item.solana_signature.slice(-4)} ↗
                            </a>
                          ) : (
                            <span style={{ color: "#64748b", fontSize: "0.75rem" }}>Nội bộ</span>
                          )}
                        </td>
                        <td>
                          <span className={styles.badgeVerified}>
                            {item.proof_status === "verified" ? "Đã đối soát" : "Ghi nhận"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Global status message & Explorer link */}
        {message && (
          <div
            role="status"
            aria-live="polite"
            style={{
              marginTop: "1.25rem",
              padding: "0.85rem 1rem",
              borderRadius: "10px",
              fontSize: "0.88rem",
              background: message.includes("thành công") || message.includes("✓") || message.includes("🎉")
                ? "rgba(34, 197, 94, 0.15)"
                : message.includes("đang") || message.includes("Chờ")
                ? "rgba(6, 182, 212, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
              border: `1px solid ${
                message.includes("thành công") || message.includes("✓") || message.includes("🎉")
                  ? "rgba(34, 197, 94, 0.4)"
                  : message.includes("đang") || message.includes("Chờ")
                  ? "rgba(6, 182, 212, 0.4)"
                  : "rgba(239, 68, 68, 0.4)"
              }`,
              color: message.includes("thành công") || message.includes("✓") || message.includes("🎉")
                ? "#4ade80"
                : message.includes("đang") || message.includes("Chờ")
                ? "#38bdf8"
                : "#f87171",
            }}
          >
            {message}
          </div>
        )}

        {signature && (
          <div style={{ marginTop: "0.75rem" }}>
            <a
              id="sol-explorer"
              href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "0.85rem", textDecoration: "underline" }}
            >
              Xem chi tiết giao dịch trên Solana Explorer ↗
            </a>
          </div>
        )}

        <p className={styles.note}>
          🔒 Ứng dụng không bao giờ lưu trữ khóa bí mật của ví. Mọi giao dịch nạp SOL đổi UniPoints được kiểm tra và lập chỉ mục tự động qua giao thức Solana Devnet. Sau khi nạp, số điểm UniPoints khả dụng ngay lập tức cho các phiên học tập và hỏi đáp cùng Gia sư AI.
        </p>
      </section>
    </main>
  );
}
