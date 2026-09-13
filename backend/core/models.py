from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, MetaData, String, Table, Text, UniqueConstraint

metadata = MetaData()

users = Table("users", metadata,
    Column("id", String(255), primary_key=True), Column("address", String(255), unique=True),
    Column("username", String(255), unique=True), Column("password_hash", Text),
    Column("disabled", Boolean, nullable=False, server_default="false"), Column("unipoints", Integer, server_default="0"),
    Column("reputation", Integer, server_default="100"), Column("role", String(64), server_default="student"), Column("created_at", Float))
tasks = Table("tasks", metadata,
    Column("id", String(255), primary_key=True), Column("title", Text, nullable=False), Column("description", Text),
    Column("category", String(255)), Column("input_text", Text, nullable=False), Column("labels", Text, nullable=False),
    Column("required_votes", Integer, server_default="5"), Column("consensus_threshold", Float, server_default="0.8"),
    Column("reward_points", Integer, server_default="10"), Column("gold_label", Text), Column("status", String(64), server_default="open"),
    Column("consensus", Text), Column("completed_at", Float), Column("created_at", Float))
task_submissions = Table("task_submissions", metadata,
    Column("id", String(255), primary_key=True), Column("task_id", String(255), ForeignKey("tasks.id"), nullable=False), Column("user_id", String(255), ForeignKey("users.id"), nullable=False),
    Column("label", Text, nullable=False), Column("is_gold_correct", Boolean, server_default="true"), Column("created_at", Float),
    UniqueConstraint("task_id", "user_id", name="uq_task_submissions_task_user"))
documents = Table("documents", metadata,
    Column("id", String(255), primary_key=True), Column("owner_id", String(255), ForeignKey("users.id"), nullable=False), Column("filename", Text, nullable=False),
    Column("original_name", Text, nullable=False), Column("file_type", String(255), nullable=False), Column("size_bytes", Integer, nullable=False),
    Column("checksum", String(255), nullable=False, unique=True), Column("status", String(64), server_default="pending_review"),
    Column("mime_check", String(64), server_default="pending"), Column("pii_check", String(64), server_default="pending"),
    Column("dedupe_check", String(64), server_default="pending"), Column("copyright_check", String(64), server_default="pending"),
    Column("quality_check", String(64), server_default="pending"), Column("rejection_reason", Text), Column("chunk_count", Integer, server_default="0"),
    Column("created_at", Float), Column("approved_at", Float))
document_chunks = Table("document_chunks", metadata,
    Column("id", String(255), primary_key=True), Column("document_id", String(255), ForeignKey("documents.id"), nullable=False), Column("document_name", Text, nullable=False),
    Column("chunk_index", Integer, nullable=False), Column("page_number", Integer), Column("content", Text, nullable=False),
    Column("embedding", Text, nullable=False), Column("created_at", Float))
reward_ledger = Table("reward_ledger", metadata,
    Column("id", String(255), primary_key=True), Column("user_id", String(255), ForeignKey("users.id"), nullable=False), Column("delta", Integer, nullable=False),
    Column("reason", Text, nullable=False), Column("source_type", String(128), nullable=False), Column("source_id", String(255), nullable=False),
    Column("proof_status", String(64), server_default="unsubmitted"), Column("solana_signature", Text), Column("proof_hash", String(255), nullable=False), Column("created_at", Float))
audit_events = Table("audit_events", metadata,
    Column("id", String(255), primary_key=True), Column("user_id", String(255)), Column("action", Text, nullable=False), Column("details", Text), Column("timestamp", Float))
member_sessions = Table("member_sessions", metadata,
    Column("token_hash", String(255), primary_key=True), Column("member_id", String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False), Column("expires_at", Float, nullable=False), Column("created_at", Float, nullable=False), Column("revoked_at", Float))
admin_accounts = Table("admin_accounts", metadata,
    Column("id", String(255), primary_key=True), Column("username", String(255), nullable=False, unique=True), Column("password_hash", Text, nullable=False), Column("totp_secret", Text, nullable=False), Column("role", String(64), nullable=False, server_default="admin"), Column("disabled", Boolean, nullable=False, server_default="false"), Column("created_at", Float, nullable=False))
admin_sessions = Table("admin_sessions", metadata,
    Column("token_hash", String(255), primary_key=True), Column("admin_id", String(255), ForeignKey("admin_accounts.id", ondelete="CASCADE"), nullable=False), Column("expires_at", Float, nullable=False), Column("created_at", Float, nullable=False))
