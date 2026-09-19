use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod unisynapse {
    use super::*;

    /// 1. Khởi tạo tài khoản học tập phi tập trung cho sinh viên
    pub fn initialize_student(ctx: Context<InitializeStudent>) -> Result<()> {
        let student = &mut ctx.accounts.student_account;
        student.owner = ctx.accounts.signer.key();
        student.unipoints = 0;
        student.reputation_score = 100; // Điểm uy tín ban đầu
        student.total_documents = 0;
        student.total_tasks_completed = 0;
        student.registered_at = Clock::get()?.unix_timestamp;
        student.bump = ctx.bumps.student_account;

        emit!(StudentRegistered {
            student: student.owner,
            timestamp: student.registered_at,
        });
        Ok(())
    }

    /// 2. Ghi nhận bằng chứng học liệu học thuật đã qua 6 cổng kiểm định lên Solana Devnet (Legacy)
    pub fn record_academic_proof(
        ctx: Context<RecordAcademicProof>,
        doc_id: String,
        checksum_sha256: String,
        quality_score: u8,
        chunk_count: u16,
    ) -> Result<()> {
        require!(quality_score <= 100, UniSynapseError::InvalidQualityScore);

        let proof = &mut ctx.accounts.academic_proof;
        let clock = Clock::get()?;

        proof.owner = ctx.accounts.signer.key();
        proof.doc_id = doc_id.clone();
        proof.checksum_sha256 = checksum_sha256.clone();
        proof.quality_score = quality_score;
        proof.chunk_count = chunk_count;
        proof.verified_at = clock.unix_timestamp;
        proof.bump = ctx.bumps.academic_proof;

        // Cập nhật chỉ số và điểm thưởng cho sinh viên
        let student = &mut ctx.accounts.student_account;
        student.total_documents = student.total_documents.checked_add(1).ok_or(UniSynapseError::ArithmeticOverflow)?;
        student.unipoints = student.unipoints.checked_add(50).ok_or(UniSynapseError::ArithmeticOverflow)?;
        student.reputation_score = student.reputation_score.checked_add(5).ok_or(UniSynapseError::ArithmeticOverflow)?;

        emit!(AcademicProofAnchored {
            student: ctx.accounts.signer.key(),
            doc_id,
            checksum: checksum_sha256,
            quality_score,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// 3. Khởi tạo Oracle Registry cho mạng lưới Autonomous Oracle
    pub fn initialize_oracle_registry(
        ctx: Context<InitializeOracleRegistry>,
        min_score: u8,
    ) -> Result<()> {
        require!(min_score <= 100, UniSynapseError::InvalidQualityScore);

        let registry = &mut ctx.accounts.oracle_registry;
        registry.admin = ctx.accounts.admin.key();
        registry.oracle_authority = ctx.accounts.oracle_authority.key();
        registry.min_score = min_score;
        registry.is_paused = false;
        registry.total_attestations = 0;
        registry.bump = ctx.bumps.oracle_registry;

        emit!(OracleRegistryInitialized {
            admin: registry.admin,
            oracle_authority: registry.oracle_authority,
            min_score,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// 4. Luân chuyển / Cập nhật khóa Oracle Authority (Admin only)
    pub fn rotate_oracle_authority(
        ctx: Context<ManageOracleRegistry>,
        new_oracle_authority: Pubkey,
    ) -> Result<()> {
        let registry = &mut ctx.accounts.oracle_registry;
        let old_authority = registry.oracle_authority;
        registry.oracle_authority = new_oracle_authority;

        emit!(OracleAuthorityRotated {
            admin: registry.admin,
            old_authority,
            new_authority: new_oracle_authority,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// 5. Tạm dừng hoặc kích hoạt lại Oracle Registry (Admin only)
    pub fn set_oracle_paused(
        ctx: Context<ManageOracleRegistry>,
        paused: bool,
    ) -> Result<()> {
        let registry = &mut ctx.accounts.oracle_registry;
        registry.is_paused = paused;

        emit!(OraclePausedStateChanged {
            admin: registry.admin,
            is_paused: paused,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// 6. Ghi nhận chứng thực Autonomous On-Chain Oracle Attestation (P0 Core)
    pub fn record_oracle_attestation(
        ctx: Context<RecordOracleAttestation>,
        doc_id: String,
        doc_hash_hex: String,
        quality_score: u8,
        chunk_count: u16,
        nonce: u64,
        expires_at: i64,
    ) -> Result<()> {
        let registry = &mut ctx.accounts.oracle_registry;

        // 1. Kiểm tra trạng thái tạm dừng
        require!(!registry.is_paused, UniSynapseError::OraclePaused);

        // 2. Kiểm tra quyền ký của Oracle Agent
        require_keys_eq!(
            ctx.accounts.oracle_authority.key(),
            registry.oracle_authority,
            UniSynapseError::UnauthorizedOracle
        );

        // 3. Kiểm tra định dạng đầu vào
        require!(!doc_id.is_empty() && doc_id.len() <= 64, UniSynapseError::InvalidDocId);
        require!(doc_hash_hex.len() == 64, UniSynapseError::InvalidHashLength);

        // 4. Kiểm tra điểm chất lượng và ngưỡng tối thiểu
        require!(quality_score <= 100, UniSynapseError::InvalidQualityScore);
        require!(quality_score >= registry.min_score, UniSynapseError::QualityBelowThreshold);

        // 5. Kiểm tra thời hạn hiệu lực của chứng thực (Nonce + Expiry)
        let clock = Clock::get()?;
        require!(clock.unix_timestamp <= expires_at, UniSynapseError::AttestationExpired);

        // 6. Ghi dữ liệu vào ReplayRecord để chống replay attack
        let replay = &mut ctx.accounts.replay_record;
        replay.oracle_authority = ctx.accounts.oracle_authority.key();
        replay.nonce = nonce;
        replay.timestamp = clock.unix_timestamp;
        replay.bump = ctx.bumps.replay_record;

        // 7. Ghi dữ liệu vào OracleAttestation PDA
        let attestation = &mut ctx.accounts.oracle_attestation;
        attestation.doc_id = doc_id.clone();
        attestation.doc_hash_hex = doc_hash_hex.clone();
        attestation.quality_score = quality_score;
        attestation.chunk_count = chunk_count;
        attestation.nonce = nonce;
        attestation.verified_at = clock.unix_timestamp;
        attestation.expires_at = expires_at;
        attestation.oracle_authority = ctx.accounts.oracle_authority.key();
        attestation.student = ctx.accounts.student.key();
        attestation.bump = ctx.bumps.oracle_attestation;

        // 8. Tăng tổng số chứng thực thành công
        registry.total_attestations = registry
            .total_attestations
            .checked_add(1)
            .ok_or(UniSynapseError::ArithmeticOverflow)?;

        // 9. Cập nhật hồ sơ sinh viên (nếu có tài khoản)
        if let Some(student_acc) = &mut ctx.accounts.student_account {
            student_acc.total_documents = student_acc
                .total_documents
                .checked_add(1)
                .ok_or(UniSynapseError::ArithmeticOverflow)?;
            // Khuyến nghị đã duyệt P0: Agent ghi eligibility/proposal, không trực tiếp phát thưởng SOL/tokens tại đây
        }

        emit!(OracleAttestationRecorded {
            doc_id,
            doc_hash: doc_hash_hex,
            quality_score,
            chunk_count,
            oracle: ctx.accounts.oracle_authority.key(),
            student: ctx.accounts.student.key(),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// 7. Ghi nhận kết quả đồng thuận gán nhãn dữ liệu (Data Labeling Consensus)
    pub fn record_labeling_consensus(
        ctx: Context<RecordLabelingConsensus>,
        task_id: String,
        winning_label: String,
        confidence_bps: u16, // Basis points: 8000 = 80.0%
        total_votes: u32,
    ) -> Result<()> {
        require!(confidence_bps >= 8000, UniSynapseError::ConfidenceBelowThreshold);

        let consensus = &mut ctx.accounts.consensus_proof;
        let clock = Clock::get()?;

        consensus.task_id = task_id.clone();
        consensus.winning_label = winning_label.clone();
        consensus.confidence_bps = confidence_bps;
        consensus.total_votes = total_votes;
        consensus.finalized_at = clock.unix_timestamp;
        consensus.authority = ctx.accounts.authority.key();
        consensus.bump = ctx.bumps.consensus_proof;

        emit!(ConsensusFinalized {
            task_id,
            winning_label,
            confidence_bps,
            total_votes,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// 8. Ghi nhận quyết toán cổng On-Ramp VietQR ACB sang SOL Devnet
    pub fn record_fiat_onramp_settlement(
        ctx: Context<RecordFiatOnRamp>,
        order_code: String,
        amount_vnd: u64,
        lamports_sol: u64,
        recipient: Pubkey,
    ) -> Result<()> {
        let onramp = &mut ctx.accounts.onramp_record;
        let clock = Clock::get()?;

        onramp.order_code = order_code.clone();
        onramp.amount_vnd = amount_vnd;
        onramp.lamports_sol = lamports_sol;
        onramp.recipient = recipient;
        onramp.treasury = ctx.accounts.treasury_authority.key();
        onramp.settled_at = clock.unix_timestamp;
        onramp.bump = ctx.bumps.onramp_record;

        emit!(FiatOnRampSettled {
            order_code,
            amount_vnd,
            lamports_sol,
            recipient,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }
}

// -----------------------------------------------------------------------------
// ACCOUNT VALIDATION CONTEXTS
// -----------------------------------------------------------------------------

#[derive(Accounts)]
pub struct InitializeStudent<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + 32 + 8 + 4 + 4 + 4 + 8 + 1,
        seeds = [b"student", signer.key().as_ref()],
        bump
    )]
    pub student_account: Account<'info, StudentAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeOracleRegistry<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 32 + 1 + 1 + 8 + 1 + 32,
        seeds = [b"oracle_registry"],
        bump
    )]
    pub oracle_registry: Account<'info, OracleRegistry>,

    /// CHECK: The authority used by the Oracle worker agent to sign attestations
    pub oracle_authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ManageOracleRegistry<'info> {
    #[account(
        mut,
        seeds = [b"oracle_registry"],
        bump = oracle_registry.bump,
        has_one = admin @ UniSynapseError::Unauthorized
    )]
    pub oracle_registry: Account<'info, OracleRegistry>,

    pub admin: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(doc_id: String, doc_hash_hex: String, quality_score: u8, chunk_count: u16, nonce: u64)]
pub struct RecordOracleAttestation<'info> {
    #[account(
        mut,
        seeds = [b"oracle_registry"],
        bump = oracle_registry.bump
    )]
    pub oracle_registry: Account<'info, OracleRegistry>,

    #[account(
        init,
        payer = payer,
        space = 8 + (4 + 64) + (4 + 64) + 1 + 2 + 8 + 8 + 8 + 32 + 32 + 1,
        seeds = [b"oracle_attestation", doc_id.as_bytes()],
        bump
    )]
    pub oracle_attestation: Account<'info, OracleAttestation>,

    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 8 + 8 + 1,
        seeds = [b"oracle_replay", oracle_authority.key().as_ref(), nonce.to_le_bytes().as_ref()],
        bump
    )]
    pub replay_record: Account<'info, ReplayRecord>,

    #[account(
        mut,
        seeds = [b"student", student.key().as_ref()],
        bump = student_account.bump
    )]
    pub student_account: Option<Account<'info, StudentAccount>>,

    /// CHECK: The student associated with this document
    pub student: UncheckedAccount<'info>,

    /// Autonomous Oracle Agent signing authority
    pub oracle_authority: Signer<'info>,

    /// Account paying for rent exemption (Oracle Agent or Admin treasury)
    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(doc_id: String)]
pub struct RecordAcademicProof<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + 32 + (4 + 64) + (4 + 64) + 1 + 2 + 8 + 1,
        seeds = [b"doc_proof", signer.key().as_ref(), doc_id.as_bytes()],
        bump
    )]
    pub academic_proof: Account<'info, AcademicProofAccount>,

    #[account(
        mut,
        seeds = [b"student", signer.key().as_ref()],
        bump = student_account.bump
    )]
    pub student_account: Account<'info, StudentAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(task_id: String)]
