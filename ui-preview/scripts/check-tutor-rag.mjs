const baseUrl = process.env.TUTOR_BASE_URL || "http://127.0.0.1:3011";

async function ask(question) {
  const response = await fetch(`${baseUrl}/api/v1/tutor/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      subject_code: "VHU_IT101",
      university: "Đại học Văn Hiến (VHU)",
      model: "offline",
    }),
  });
  if (!response.ok) throw new Error(`Tutor returned HTTP ${response.status}`);
  return response.json();
}

const grounded = await ask("Con trỏ trong C là gì và malloc cần giải phóng thế nào?");
const outside = await ask("Tàu Apollo 11 hạ cánh xuống Mặt Trăng năm nào?");

if (!grounded.grounded || grounded.citations.length === 0) {
  throw new Error("Expected approved-document citation for in-corpus question");
}
if (outside.grounded || outside.citations.length !== 0 || outside.source_type !== "ai_outside_knowledge_base") {
  throw new Error("Expected outside-knowledge warning without citations");
}
console.log(`Tutor RAG OK: ${grounded.citations[0].document_name}; outside warning OK`);