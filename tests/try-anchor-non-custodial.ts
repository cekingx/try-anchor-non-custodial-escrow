import * as anchor from "@coral-xyz/anchor"
import * as splToken from "@solana/spl-token"
import { Program } from "@coral-xyz/anchor"
import { TryAnchorNonCustodial } from "../target/types/try_anchor_non_custodial"

describe("try-anchor-non-custodial", () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const program = anchor.workspace.TryAnchorNonCustodial as Program<TryAnchorNonCustodial>

  const payer = (provider.wallet as any).payer
  const seller = anchor.web3.Keypair.generate()
  const buyer = anchor.web3.Keypair.generate()
  const escrowedXTokens = anchor.web3.Keypair.generate()
  let x_mint;
  let y_mint;
  let sellers_x_token;
  let sellers_y_token;
  let buyer_x_token;
  let buyer_y_token;
  let escrow: anchor.web3.PublicKey

  before(async() => {
    console.log('payer', payer.publicKey.toBase58());
    console.log('seller', seller.publicKey.toBase58());
    console.log('buyer', buyer.publicKey.toBase58());
    console.log('escrowedXTokens', escrowedXTokens.publicKey.toBase58());

    [escrow] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode("escrow"),
        seller.publicKey.toBuffer(),
      ],
      program.programId
    );

    x_mint = await splToken.createMint(
      provider.connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      6,
    )
    y_mint = await splToken.createMint(
      provider.connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      6,
    )

    sellers_x_token = await splToken.createAssociatedTokenAccount(
      provider.connection,
      payer,
      x_mint,
      seller.publicKey,
    );
    await splToken.mintTo(
      provider.connection,
      payer,
      x_mint,
      sellers_x_token,
      payer,
      1000000000,
    )
    sellers_y_token = await splToken.createAssociatedTokenAccount(
      provider.connection,
      payer,
      y_mint,
      seller.publicKey,
    );

    buyer_x_token = await splToken.createAssociatedTokenAccount(
      provider.connection,
      payer,
      x_mint,
      buyer.publicKey,
    );
    buyer_y_token = await splToken.createAssociatedTokenAccount(
      provider.connection,
      payer,
      y_mint,
      buyer.publicKey,
    );
    await splToken.mintTo(
      provider.connection,
      payer,
      y_mint,
      buyer_y_token,
      payer,
      100000
    )
  })

  it('Initialize escrow', async () => {
    const x_amount = new anchor.BN(40);
    const y_amount = new anchor.BN(40);
    const account = {
      seller: seller.publicKey,
      xMint: x_mint,
      yMint: y_mint,
      sellerXToken: sellers_x_token,
      escrow: escrow,
      escrowedXTokens: escrowedXTokens.publicKey,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
    }
    const tx = await program.methods
      .initialize(x_amount, y_amount)
      .accounts(account)
      .signers([escrowedXTokens, seller])
      .rpc()
    
    console.log('tx', tx)
  })
})