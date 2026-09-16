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

    /// 2. Ghi nhận bằng chứng học liệu học thuật đã qua 6 cổng kiểm định lên Solana Devnet
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

    /// 3. Ghi nhận kết quả đồng thuận gán nhãn dữ liệu (Data Labeling Consensus)
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

    /// 4. Ghi nhận quyết toán cổng On-Ramp VietQR ACB sang SOL Devnet
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
}
