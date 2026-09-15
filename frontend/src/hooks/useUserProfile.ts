import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Buffer } from "buffer";
import bs58 from "bs58";
import { getProgram } from "../lib/anchorClient";
import { PROGRAM_ID } from "../lib/idl";
import { api } from "../lib/api";

export function useUserProfile() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { publicKey, signMessage, connected } = wallet;

  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [profileData, setProfileData] = useState<{ unipoints: number; reputation: number } | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Step 3: Fetch Data from PDA
  const fetchProfile = useCallback(async () => {
    if (!publicKey || !anchorWallet) return;
    setIsLoadingProfile(true);
    try {
      const program = getProgram(connection, anchorWallet);
      
      // Find PDA (avoid Buffer in browser)
      const [userAccountPda] = PublicKey.findProgramAddressSync(
        [new TextEncoder().encode("user"), publicKey.toBytes()],
        new PublicKey(PROGRAM_ID)
      );

      const accountNamespace = program.account as unknown as {
        userAccount: { fetch: (address: PublicKey) => Promise<{ unipoints: { toNumber: () => number }; reputationScore: number }> };
      };
      const accountData = await accountNamespace.userAccount.fetch(userAccountPda);
      
      setProfileData({
        unipoints: accountData.unipoints.toNumber(),
        reputation: accountData.reputationScore,
      });
      setHasProfile(true);
    } catch (err: unknown) {
      console.log("Account not found or error:", err instanceof Error ? err.message : err);
      setHasProfile(false);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [publicKey, connection, anchorWallet]);

  // Step 1: SIWS (Sign In With Solana) - Link wallet to authenticated account
  const verifyWallet = useCallback(async () => {
    if (!publicKey) {
      alert("Chưa kết nối ví Phantom. Vui lòng kết nối ví trước.");
      return;
    }
    if (!signMessage) {
      alert("Ví của bạn không hỗ trợ ký message. Vui lòng dùng ví Phantom chính thức.");
      return;
    }
    try {
      setIsVerifying(true);
      const walletAddress = publicKey.toBase58();
      const challenge = await api.challengeWallet(walletAddress);
      const messageBytes = new TextEncoder().encode(challenge.message);
      const signature = await signMessage(messageBytes);
      const res = await api.verifyWallet(
        walletAddress,
        challenge.nonce,
        challenge.message,
        bs58.encode(signature),
      );
      setIsVerified(true);
      await fetchProfile();
      return res;
    } catch (err: unknown) {
      console.error("SIWS error:", err);
      const errorMessage = err instanceof Error ? err.message : "Lỗi xác thực ví";
      if (errorMessage.includes("Member authentication required") || errorMessage.includes("401")) {
        alert("Ràng buộc bảo mật: Bạn cần có tài khoản và đăng nhập trước khi liên kết ví Phantom.");
      } else if (!errorMessage.toLowerCase().includes("user rejected")) {
        alert(`Không thể liên kết ví: ${errorMessage}`);
      }
      throw err;
    } finally {
      setIsVerifying(false);
    }
  }, [publicKey, signMessage, fetchProfile]);

  // Reset state on disconnect
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!connected) {
        setIsVerified(false);
        setProfileData(null);
        setHasProfile(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [connected]);

  // Fetch when verified
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (active && isVerified) void fetchProfile();
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [isVerified, fetchProfile]);

  // Step 2 & 4: Initialize Profile
  const initializeProfile = async () => {
    if (!publicKey || !anchorWallet) return;
    setIsInitializing(true);
    try {
      const [userAccountPda] = PublicKey.findProgramAddressSync(
        [new TextEncoder().encode("user"), publicKey.toBytes()],
        new PublicKey(PROGRAM_ID)
      );

      // Manual transaction bypasses Anchor _bn compatibility issues
      const { Transaction, TransactionInstruction } = await import("@solana/web3.js");
      const tx = new Transaction().add(
        new TransactionInstruction({
          programId: new PublicKey(PROGRAM_ID),
          keys: [
            { pubkey: userAccountPda, isSigner: false, isWritable: true },
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          // Instruction discriminator for global:initialize_user
          data: Buffer.from([111, 17, 185, 250, 60, 122, 38, 254])
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;
      
      try {
        const signedTx = await anchorWallet.signTransaction(tx);
        const signature = await connection.sendRawTransaction(signedTx.serialize());
        await connection.confirmTransaction(signature, 'processed');
        // Refetch after initialize
        await fetchProfile();
      } catch (txErr: unknown) {
        console.warn("Transaction failed (contract likely not deployed):", txErr);
        alert("Cảnh báo: Smart Contract chưa được Deploy lên Devnet!\nHệ thống sẽ tự động chuyển sang chế độ Mô phỏng (Mock Data) để bạn có thể tiếp tục xem UI.");
        setProfileData({
          unipoints: 0,
          reputation: 100, // starting reputation
        });
        setHasProfile(true);
      }
    } catch (err: unknown) {
      console.error("Initialize error:", err);
      alert("Failed to initialize: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsInitializing(false);
    }
  };

  return {
    isVerified,
    isVerifying,
    verifyWallet,
    profileData,
    hasProfile,
    isLoadingProfile,
    initializeProfile,
    isInitializing
  };
}
