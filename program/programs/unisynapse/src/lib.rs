use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod unisynapse {
    use super::*;

    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        user_account.owner = ctx.accounts.signer.key();
        user_account.unipoints = 0;
        user_account.reputation_score = 0;
        Ok(())
    }

    pub fn record_contribution(
        ctx: Context<RecordContribution>,
        task_id: String,
        contribution_type: String,
        quality_score: u8,
        data_hash: String,
    ) -> Result<()> {
        let contribution = &mut ctx.accounts.contribution;
        contribution.owner = ctx.accounts.signer.key();
        contribution.task_id = task_id;
        contribution.contribution_type = contribution_type;
        contribution.quality_score = quality_score;
        contribution.data_hash = data_hash;

        let user_account = &mut ctx.accounts.user_account;
        
        // Simple logic to reward points and reputation based on quality
        let points_reward = (quality_score as u64) * 10;
        user_account.unipoints = user_account.unipoints.checked_add(points_reward).unwrap();
        user_account.reputation_score = user_account.reputation_score.checked_add(quality_score as u32).unwrap();

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + 32 + 8 + 4,
        seeds = [b"user", signer.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(task_id: String)]
pub struct RecordContribution<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + 32 + 4 + 32 + 4 + 32 + 1 + 4 + 64, // Approximated space
        seeds = [b"contribution", signer.key().as_ref(), task_id.as_bytes()],
        bump
    )]
    pub contribution: Account<'info, Contribution>,
    
    #[account(
        mut,
        seeds = [b"user", signer.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserAccount {
    pub owner: Pubkey,
    pub unipoints: u64,
    pub reputation_score: u32,
}

#[account]
pub struct Contribution {
    pub owner: Pubkey,
    pub task_id: String,
    pub contribution_type: String,
    pub quality_score: u8,
    pub data_hash: String,
}
