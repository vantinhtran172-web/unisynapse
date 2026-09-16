import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";

describe("UniSynapse Solana Anchor Program - UniHackfest 2026", () => {
  // Configure the client to use the local cluster or devnet provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // IDL program interface
  const program = anchor.workspace.Unisynapse as Program<any>;

  const student = Keypair.generate();
  const authority = Keypair.generate();
  const treasury = Keypair.generate();
  const recipient = Keypair.generate();

  before(async () => {
    // Airdrop SOL to test keypairs for transaction fees
    const airdropSigners = [student, authority, treasury];
    for (const signer of airdropSigners) {
      try {
        const sig = await provider.connection.requestAirdrop(
          signer.publicKey,
          2 * anchor.web3.LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(sig, "confirmed");
      } catch (err) {
        // Fallback if localnet or provider wallet pays
      }
    }
  });

  it("1. Initializes a decentralized student academic account (PDA)", async () => {
    const [studentPda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("student"), student.publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .initializeStudent()
      .accounts({
        studentAccount: studentPda,
        signer: student.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([student])
      .rpc();

    expect(tx).to.be.a("string");

    // Fetch and verify on-chain PDA account data
    const account = await program.account.studentAccount.fetch(studentPda);
    expect(account.owner.toBase58()).to.equal(student.publicKey.toBase58());
    expect(account.unipoints.toNumber()).to.equal(0);
    expect(account.reputationScore).to.equal(100);
    expect(account.totalDocuments).to.equal(0);
    expect(account.totalTasksCompleted).to.equal(0);
    expect(account.bump).to.equal(bump);
  });

  it("2. Records verified academic document proof on-chain", async () => {
    const docId = "doc_test_uuid_42";
    const checksumSha256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const qualityScore = 92;
    const chunkCount = 14;

    const [studentPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("student"), student.publicKey.toBuffer()],
      program.programId
    );

    const [proofPda, proofBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("doc_proof"),
        student.publicKey.toBuffer(),
        Buffer.from(docId),
      ],
      program.programId
    );

    const tx = await program.methods
      .recordAcademicProof(docId, checksumSha256, qualityScore, chunkCount)
      .accounts({
        academicProof: proofPda,
        studentAccount: studentPda,
        signer: student.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([student])
      .rpc();

    expect(tx).to.be.a("string");

    // Verify proof on-chain data
    const proofAccount = await program.account.academicProofAccount.fetch(proofPda);
    expect(proofAccount.owner.toBase58()).to.equal(student.publicKey.toBase58());
    expect(proofAccount.docId).to.equal(docId);
    expect(proofAccount.checksumSha256).to.equal(checksumSha256);
    expect(proofAccount.qualityScore).to.equal(qualityScore);
    expect(proofAccount.chunkCount).to.equal(chunkCount);

    // Verify student account received UniPoints & Reputation reward
    const updatedStudent = await program.account.studentAccount.fetch(studentPda);
    expect(updatedStudent.totalDocuments).to.equal(1);
    expect(updatedStudent.unipoints.toNumber()).to.equal(50);
    expect(updatedStudent.reputationScore).to.equal(105);
  });

  it("3. Rejects academic proof with invalid quality score (> 100)", async () => {
    const docId = "doc_invalid_score";
    const checksum = "abcd1234abcd1234abcd1234abcd1234";

    const [studentPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("student"), student.publicKey.toBuffer()],
      program.programId
    );

    const [proofPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("doc_proof"), student.publicKey.toBuffer(), Buffer.from(docId)],
      program.programId
    );

    try {
      await program.methods
        .recordAcademicProof(docId, checksum, 105, 5)
        .accounts({
          academicProof: proofPda,
          studentAccount: studentPda,
          signer: student.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([student])
        .rpc();

      expect.fail("Should have failed with InvalidQualityScore");
    } catch (err: any) {
      expect(err.error?.errorCode?.code || err.message).to.include("InvalidQualityScore");
    }
  });

  it("4. Records data labeling consensus proof when threshold >= 80%", async () => {
    const taskId = "task_consensus_99";
    const winningLabel = "Tích cực (Positive)";
    const confidenceBps = 8500; // 85.0%
    const totalVotes = 7;

    const [consensusPda, consensusBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("consensus"), Buffer.from(taskId)],
      program.programId
    );

    const tx = await program.methods
      .recordLabelingConsensus(taskId, winningLabel, confidenceBps, totalVotes)
      .accounts({
        consensusProof: consensusPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    expect(tx).to.be.a("string");

    const consensusAccount = await program.account.consensusProofAccount.fetch(consensusPda);
    expect(consensusAccount.taskId).to.equal(taskId);
    expect(consensusAccount.winningLabel).to.equal(winningLabel);
    expect(consensusAccount.confidenceBps).to.equal(confidenceBps);
    expect(consensusAccount.totalVotes).to.equal(totalVotes);
    expect(consensusAccount.authority.toBase58()).to.equal(authority.publicKey.toBase58());
    expect(consensusAccount.bump).to.equal(consensusBump);
  });

  it("5. Rejects consensus proof when confidence is below 80% (8000 bps)", async () => {
    const taskId = "task_low_confidence";
    const winningLabel = "Trung tính";
    const confidenceBps = 7500; // 75.0% < 80.0% threshold
    const totalVotes = 4;

    const [consensusPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("consensus"), Buffer.from(taskId)],
      program.programId
    );

    try {
      await program.methods
        .recordLabelingConsensus(taskId, winningLabel, confidenceBps, totalVotes)
        .accounts({
          consensusProof: consensusPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      expect.fail("Should have failed with ConfidenceBelowThreshold");
    } catch (err: any) {
      expect(err.error?.errorCode?.code || err.message).to.include("ConfidenceBelowThreshold");
    }
  });

  it("6. Records Fiat On-Ramp settlement (VietQR ACB -> SOL Devnet)", async () => {
    const orderCode = "UP2PLPZ";
    const amountVnd = new anchor.BN(20000); // 20.000 VNĐ
    const lamportsSol = new anchor.BN(120_000_000); // 0.12 SOL

    const [onrampPda, onrampBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("onramp"), Buffer.from(orderCode)],
      program.programId
    );

    const tx = await program.methods
      .recordFiatOnrampSettlement(
        orderCode,
        amountVnd,
        lamportsSol,
        recipient.publicKey
      )
      .accounts({
        onrampRecord: onrampPda,
        treasuryAuthority: treasury.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([treasury])
      .rpc();

    expect(tx).to.be.a("string");

    const onrampAccount = await program.account.fiatOnRampAccount.fetch(onrampPda);
    expect(onrampAccount.orderCode).to.equal(orderCode);
    expect(onrampAccount.amountVnd.toString()).to.equal(amountVnd.toString());
    expect(onrampAccount.lamportsSol.toString()).to.equal(lamportsSol.toString());
    expect(onrampAccount.recipient.toBase58()).to.equal(recipient.publicKey.toBase58());
    expect(onrampAccount.treasury.toBase58()).to.equal(treasury.publicKey.toBase58());
    expect(onrampAccount.bump).to.equal(onrampBump);
  });
});
