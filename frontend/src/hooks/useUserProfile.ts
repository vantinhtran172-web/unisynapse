import { useState, useEffect, useCallback, useRef } from "react";
import { useConnection, useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getProgram } from "../lib/anchorClient";
import bs58 from "bs58";
import * as nacl from "tweetnacl";
import { PROGRAM_ID } from "../lib/idl";

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

      const accountData = await program.account.userAccount.fetch(userAccountPda);
      
      setProfileData({
        unipoints: accountData.unipoints.toNumber(),
        reputation: accountData.reputationScore,
      });
      setHasProfile(true);
    } catch (err: any) {
      console.log("Account not found or error:", err.message);
      setHasProfile(false);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [publicKey, connection, anchorWallet]);

  // Step 1: SIWS (Sign In With Solana)
  const verifyWallet = useCallback(async () => {
    if (!publicKey) {
      alert("Public key not found");
      return;
    }
    if (!signMessage) {
      alert("Wallet does not support signMessage");
      return;
    }
    try {
      setIsVerifying(true);
      const message = new TextEncoder().encode(`Sign this message to authenticate with UniSynapse.\nTimestamp: ${Date.now()}`);
      const signature = await signMessage(message);
      
      // Verify signature
      let valid = false;
      try {
        valid = nacl.sign.detached.verify(message, signature, publicKey.toBytes());
      } catch (naclErr: any) {
        alert("nacl error: " + naclErr.message);
        console.error(naclErr);
        return;
      }
      
      if (valid) {
        setIsVerified(true);
        // Call fetch immediately
        fetchProfile();
      } else {
        alert("Invalid signature!");
      }
    } catch (err: any) {
      console.error("SIWS error:", err);
      if (err.message && !err.message.includes("User rejected")) {
        alert("Phantom error: " + err.message + "\nBypassing signature for demo purposes.");
        setIsVerified(true);
        fetchProfile();
      }
    } finally {
      setIsVerifying(false);
    }
  }, [publicKey, signMessage, fetchProfile]);

  // Reset state on disconnect
  useEffect(() => {
    if (!connected) {
      setIsVerified(false);
      setProfileData(null);
      setHasProfile(false);
    }
  }, [connected]);

  // Fetch when verified
  useEffect(() => {
    if (isVerified) {
      fetchProfile();
    }
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
          data: typeof Buffer !== "undefined" ? Buffer.from([111, 17, 185, 250, 60, 122, 38, 254]) : (new Uint8Array([111, 17, 185, 250, 60, 122, 38, 254]) as any)
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
      } catch (txErr: any) {
        console.warn("Transaction failed (contract likely not deployed):", txErr);
        alert("Cảnh báo: Smart Contract chưa được Deploy lên Devnet!\nHệ thống sẽ tự động chuyển sang chế độ Mô phỏng (Mock Data) để bạn có thể tiếp tục xem UI.");
        setProfileData({
          unipoints: 0,
          reputation: 100, // starting reputation
        });
        setHasProfile(true);
      }
    } catch (err: any) {
      console.error("Initialize error:", err);
      alert("Failed to initialize: " + err.message);
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
