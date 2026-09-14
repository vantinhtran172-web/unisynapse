"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
export default function RegisterPage() {
 const [busy,setBusy]=useState(false); const [error,setError]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){
 e.preventDefault(); if(busy)return; const data=new FormData(e.currentTarget);
 const password=String(data.get("password"));
 if(password!==data.get("confirm")){setError("Mật khẩu xác nhận không khớp.");return;}
 setBusy(true);setError("");try{await api.register(String(data.get("username")),password);window.location.assign("/");}
 catch(cause){setError(cause instanceof Error?cause.message:"Không thể đăng ký.");}finally{setBusy(false);}}
 return <main className="client-shell"><div className="client-container"><section className="client-hero"><div className="hero-copy">
 <Link href="/">← Trang chủ</Link><p className="eyebrow">UNISYNAPSE · TÀI KHOẢN SINH VIÊN</p><h1>Bắt đầu hành trình<br/><em>tri thức của bạn.</em></h1>
 <p>Tạo tài khoản cá nhân. Ứng dụng không tạo hay lưu khóa bí mật của ví Phantom.</p>
 <form onSubmit={submit} id="registration-form">
 <p><label htmlFor="register-username">Tên tài khoản</label><br/><input id="register-username" name="username" required minLength={3} maxLength={32} pattern="[A-Za-z0-9_]{3,32}" autoComplete="username"/></p>
 <p><label htmlFor="register-password">Mật khẩu (14–128 ký tự)</label><br/><input id="register-password" name="password" type="password" required minLength={14} maxLength={128} autoComplete="new-password"/></p>
 <p><label htmlFor="register-confirm">Nhập lại mật khẩu</label><br/><input id="register-confirm" name="confirm" type="password" required minLength={14} maxLength={128} autoComplete="new-password"/></p>
 {error&&<p role="alert">{error}</p>}<button id="register-submit" className="primary-action" disabled={busy}>{busy?"Đang tạo tài khoản…":"Tạo tài khoản →"}</button>
 </form></div></section></div></main>;
}
