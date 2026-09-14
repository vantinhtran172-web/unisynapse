"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import bs58 from "bs58";
import { Buffer } from "buffer";
import { api } from "@/lib/api";
import { useAppState } from "@/context/AppStateContext";
import styles from "./wallet.module.css";
const DEVNET = "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG";
type Review = { sender: string; recipient: string; amount: string; lamports: bigint; fee: number };
export default function WalletPage() {
 const {connection}=useConnection(); const wallet=useWallet(); const {setVisible}=useWalletModal();
 const { refreshState } = useAppState();
 const [recipient,setRecipient]=useState(""); const [amount,setAmount]=useState("");
 const [review,setReview]=useState<Review|null>(null); const [balance,setBalance]=useState<number|null>(null);
 const [busy,setBusy]=useState(false); const lock=useRef(false); const [message,setMessage]=useState(""); const [signature,setSignature]=useState("");
 const [recoverySignature,setRecoverySignature]=useState("");
 const [deposit,setDeposit]=useState<{intent_id:string;memo:string;treasury:string}|null>(null);
 const [points,setPoints]=useState<number|null>(null); const [walletAuthenticated,setWalletAuthenticated]=useState(false);
 const [authenticating,setAuthenticating]=useState(false);
 const recoveryKey=useRef("");
  useEffect(()=>{let active=true;void api.economy().then(economy=>{if(active)setRecipient(economy.treasury);}).catch(()=>{});void api.getMe().then(profile=>{if(!active)return;setPoints(profile.unipoints);if(wallet.publicKey&&profile.address===wallet.publicKey.toBase58())setWalletAuthenticated(true);recoveryKey.current=`unisynapse:deposit:${profile.id}`;try{const saved=localStorage.getItem(recoveryKey.current);if(saved){const pending=JSON.parse(saved);if(typeof pending.signature==="string"&&typeof pending.deposit?.intent_id==="string"&&typeof pending.deposit?.treasury==="string"&&typeof pending.deposit?.memo==="string"){setDeposit(pending.deposit);setRecipient(pending.deposit.treasury);setSignature(pending.signature);setMessage("Giao dịch trước đã được lưu. Đối soát lại, không gửi thêm SOL.");}}}catch{/* Server verification remains authoritative if local recovery is unavailable. */}}).catch(()=>{});return()=>{active=false;};},[wallet.publicKey]);
  useEffect(()=>{const timer=window.setTimeout(()=>setWalletAuthenticated(false),0);return()=>window.clearTimeout(timer);},[wallet.publicKey]);
 async function refreshPoints(){try{setPoints((await api.getMe()).unipoints);}catch{/* A failed refresh does not undo a confirmed credit. */}}
 async function authenticateWallet(){if(!wallet.publicKey){setMessage("Hãy kết nối Phantom trước khi xác thực ví.");setVisible(true);return;}if(!wallet.signMessage){setMessage("Ví này không hỗ trợ ký message. Hãy dùng Phantom.");return;}setAuthenticating(true);setMessage("Đang tạo yêu cầu xác thực. Hãy ký message trong Phantom…");try{const address=wallet.publicKey.toBase58();const challenge=await api.challengeWallet(address);const signed=await wallet.signMessage(new TextEncoder().encode(challenge.message));await api.verifyWallet(address,challenge.nonce,challenge.message,bs58.encode(signed));setWalletAuthenticated(true);const profile=await api.getMe();setPoints(profile.unipoints);recoveryKey.current=`unisynapse:deposit:${profile.id}`;setMessage("Đã xác thực đúng ví. Bây giờ có thể đối soát giao dịch.");}catch(e){setWalletAuthenticated(false);setMessage(e instanceof Error?e.message:"Xác thực ví thất bại. Hãy thử lại.");}finally{setAuthenticating(false);}}
 async function startDeposit(){setBusy(true);try{const profile=await api.getMe();if(!wallet.publicKey||profile.address!==wallet.publicKey.toBase58())throw new Error("Hãy đăng nhập và xác thực đúng ví Phantom gửi SOL trước khi đổi điểm.");const d=await api.createDeposit();setDeposit(d);setRecipient(d.treasury);setReview(null);setMessage("Nhập số SOL, kiểm tra rồi xác nhận Phantom. 0.08 SOL = 80 điểm = 1 lượt chat.");}catch(e){setMessage(e instanceof Error?e.message:String(e));}finally{setBusy(false);}}
 async function verifyDeposit(){if(!deposit||!signature)return;setBusy(true);try{const r=await api.verifyDeposit(deposit.intent_id,signature);setMessage(`Đã ghi nhận ${r.credited} UniPoints. Không gửi lại giao dịch này.`);await refreshPoints();await refreshState();}catch(e){setMessage(String(e));}finally{setBusy(false);}}
 async function recoverDeposit(){const value=recoverySignature.trim();if(!value){setMessage("Hãy dán mã giao dịch (signature) trước khi đối soát.");return;}if(!walletAuthenticated){setMessage("Hãy bấm 'Xác thực ví' và ký message bằng đúng ví đã gửi SOL trước.");return;}setBusy(true);setMessage("Đang đối soát giao dịch trên Solana Devnet…");try{const r=await api.recoverDeposit(value);setSignature(value);setRecoverySignature("");setMessage(`Đã cộng ${r.credited.toLocaleString("vi-VN")} UniPoints từ giao dịch đã chuyển. Không gửi lại SOL.`);await refreshPoints();await refreshState();}catch(e){setMessage(e instanceof Error?e.message:"Không thể đối soát giao dịch. Hãy xác thực đúng ví đã gửi SOL.");}finally{setBusy(false);}}
 function addMemo(tx:Transaction){if(deposit)tx.add(new TransactionInstruction({keys:[],programId:new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),data:Buffer.from(deposit.memo)}));return tx;}
 async function prepare(){
  if(lock.current)return; lock.current=true;setBusy(true);setMessage("");setReview(null);
  try{
   if(!wallet.publicKey)throw Error("Hãy kết nối Phantom trước.");
   if(await connection.getGenesisHash()!==DEVNET)throw Error("RPC không phải Solana Devnet. Đã chặn giao dịch.");
   if(!/^(0|[1-9]\d*)(\.\d{1,9})?$/.test(amount))throw Error("Số SOL phải dương, tối đa 9 chữ số thập phân.");
   const [whole,fraction=""]=amount.split(".");const lamports=BigInt(whole)*BigInt(1000000000)+BigInt(fraction.padEnd(9,"0"));
   if(lamports<=BigInt(0) || lamports>BigInt(Number.MAX_SAFE_INTEGER))throw Error("Số lượng nằm ngoài giới hạn hỗ trợ.");
   if(deposit&&(lamports<BigInt(1000000)||lamports%BigInt(1000000)!==BigInt(0)||lamports>BigInt(10000000000)))throw Error("Nạp từ 0.001 đến 10 SOL, theo bội số 0.001 SOL.");
   const target=new PublicKey(recipient.trim());if(!PublicKey.isOnCurve(target.toBytes()))throw Error("Chỉ hỗ trợ gửi tới địa chỉ ví thông thường.");
   if(target.equals(wallet.publicKey))throw Error("Ví nhận phải khác ví gửi.");
   const latest=await connection.getLatestBlockhash("confirmed");
   let tx=new Transaction({...latest,feePayer:wallet.publicKey}).add(SystemProgram.transfer({fromPubkey:wallet.publicKey,toPubkey:target,lamports}));
   tx=addMemo(tx);
   const fee=(await connection.getFeeForMessage(tx.compileMessage(),"confirmed")).value;
   if(fee===null)throw Error("Không lấy được phí. Vui lòng thử lại.");
   const available=await connection.getBalance(wallet.publicKey,"confirmed");setBalance(available);
   if(BigInt(available)<lamports+BigInt(fee))throw Error("Không đủ SOL cho số tiền và phí mạng.");
   setReview({sender:wallet.publicKey.toBase58(),recipient:target.toBase58(),amount,lamports,fee});
  }catch(e){setMessage(e instanceof Error?e.message:"Không thể chuẩn bị giao dịch.");}finally{lock.current=false;setBusy(false);}
 }
 async function send(){
  if(lock.current||!review||signature)return;lock.current=true;setBusy(true);setMessage("");let sent="";
  try{
   if(!wallet.publicKey||wallet.publicKey.toBase58()!==review.sender)throw Error("Ví đã thay đổi. Hãy kiểm tra lại.");
   if(deposit){const profile=await api.getMe();if(profile.address!==review.sender)throw Error("Ví gửi không khớp ví đã xác thực của tài khoản.");recoveryKey.current=`unisynapse:deposit:${profile.id}`;}
   if(await connection.getGenesisHash()!==DEVNET)throw Error("Sai mạng Devnet.");
   const latest=await connection.getLatestBlockhash("confirmed");
   let tx=new Transaction({...latest,feePayer:wallet.publicKey}).add(SystemProgram.transfer({fromPubkey:wallet.publicKey,toPubkey:new PublicKey(review.recipient),lamports:review.lamports}));
   tx=addMemo(tx);
   const fee=(await connection.getFeeForMessage(tx.compileMessage(),"confirmed")).value;
   if(fee===null||fee!==review.fee)throw Error("Phí đã thay đổi. Hãy xem lại giao dịch.");
   if(BigInt(await connection.getBalance(wallet.publicKey,"confirmed"))<review.lamports+BigInt(fee))throw Error("Số dư không đủ.");
   setMessage("Đang chờ bạn xác nhận trong Phantom…");
   sent=await wallet.sendTransaction(tx,connection,{skipPreflight:false,preflightCommitment:"confirmed",maxRetries:0});setSignature(sent);setReview(null);
   if(deposit&&recoveryKey.current){try{localStorage.setItem(recoveryKey.current,JSON.stringify({deposit,signature:sent}));}catch{/* Keep signature visible even if browser storage is unavailable. */}}
   setMessage("Đã gửi. Đang chờ mạng xác nhận — không gửi lại.");
   const result=await connection.confirmTransaction({...latest,signature:sent},deposit?"finalized":"confirmed");
   if(result.value.err){setMessage("Giao dịch thất bại trên mạng. Kiểm tra Explorer.");return;}
   if(deposit){
    try{const credited=await api.verifyDeposit(deposit.intent_id,sent);setMessage(`Đã nạp thành công ${credited.credited} UniPoints.`);await refreshPoints();await refreshState();}
    catch{setMessage("Đã gửi SOL. Bấm Đối soát để thử cộng điểm lại; không gửi lại SOL.");}
   }else setMessage("Đã xác nhận chuyển SOL trên Devnet.");
   try{setBalance(await connection.getBalance(wallet.publicKey,"confirmed"));}catch{/* Transfer remains confirmed even if refresh fails. */}
  }catch(e){setReview(null);setMessage(sent?"Chưa xác định kết quả. Kiểm tra Explorer trước khi gửi lại.":e instanceof Error?e.message:"Không thể gửi giao dịch.");}
  finally{lock.current=false;setBusy(false);}
 }
 return <main className={styles.shell}><section className={styles.card}>
 <Link href="/">← UniSynapse</Link><span className={styles.badge}>SOLANA DEVNET · KHÔNG CÓ GIÁ TRỊ TIỀN THẬT</span>
 <h1>Đổi SOL thành<br/><em>UniPoints.</em></h1><p>Nạp SOL Devnet để nhận điểm dùng cho AI. Bạn cũng có thể chuyển SOL thử nghiệm tới ví khác. Không sử dụng Mainnet.</p>
 <button id="wallet-connect" disabled={busy||authenticating} onClick={()=>setVisible(true)}>Chọn / kết nối Phantom</button>
 <p className={styles.address}>{wallet.publicKey?.toBase58()||"Chưa kết nối ví"}</p>
 {wallet.publicKey&&<div className={styles.walletAuth} aria-live="polite"><strong>{walletAuthenticated?"✓ Ví đã xác thực":"⚠ Ví mới chỉ kết nối, chưa xác thực"}</strong><p>{walletAuthenticated?"Đúng ví này có thể nạp và đối soát giao dịch.":"Ký một message miễn phí để liên kết ví với phiên UniSynapse. Không gửi SOL."}</p>{!walletAuthenticated&&<button type="button" id="wallet-authenticate" disabled={busy||authenticating} onClick={authenticateWallet}>{authenticating?"Đang chờ Phantom…":"Xác thực ví để nạp / đối soát"}</button>}</div>}
 {balance!==null&&<p>Số dư khi kiểm tra: {balance/1e9} SOL</p>}
 {points!==null&&<p>Số dư tài khoản: <strong>{points.toLocaleString("vi-VN")} UniPoints</strong></p>}
 <h2>Nạp UniPoints · 80 điểm/lượt AI</h2><p>1 SOL Devnet = 1.000 UniPoints. Đăng nhập bằng ví gửi trước khi nạp. Chỉ cộng điểm sau xác nhận finalized.</p>
 <button id="deposit-start" disabled={busy||!!signature||!walletAuthenticated} onClick={startDeposit}>Nạp SOL để nhận UniPoints</button>
 {deposit&&<p className={styles.address}>Memo: {deposit.memo}</p>}
 {deposit&&signature&&<button id="deposit-verify" disabled={busy||!walletAuthenticated} onClick={verifyDeposit}>Đối soát và cộng điểm (không gửi lại)</button>}
 <div className={styles.recovery} aria-live="polite"><h2>Đã chuyển SOL nhưng chưa nhận điểm?</h2><p>Dán mã giao dịch từ Solana Explorer vào đây. Không gửi lại SOL.</p><label htmlFor="deposit-signature">Mã giao dịch (signature)</label><input id="deposit-signature" value={recoverySignature} disabled={busy||!walletAuthenticated} onChange={e=>setRecoverySignature(e.target.value)} placeholder="Dán signature giao dịch Solana" autoComplete="off"/><button type="button" id="deposit-recover" disabled={busy||!walletAuthenticated} onClick={recoverDeposit}>{busy?"Đang đối soát…":walletAuthenticated?"Đối soát giao dịch và cộng điểm":"Xác thực ví trước khi đối soát"}</button></div>
 {deposit ? <div className={styles.systemWallet} aria-live="polite"><label htmlFor="sol-recipient">Ví hệ thống nhận SOL</label><input id="sol-recipient" value={recipient} disabled={true} readOnly aria-describedby="system-wallet-note" /><p id="system-wallet-note">Địa chỉ treasury được hệ thống tự động điền và khóa để tránh gửi nhầm.</p></div> : <><label htmlFor="sol-recipient">Địa chỉ ví nhận</label><input id="sol-recipient" value={recipient} disabled={busy} onChange={e=>{setRecipient(e.target.value);setReview(null);}} autoComplete="off" placeholder="Nhập địa chỉ ví nhận" /></>}
 <label htmlFor="sol-amount">Số lượng SOL</label><input id="sol-amount" inputMode="decimal" value={amount} disabled={busy} onChange={e=>{setAmount(e.target.value);setReview(null);}}/>
 {deposit && <aside className={styles.review} aria-live="polite"><h2>Điểm dự kiến nhận</h2><p>{/^(0|[1-9]\d*)(\.\d{1,3})?$/.test(amount) && Number(amount)>0 && Number(amount)<=10 ? `${Math.round(Number(amount)*1000).toLocaleString("vi-VN")} UniPoints · ${Math.floor(Math.round(Number(amount)*1000)/80)} lượt AI` : "Nhập từ 0.001 đến 10 SOL, bước 0.001 SOL"}</p><p>Phí mạng trả riêng. Điểm chỉ được cộng sau đối soát finalized.</p></aside>}
 <button id="sol-review" disabled={busy||!wallet.connected||!!signature} onClick={prepare}>Kiểm tra số dư và phí →</button>
 {review&&<aside className={styles.review}><h2>Xác nhận thông tin</h2><p className={styles.address}>Từ: {review.sender}<br/>Đến: {review.recipient}</p><p>{review.amount} SOL · Phí ước tính {review.fee/1e9} SOL</p><p>Mạng: Devnet. Bạn sẽ tự ký trong Phantom.</p><button id="sol-send" disabled={busy||wallet.publicKey?.toBase58()!==review.sender} onClick={send}>Xác nhận qua Phantom</button></aside>}
 <p role="status" aria-live="polite">{message}</p>{signature&&<a id="sol-explorer" href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer">Xem giao dịch trên Solana Explorer ↗</a>}
 <p className={styles.note}>Ứng dụng không giữ khóa bí mật. Việc kết nối ví chưa đồng nghĩa với liên kết ví vào tài khoản UniSynapse. Sau một giao dịch, kiểm tra Explorer trước khi tải lại trang để chuyển tiếp.</p>
 </section></main>;
}
