"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import bs58 from "bs58";
import { Buffer } from "buffer";
import { api, LedgerEntry } from "@/lib/api";
import { useAppState } from "@/context/AppStateContext";
import styles from "./wallet.module.css";

const DEVNET = "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG";

type Review = { sender: string; recipient: string; amount: string; lamports: bigint; fee: number };

const PRESETS = [
  { sol: "0.08", points: 80, desc: "1 lượt hỏi AI" },
  { sol: "0.24", points: 240, desc: "3 lượt hỏi AI" },
  { sol: "0.50", points: 500, desc: "6 lượt hỏi AI" },
  { sol: "1.00", points: 1000, desc: "12 lượt hỏi AI" },
];

export default function WalletPage() {
  const router = useRouter();
  const { connection } = useConnection();
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const { refreshState, user } = useAppState();

  const [activeTab, setActiveTab] = useState<"deposit" | "transfer" | "history">("deposit");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("0.08");
  const [selectedPreset, setSelectedPreset] = useState<string | null>("0.08");
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
    } catch {
      /* ignore */
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#030712", border: "1px solid #06b6d4", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#22d3ee", fontSize: "10px" }}>WIT</div>
            <Link href="/" style={{ color: "#06b6d4", textDecoration: "none", fontWeight: 700, fontSize: "0.875rem" }}>← UniSynapse</Link>
          </div>
          <span className={styles.badge}>SOLANA DEVNET · THỬ NGHIỆM</span>
        </div>

        {!user && (
          <div style={{ padding: "0.75rem 1rem", borderRadius: "8px", background: "rgba(6, 182, 212, 0.15)", border: "1px solid rgba(6, 182, 212, 0.4)", color: "#22d3ee", margin: "1rem 0", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <span>⚡ <strong>Sign-in With Solana:</strong> Kết nối ví Phantom và bấm "Xác thực ví" để đăng nhập hoặc nhận ngay 100 UP khởi đầu.</span>
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
            className={`${styles.tabBtn} ${activeTab === "deposit" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("deposit")}
          >
            💎 Nạp UniPoints (Đổi SOL)
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
