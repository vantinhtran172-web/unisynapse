export interface AuditItemData {
  id: string;
  action: string;
  event_type: string;
  user_id: string;
  actor_id: string;
  details: string;
  timestamp: number;
  created_at: number;
}

export const sampleAuditEvents: AuditItemData[] = [
  {
    "id": "aud_d2c3b42661e9",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_3ed3ae12.txt: Testing revoke workflow",
    "timestamp": 1790694358,
    "created_at": 1790694358
  },
  {
    "id": "aud_268e35a08394",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_1cef94da.txt: Testing revoke workflow",
    "timestamp": 1790679110,
    "created_at": 1790679110
  },
  {
    "id": "aud_fc49132e1f38",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_96488a01.txt: Testing revoke workflow",
    "timestamp": 1790674074,
    "created_at": 1790674074
  },
  {
    "id": "aud_88582613929a",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_44f17ad3.txt: Testing revoke workflow",
    "timestamp": 1790673753,
    "created_at": 1790673753
  },
  {
    "id": "aud_7871360c6056",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_f3fe5c8f.txt: Testing revoke workflow",
    "timestamp": 1790668871,
    "created_at": 1790668871
  },
  {
    "id": "aud_9f75777323ee",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_7c5d955c.txt: Testing revoke workflow",
    "timestamp": 1790668698,
    "created_at": 1790668698
  },
  {
    "id": "aud_99aa40a2bdfd",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_bd6cfb19.txt: Testing revoke workflow",
    "timestamp": 1790666459,
    "created_at": 1790666459
  },
  {
    "id": "aud_6ee62127cdd5",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_a1f0cbb8.txt: Testing revoke workflow",
    "timestamp": 1790665034,
    "created_at": 1790665034
  },
  {
    "id": "aud_dc1aca784f62",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_2d5da301.txt: Testing revoke workflow",
    "timestamp": 1790664498,
    "created_at": 1790664498
  },
  {
    "id": "aud_9d0d533c582c",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_49349cee.txt: Testing revoke workflow",
    "timestamp": 1790645626,
    "created_at": 1790645626
  },
  {
    "id": "aud_9433e8f8a8d5",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: bench_1d3f15 (usr_bench_1d3f15)",
    "timestamp": 1790643684,
    "created_at": 1790643684
  },
  {
    "id": "aud_ea54404b9df2",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: Chi (usr_peer_3)",
    "timestamp": 1790643675,
    "created_at": 1790643675
  },
  {
    "id": "aud_108f237ea1b2",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: sinhvien_demo (usr_demo_sinhvien)",
    "timestamp": 1790643671,
    "created_at": 1790643671
  },
  {
    "id": "aud_b72fea9223b7",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: demo_student (demo_student_unisynapse)",
    "timestamp": 1790643667,
    "created_at": 1790643667
  },
  {
    "id": "aud_e5bf18d50772",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: oracle_tester (test_user_oracle)",
    "timestamp": 1790643664,
    "created_at": 1790643664
  },
  {
    "id": "aud_650b108ad2b1",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: sol_2PZzsk_7pAy (usr_5306cd1cb83840bf8bcadcd9e1452897)",
    "timestamp": 1790643661,
    "created_at": 1790643661
  },
  {
    "id": "aud_b0549078794c",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: sol_4bUzfi_jnsm (usr_586497ffd7f0438ca37783de0e1609ea)",
    "timestamp": 1790643658,
    "created_at": 1790643658
  },
  {
    "id": "aud_f62aff5b0578",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: Student Scholar (usr_demo)",
    "timestamp": 1790643650,
    "created_at": 1790643650
  },
  {
    "id": "aud_d3519ad6609f",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: victim (victim_user)",
    "timestamp": 1790643646,
    "created_at": 1790643646
  },
  {
    "id": "aud_0b3a0873533d",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: sv_demo (usr_b1e826c65a8848da90d6585fcdd7509d)",
    "timestamp": 1790643637,
    "created_at": 1790643637
  },
  {
    "id": "aud_3e415805ef20",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: testuser_80pt_1789358056 (usr_bf8811dd72f9420ebb06a1ec7b5e9a6b)",
    "timestamp": 1790643630,
    "created_at": 1790643630
  },
  {
    "id": "aud_06ab7c1ef4f6",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: testuser_pts_1789356514 (usr_ce4c12785c4d4e5b90b66c95b21276ec)",
    "timestamp": 1790643628,
    "created_at": 1790643628
  },
  {
    "id": "aud_3e1f226e1c4f",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: testuser_80pt_1789358047 (usr_fa55731b9b0d4697a1d3f2883536678b)",
    "timestamp": 1790643625,
    "created_at": 1790643625
  },
  {
    "id": "aud_e762c5935550",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: dericaesal (usr_bcd1d5eb694542448327d587bb7d333f)",
    "timestamp": 1790643587,
    "created_at": 1790643587
  },
  {
    "id": "aud_82c0da1f17f1",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: WIT (usr_0ce686dc3cb64a139a014ad8e7cc5f21)",
    "timestamp": 1790643584,
    "created_at": 1790643584
  },
  {
    "id": "aud_f39f98e2f695",
    "action": "document_deleted",
    "event_type": "document_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted document: README.txt (doc_6f4a0a7d)",
    "timestamp": 1790620699,
    "created_at": 1790620699
  },
  {
    "id": "aud_8cea4f72af0e",
    "action": "document_deleted",
    "event_type": "document_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted document: README.txt (doc_e410d07a)",
    "timestamp": 1790620694,
    "created_at": 1790620694
  },
  {
    "id": "aud_23282067f6e0",
    "action": "document_deleted",
    "event_type": "document_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted document: tadhub-format-2-1-accounts (1).txt (doc_06896eb3)",
    "timestamp": 1790620690,
    "created_at": 1790620690
  },
  {
    "id": "aud_461a973b38a0",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_299b5e4a.txt: Testing revoke workflow",
    "timestamp": 1789796311,
    "created_at": 1789796311
  },
  {
    "id": "aud_969e76fceb5b",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_6e915546.txt: Testing revoke workflow",
    "timestamp": 1789794073,
    "created_at": 1789794073
  },
  {
    "id": "aud_ec5595ac4cd2",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_b261fda3.txt: Testing revoke workflow",
    "timestamp": 1789794026,
    "created_at": 1789794026
  },
  {
    "id": "aud_b5e213a92c78",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_da384894.txt: Testing revoke workflow",
    "timestamp": 1789791900,
    "created_at": 1789791900
  },
  {
    "id": "aud_e8dee1f85132",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: wallet_4dLCMKsY (wallet_4dLCMKsYEmQyDTvU)",
    "timestamp": 1789784149,
    "created_at": 1789784149
  },
  {
    "id": "aud_0d074a1afcae",
    "action": "document_updated",
    "event_type": "document_updated",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin updated document doc_unapproved_01",
    "timestamp": 1789784056,
    "created_at": 1789784056
  },
  {
    "id": "aud_b1513e07fbc5",
    "action": "document_rejected",
    "event_type": "document_rejected",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin rejected: bản quyền",
    "timestamp": 1789784043,
    "created_at": 1789784043
  },
  {
    "id": "aud_f635fc8f8fab",
    "action": "document_faculty_approved",
    "event_type": "document_faculty_approved",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin approved ASEAN TRẮC NGHIỆM.pdf. 63 chunks indexed.",
    "timestamp": 1789784026,
    "created_at": 1789784026
  },
  {
    "id": "aud_bd198e9617ae",
    "action": "document_faculty_approved",
    "event_type": "document_faculty_approved",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin approved 300 Câu trắc nghiệm CNXH.pdf. 115 chunks indexed.",
    "timestamp": 1789784019,
    "created_at": 1789784019
  },
  {
    "id": "aud_d242b7a1c22d",
    "action": "document_faculty_approved",
    "event_type": "document_faculty_approved",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin approved 300-CÂU-HỎI-TRẮC-NGHIỆM-TRIẾT-HỌC-MÁC-LÊ-NIN.pdf. 179 chunks indexed.",
    "timestamp": 1789784011,
    "created_at": 1789784011
  },
  {
    "id": "aud_0988a2f56657",
    "action": "task_updated",
    "event_type": "task_updated",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin updated task task_101",
    "timestamp": 1789783985,
    "created_at": 1789783985
  },
  {
    "id": "aud_d2e3ce953b24",
    "action": "task_updated",
    "event_type": "task_updated",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin updated task task_b48a82b2",
    "timestamp": 1789783976,
    "created_at": 1789783976
  },
  {
    "id": "aud_8e89f9b158a3",
    "action": "task_updated",
    "event_type": "task_updated",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin updated task task_f4c9be2e",
    "timestamp": 1789783972,
    "created_at": 1789783972
  },
  {
    "id": "aud_609cd6cf0f31",
    "action": "task_updated",
    "event_type": "task_updated",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin updated task task_6891923e",
    "timestamp": 1789783967,
    "created_at": 1789783967
  },
  {
    "id": "aud_169ad9b288a3",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: member_a1ef95cd48 (member_test_f95e3b3aed)",
    "timestamp": 1789783949,
    "created_at": 1789783949
  },
  {
    "id": "aud_0e3daafd0d27",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: member_3a033dfec0 (member_test_d949f16493)",
    "timestamp": 1789783947,
    "created_at": 1789783947
  },
  {
    "id": "aud_7ced0ee64c8a",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: member_9601da1704 (member_test_54e239afa9)",
    "timestamp": 1789783946,
    "created_at": 1789783946
  },
  {
    "id": "aud_b0ee830c47f7",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: member_7c1521e899 (member_test_27f70268ed)",
    "timestamp": 1789783944,
    "created_at": 1789783944
  },
  {
    "id": "aud_9997249b7ec8",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: bench_38e6a1 (usr_bench_38e6a1)",
    "timestamp": 1789783943,
    "created_at": 1789783943
  },
  {
    "id": "aud_b15d3ed71dc6",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: vantinh54444 (usr_d939f2e3f19d430384c253b7e71b7c66)",
    "timestamp": 1789783941,
    "created_at": 1789783941
  },
  {
    "id": "aud_b55236a771e5",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: test_9r_local_1 (usr_2b7fc6d4b90e491cb83648a71103708e)",
    "timestamp": 1789783939,
    "created_at": 1789783939
  },
  {
    "id": "aud_42ceeed081b4",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: vantinht983 (usr_d1664b34842e497c8bb3638bdfdbaa0c)",
    "timestamp": 1789783932,
    "created_at": 1789783932
  },
  {
    "id": "aud_ecf575ae3b08",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: testuser123 (usr_26e9def23bbb41f4bfedd30a61616687)",
    "timestamp": 1789783928,
    "created_at": 1789783928
  },
  {
    "id": "aud_61407c877f71",
    "action": "task_deleted",
    "event_type": "task_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted task: Updated Test Task Title",
    "timestamp": 1789783385,
    "created_at": 1789783385
  },
  {
    "id": "aud_c7dd938247c6",
    "action": "task_updated",
    "event_type": "task_updated",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin updated task task_40d28991",
    "timestamp": 1789783385,
    "created_at": 1789783385
  },
  {
    "id": "aud_aff5ff414cf3",
    "action": "task_created",
    "event_type": "task_created",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin created task: Test Task for CRUD",
    "timestamp": 1789783384,
    "created_at": 1789783384
  },
  {
    "id": "aud_93a1a05c21a8",
    "action": "chunk_deleted",
    "event_type": "chunk_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted chunk chk_adm_98f1aed9c2",
    "timestamp": 1789783379,
    "created_at": 1789783379
  },
  {
    "id": "aud_f9fdfe382fff",
    "action": "chunk_updated",
    "event_type": "chunk_updated",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin updated chunk chk_adm_98f1aed9c2",
    "timestamp": 1789783379,
    "created_at": 1789783379
  },
  {
    "id": "aud_993366ff7f29",
    "action": "chunk_created",
    "event_type": "chunk_created",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin added knowledge chunk: Test chunk content for verification...",
    "timestamp": 1789783379,
    "created_at": 1789783379
  },
  {
    "id": "aud_9447c0724a60",
    "action": "document_deleted",
    "event_type": "document_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted document: Updated Test Doc Title (doc_f985d637)",
    "timestamp": 1789783372,
    "created_at": 1789783372
  },
  {
    "id": "aud_601aaa52d4b9",
    "action": "document_updated",
    "event_type": "document_updated",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin updated document doc_f985d637",
    "timestamp": 1789783372,
    "created_at": 1789783372
  },
  {
    "id": "aud_05c64e59bf69",
    "action": "document_created_by_admin",
    "event_type": "document_created_by_admin",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin created document: Temp Delete Test Doc",
    "timestamp": 1789783372,
    "created_at": 1789783372
  },
  {
    "id": "aud_e0cf84e868a5",
    "action": "user_deleted",
    "event_type": "user_deleted",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin deleted user: temp_delete_test_user (usr_c4f502eb64)",
    "timestamp": 1789748559,
    "created_at": 1789748559
  },
  {
    "id": "aud_028eac9a0a20",
    "action": "user_updated",
    "event_type": "user_updated",
    "user_id": "usr_c4f502eb64",
    "actor_id": "usr_c4f502eb64",
    "details": "Admin updated user usr_c4f502eb64",
    "timestamp": 1789748559,
    "created_at": 1789748559
  },
  {
    "id": "aud_dd02902c1028",
    "action": "user_created",
    "event_type": "user_created",
    "user_id": "usr_c4f502eb64",
    "actor_id": "usr_c4f502eb64",
    "details": "Admin created user: temp_delete_test_user (student)",
    "timestamp": 1789748559,
    "created_at": 1789748559
  },
  {
    "id": "aud_1ff77858736f",
    "action": "user_updated",
    "event_type": "user_updated",
    "user_id": "usr_26e9def23bbb41f4bfedd30a61616687",
    "actor_id": "usr_26e9def23bbb41f4bfedd30a61616687",
    "details": "Admin updated user usr_26e9def23bbb41f4bfedd30a61616687",
    "timestamp": 1789722621,
    "created_at": 1789722621
  },
  {
    "id": "aud_5187e349a181",
    "action": "user_updated",
    "event_type": "user_updated",
    "user_id": "usr_26e9def23bbb41f4bfedd30a61616687",
    "actor_id": "usr_26e9def23bbb41f4bfedd30a61616687",
    "details": "Admin updated user usr_26e9def23bbb41f4bfedd30a61616687",
    "timestamp": 1789721628,
    "created_at": 1789721628
  },
  {
    "id": "aud_f2c9248323e8",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_d45066ed.txt: Testing revoke workflow",
    "timestamp": 1789707609,
    "created_at": 1789707609
  },
  {
    "id": "aud_ad0a7ac1436c",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_76e5c16f.txt: Testing revoke workflow",
    "timestamp": 1789707354,
    "created_at": 1789707354
  },
  {
    "id": "aud_37e667eb9589",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_86763609.txt: Testing revoke workflow",
    "timestamp": 1789707281,
    "created_at": 1789707281
  },
  {
    "id": "aud_7a0e47f4b30f",
    "action": "points_adjusted",
    "event_type": "points_adjusted",
    "user_id": "usr_d1664b34842e497c8bb3638bdfdbaa0c",
    "actor_id": "usr_d1664b34842e497c8bb3638bdfdbaa0c",
    "details": "Admin adjusted 199999999999 UniPoints for vantinht983: Thưởng đóng góp học thuật xuất sắc",
    "timestamp": 1789615048,
    "created_at": 1789615048
  },
  {
    "id": "aud_1feff5b45cec",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_54ab9bfb.txt: Testing revoke workflow",
    "timestamp": 1789565725,
    "created_at": 1789565725
  },
  {
    "id": "aud_d1a1553f8c49",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_4583f7fa.txt: Testing revoke workflow",
    "timestamp": 1789565644,
    "created_at": 1789565644
  },
  {
    "id": "aud_1e2f441893f5",
    "action": "points_adjusted",
    "event_type": "points_adjusted",
    "user_id": "usr_26e9def23bbb41f4bfedd30a61616687",
    "actor_id": "usr_26e9def23bbb41f4bfedd30a61616687",
    "details": "Admin adjusted 1000000000000000000 UniPoints for testuser123: Thưởng đóng góp học thuật xuất sắc",
    "timestamp": 1789552522,
    "created_at": 1789552522
  },
  {
    "id": "aud_9438d60dbd79",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_2ad3152e.txt: Testing revoke workflow",
    "timestamp": 1789551955,
    "created_at": 1789551955
  },
  {
    "id": "aud_466f18f274a2",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_e7eab40d.txt: Testing revoke workflow",
    "timestamp": 1789551816,
    "created_at": 1789551816
  },
  {
    "id": "aud_bf84312baf17",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_0a7a2b5b.txt: Testing revoke workflow",
    "timestamp": 1789547321,
    "created_at": 1789547321
  },
  {
    "id": "aud_8c90688980a3",
    "action": "document_revoked",
    "event_type": "document_revoked",
    "user_id": "admin",
    "actor_id": "admin",
    "details": "Admin/Reviewer revoked document Crypto_Lecture_6933c779.txt: Testing revoke workflow",
    "timestamp": 1789547305,
    "created_at": 1789547305
  }
];
