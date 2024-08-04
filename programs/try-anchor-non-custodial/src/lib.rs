use anchor_lang::prelude::*;

declare_id!("GGXycE7WXqPjYcib9T3U5UnMNoV1N58YtTRRXAcjb5ry");

#[program]
pub mod try_anchor_non_custodial {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