pub struct RecordLabelingConsensus<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + (4 + 64) + (4 + 64) + 2 + 4 + 8 + 32 + 1,
        seeds = [b"consensus", task_id.as_bytes()],
        bump
    )]
    pub consensus_proof: Account<'info, ConsensusProofAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(order_code: String)]
pub struct RecordFiatOnRamp<'info> {
    #[account(
        init,
        payer = treasury_authority,
        space = 8 + (4 + 32) + 8 + 8 + 32 + 32 + 8 + 1,
        seeds = [b"onramp", order_code.as_bytes()],
        bump
    )]
    pub onramp_record: Account<'info, FiatOnRampAccount>,

    #[account(mut)]
    pub treasury_authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// -----------------------------------------------------------------------------
// DATA STATE STRUCTURES
// -----------------------------------------------------------------------------

#[account]
pub struct OracleRegistry {
    pub admin: Pubkey,
    pub oracle_authority: Pubkey,
    pub min_score: u8,
    pub is_paused: bool,
    pub total_attestations: u64,
    pub bump: u8,
    pub _reserved: [u8; 32],
}

#[account]
pub struct OracleAttestation {
    pub doc_id: String,
    pub doc_hash_hex: String,
    pub quality_score: u8,
    pub chunk_count: u16,
    pub nonce: u64,
    pub verified_at: i64,
    pub expires_at: i64,
    pub oracle_authority: Pubkey,
    pub student: Pubkey,
    pub bump: u8,
}

