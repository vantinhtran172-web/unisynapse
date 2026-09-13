import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { IDL, PROGRAM_ID } from "./idl";
import { AnchorWallet } from "@solana/wallet-adapter-react";

export const getProgram = (connection: Connection, wallet: AnchorWallet) => {
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "processed",
  });
  
  const idlWithAddress = { ...IDL, address: PROGRAM_ID };
  
  try {
    // Anchor 0.30+ signature
    return new (Program as any)(idlWithAddress, provider);
  } catch (e) {
    // Anchor 0.29.x signature
    return new (Program as any)(IDL, new PublicKey(PROGRAM_ID), provider);
  }
};
