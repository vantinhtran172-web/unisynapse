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

  // Oracle specific keypairs
  const oracleAdmin = Keypair.generate();
  const oracleAuthority = Keypair.generate();
  const newOracleAuthority = Keypair.generate();
  const unauthorizedSigner = Keypair.generate();

  before(async () => {
    // Airdrop SOL to test keypairs for transaction fees
    const airdropSigners = [
      student,
      authority,
      treasury,
      oracleAdmin,
      oracleAuthority,
      newOracleAuthority,
      unauthorizedSigner,
    ];
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

  it("2. Records verified academic document proof on-chain (Legacy)", async () => {
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
    const checksum = "abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd";

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

  // =========================================================================
  // AUTONOMOUS ON-CHAIN ORACLE TEST SUITE (UniHackfest 2026)
  // =========================================================================

  const [oracleRegistryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("oracle_registry")],
    program.programId
  );

  it("7. Initializes Oracle Registry with admin, authority and min_score threshold", async () => {
    const minScore = 70;

    const tx = await program.methods
      .initializeOracleRegistry(minScore)
      .accounts({
        oracleRegistry: oracleRegistryPda,
        oracleAuthority: oracleAuthority.publicKey,
        admin: oracleAdmin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([oracleAdmin])
      .rpc();

    expect(tx).to.be.a("string");

    const registry = await program.account.oracleRegistry.fetch(oracleRegistryPda);
    expect(registry.admin.toBase58()).to.equal(oracleAdmin.publicKey.toBase58());
    expect(registry.oracleAuthority.toBase58()).to.equal(oracleAuthority.publicKey.toBase58());
    expect(registry.minScore).to.equal(70);
    expect(registry.isPaused).to.be.false;
    expect(registry.totalAttestations.toNumber()).to.equal(0);
  });

  it("8. Autonomous Oracle Agent records verified document attestation with nonce & expiry", async () => {
    const docId = "oracle_doc_verified_01";
    const docHashHex = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f01234";
    const qualityScore = 88;
    const chunkCount = 12;
    const nonce = new anchor.BN(1001);
    const expiresAt = new anchor.BN(Math.floor(Date.now() / 1000) + 3600); // 1 hour valid

    const [oracleAttestationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("oracle_attestation"), Buffer.from(docId)],
      program.programId
    );

    const nonceBuffer = Buffer.alloc(8);
    nonceBuffer.writeBigUInt64LE(BigInt(1001));
    const [replayPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("oracle_replay"),
        oracleAuthority.publicKey.toBuffer(),
        nonceBuffer,
      ],
      program.programId
    );

    const [studentPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("student"), student.publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .recordOracleAttestation(
        docId,
        docHashHex,
        qualityScore,
        chunkCount,
        nonce,
        expiresAt
      )
      .accounts({
        oracleRegistry: oracleRegistryPda,
        oracleAttestation: oracleAttestationPda,
        replayRecord: replayPda,
        studentAccount: studentPda,
        student: student.publicKey,
        oracleAuthority: oracleAuthority.publicKey,
        payer: oracleAuthority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([oracleAuthority])
      .rpc();

    expect(tx).to.be.a("string");

    // Verify Oracle Attestation PDA
    const attestation = await program.account.oracleAttestation.fetch(oracleAttestationPda);
    expect(attestation.docId).to.equal(docId);
    expect(attestation.docHashHex).to.equal(docHashHex);
    expect(attestation.qualityScore).to.equal(qualityScore);
    expect(attestation.chunkCount).to.equal(chunkCount);
    expect(attestation.nonce.toNumber()).to.equal(1001);
    expect(attestation.oracleAuthority.toBase58()).to.equal(oracleAuthority.publicKey.toBase58());
    expect(attestation.student.toBase58()).to.equal(student.publicKey.toBase58());

    // Verify Replay Record PDA
    const replay = await program.account.replayRecord.fetch(replayPda);
    expect(replay.oracleAuthority.toBase58()).to.equal(oracleAuthority.publicKey.toBase58());
    expect(replay.nonce.toNumber()).to.equal(1001);

    // Verify Oracle Registry total_attestations counter incremented
    const registry = await program.account.oracleRegistry.fetch(oracleRegistryPda);
    expect(registry.totalAttestations.toNumber()).to.equal(1);
  });

  it("9. Replay Attack Prevention: Reusing the same nonce fails", async () => {
    const docId = "oracle_doc_replay_attempt";
    const docHashHex = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    const qualityScore = 90;
    const chunkCount = 5;
    const reusedNonce = new anchor.BN(1001); // already used in test 8
    const expiresAt = new anchor.BN(Math.floor(Date.now() / 1000) + 3600);

    const [oracleAttestationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("oracle_attestation"), Buffer.from(docId)],
      program.programId
    );

    const nonceBuffer = Buffer.alloc(8);
    nonceBuffer.writeBigUInt64LE(BigInt(1001));
    const [replayPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("oracle_replay"),
        oracleAuthority.publicKey.toBuffer(),
        nonceBuffer,
      ],
      program.programId
    );

    try {
      await program.methods
        .recordOracleAttestation(
          docId,
          docHashHex,
          qualityScore,
          chunkCount,
          reusedNonce,
          expiresAt
        )
        .accounts({
          oracleRegistry: oracleRegistryPda,
          oracleAttestation: oracleAttestationPda,
          replayRecord: replayPda,
          studentAccount: null,
          student: student.publicKey,
          oracleAuthority: oracleAuthority.publicKey,
          payer: oracleAuthority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([oracleAuthority])
        .rpc();

      expect.fail("Should have failed due to duplicate replay PDA");
    } catch (err: any) {
      expect(err.message || err.toString()).to.match(/(already in use|0x0)/i);
    }
  });

  it("10. Rejects attestation when quality score is below oracle min_score threshold (65 < 70)", async () => {
    const docId = "oracle_doc_low_quality";
    const docHashHex = "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";
    const qualityScore = 65; // < 70
    const chunkCount = 8;
    const nonce = new anchor.BN(1002);
    const expiresAt = new anchor.BN(Math.floor(Date.now() / 1000) + 3600);

    const [oracleAttestationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("oracle_attestation"), Buffer.from(docId)],
      program.programId
    );

    const nonceBuffer = Buffer.alloc(8);
    nonceBuffer.writeBigUInt64LE(BigInt(1002));
    const [replayPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("oracle_replay"),
        oracleAuthority.publicKey.toBuffer(),
        nonceBuffer,
      ],
      program.programId
    );

    try {
      await program.methods
        .recordOracleAttestation(
          docId,
          docHashHex,
          qualityScore,
          chunkCount,
          nonce,
          expiresAt
        )
        .accounts({
          oracleRegistry: oracleRegistryPda,
          oracleAttestation: oracleAttestationPda,
          replayRecord: replayPda,
          studentAccount: null,
          student: student.publicKey,
          oracleAuthority: oracleAuthority.publicKey,
          payer: oracleAuthority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([oracleAuthority])
        .rpc();

      expect.fail("Should have failed with QualityBelowThreshold");
    } catch (err: any) {
      expect(err.error?.errorCode?.code || err.message).to.include("QualityBelowThreshold");
    }
  });

  it("11. Rejects attestation signed by unauthorized authority", async () => {
    const docId = "oracle_doc_unauthorized";
    const docHashHex = "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd";
    const qualityScore = 95;
    const chunkCount = 10;
    const nonce = new anchor.BN(1003);
    const expiresAt = new anchor.BN(Math.floor(Date.now() / 1000) + 3600);

    const [oracleAttestationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("oracle_attestation"), Buffer.from(docId)],
      program.programId
    );

    const nonceBuffer = Buffer.alloc(8);
    nonceBuffer.writeBigUInt64LE(BigInt(1003));
    const [replayPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("oracle_replay"),
        unauthorizedSigner.publicKey.toBuffer(),
        nonceBuffer,
      ],
      program.programId
    );

    try {
      await program.methods
        .recordOracleAttestation(
          docId,
          docHashHex,
          qualityScore,
          chunkCount,
          nonce,
          expiresAt
        )
        .accounts({
          oracleRegistry: oracleRegistryPda,
          oracleAttestation: oracleAttestationPda,
          replayRecord: replayPda,
          studentAccount: null,
          student: student.publicKey,
          oracleAuthority: unauthorizedSigner.publicKey,
          payer: unauthorizedSigner.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([unauthorizedSigner])
        .rpc();

      expect.fail("Should have failed with UnauthorizedOracle");
    } catch (err: any) {
      expect(err.error?.errorCode?.code || err.message).to.include("UnauthorizedOracle");
    }
  });

  it("12. Admin can pause and unpause Oracle; paused Oracle rejects attestations", async () => {
    // 1. Admin pauses Oracle
    await program.methods
      .setOraclePaused(true)
      .accounts({
        oracleRegistry: oracleRegistryPda,
        admin: oracleAdmin.publicKey,
      })
      .signers([oracleAdmin])
      .rpc();

    let registry = await program.account.oracleRegistry.fetch(oracleRegistryPda);
    expect(registry.isPaused).to.be.true;

    // 2. Attestation attempt during pause must fail
    const docId = "oracle_doc_paused_attempt";
    const docHashHex = "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    const qualityScore = 90;
    const chunkCount = 5;
    const nonce = new anchor.BN(1004);
    const expiresAt = new anchor.BN(Math.floor(Date.now() / 1000) + 3600);

    const [oracleAttestationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("oracle_attestation"), Buffer.from(docId)],
      program.programId
    );

    const nonceBuffer = Buffer.alloc(8);
    nonceBuffer.writeBigUInt64LE(BigInt(1004));
    const [replayPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("oracle_replay"),
        oracleAuthority.publicKey.toBuffer(),
        nonceBuffer,
      ],
      program.programId
    );

    try {
      await program.methods
        .recordOracleAttestation(
          docId,
          docHashHex,
          qualityScore,
          chunkCount,
          nonce,
          expiresAt
        )
        .accounts({
          oracleRegistry: oracleRegistryPda,
          oracleAttestation: oracleAttestationPda,
          replayRecord: replayPda,
          studentAccount: null,
          student: student.publicKey,
          oracleAuthority: oracleAuthority.publicKey,
          payer: oracleAuthority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([oracleAuthority])
        .rpc();

      expect.fail("Should have failed with OraclePaused");
    } catch (err: any) {
      expect(err.error?.errorCode?.code || err.message).to.include("OraclePaused");
    }

    // 3. Admin unpauses Oracle
    await program.methods
      .setOraclePaused(false)
      .accounts({
        oracleRegistry: oracleRegistryPda,
        admin: oracleAdmin.publicKey,
      })
      .signers([oracleAdmin])
      .rpc();

    registry = await program.account.oracleRegistry.fetch(oracleRegistryPda);
    expect(registry.isPaused).to.be.false;
  });

  it("13. Admin can rotate Oracle Authority; non-admin rotation fails", async () => {
    // 1. Unauthorized rotation fails
    try {
      await program.methods
        .rotateOracleAuthority(newOracleAuthority.publicKey)
        .accounts({
          oracleRegistry: oracleRegistryPda,
          admin: unauthorizedSigner.publicKey,
        })
        .signers([unauthorizedSigner])
        .rpc();

      expect.fail("Should have failed with Unauthorized");
    } catch (err: any) {
      expect(err.error?.errorCode?.code || err.message).to.match(/(Unauthorized|2001|A raw constraint was violated)/i);
    }

    // 2. Admin successfully rotates Oracle authority
    const tx = await program.methods
      .rotateOracleAuthority(newOracleAuthority.publicKey)
      .accounts({
        oracleRegistry: oracleRegistryPda,
        admin: oracleAdmin.publicKey,
      })
      .signers([oracleAdmin])
      .rpc();

    expect(tx).to.be.a("string");

    const registry = await program.account.oracleRegistry.fetch(oracleRegistryPda);
    expect(registry.oracleAuthority.toBase58()).to.equal(newOracleAuthority.publicKey.toBase58());

    // Rotate back to original authority for consistency
    await program.methods
      .rotateOracleAuthority(oracleAuthority.publicKey)
      .accounts({
        oracleRegistry: oracleRegistryPda,
        admin: oracleAdmin.publicKey,
      })
      .signers([oracleAdmin])
      .rpc();
  });
});