#[account]
pub struct ReplayRecord {
    pub oracle_authority: Pubkey,
    pub nonce: u64,
    pub timestamp: i64,
    pub bump: u8,
}

#[account]
pub struct StudentAccount {
    pub owner: Pubkey,
    pub unipoints: u64,
    pub reputation_score: u32,
    pub total_documents: u32,
    pub total_tasks_completed: u32,
    pub registered_at: i64,
    pub bump: u8,
}

#[account]
pub struct AcademicProofAccount {
    pub owner: Pubkey,
    pub doc_id: String,
    pub checksum_sha256: String,
    pub quality_score: u8,
    pub chunk_count: u16,
    pub verified_at: i64,
    pub bump: u8,
}

#[account]
pub struct ConsensusProofAccount {
    pub task_id: String,
    pub winning_label: String,
    pub confidence_bps: u16,
    pub total_votes: u32,
    pub finalized_at: i64,
    pub authority: Pubkey,
    pub bump: u8,
}

#[account]
pub struct FiatOnRampAccount {
    pub order_code: String,
    pub amount_vnd: u64,
    pub lamports_sol: u64,
    pub recipient: Pubkey,
    pub treasury: Pubkey,
    pub settled_at: i64,
    pub bump: u8,
}

// -----------------------------------------------------------------------------
// EVENTS
// -----------------------------------------------------------------------------

#[event]
pub struct OracleRegistryInitialized {
    pub admin: Pubkey,
    pub oracle_authority: Pubkey,
    pub min_score: u8,
    pub timestamp: i64,
}

#[event]
pub struct OracleAuthorityRotated {
    pub admin: Pubkey,
    pub old_authority: Pubkey,
    pub new_authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct OraclePausedStateChanged {
    pub admin: Pubkey,
    pub is_paused: bool,
    pub timestamp: i64,
}

#[event]
pub struct OracleAttestationRecorded {
    pub doc_id: String,
    pub doc_hash: String,
    pub quality_score: u8,
    pub chunk_count: u16,
    pub oracle: Pubkey,
    pub student: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct StudentRegistered {
    pub student: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct AcademicProofAnchored {
    pub student: Pubkey,
    pub doc_id: String,
    pub checksum: String,
    pub quality_score: u8,
    pub timestamp: i64,
}

#[event]
pub struct ConsensusFinalized {
    pub task_id: String,
    pub winning_label: String,
    pub confidence_bps: u16,
    pub total_votes: u32,
    pub timestamp: i64,
}

#[event]
pub struct FiatOnRampSettled {
    pub order_code: String,
    pub amount_vnd: u64,
    pub lamports_sol: u64,
    pub recipient: Pubkey,
    pub timestamp: i64,
}

// -----------------------------------------------------------------------------
// CUSTOM ERROR CODES
// -----------------------------------------------------------------------------

#[error_code]
pub enum UniSynapseError {
    #[msg("Điểm chất lượng học thuật phải nằm trong khoảng từ 0 đến 100.")]
    InvalidQualityScore,
    #[msg("Độ tin cậy chưa đạt ngưỡng đồng thuận tối thiểu (80%).")]
    ConfidenceBelowThreshold,
    #[msg("Lỗi tràn số học.")]
    ArithmeticOverflow,
    #[msg("Không có quyền thực hiện thao tác này.")]
    Unauthorized,
    #[msg("Hệ thống Oracle đang tạm dừng bảo trì.")]
    OraclePaused,
    #[msg("Chữ ký không khớp với Oracle Authority đã đăng ký.")]
    UnauthorizedOracle,
    #[msg("Điểm chất lượng chưa đạt ngưỡng tối thiểu của Oracle.")]
    QualityBelowThreshold,
    #[msg("Mã tài liệu không hợp lệ hoặc vượt quá độ dài cho phép (1-64 ký tự).")]
    InvalidDocId,
    #[msg("Độ dài mã băm SHA-256 không hợp lệ (yêu cầu đúng 64 ký tự hex).")]
    InvalidHashLength,
    #[msg("Chứng thực Oracle đã quá hạn hiệu lực.")]
    AttestationExpired,
}
