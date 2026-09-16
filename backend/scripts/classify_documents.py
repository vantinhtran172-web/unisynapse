import sqlite3
from pathlib import Path

db_path = Path(__file__).resolve().parent.parent.parent / "data" / "unisynapse.db"
conn = sqlite3.connect(db_path)

# Update political/general education documents
conn.execute("""
UPDATE documents 
SET subject_code = 'POL101', subject_name = 'Tư tưởng Hồ Chí Minh & Triết học Mác - Lênin'
WHERE original_name LIKE '%TƯ TƯỞNG%' 
   OR original_name LIKE '%TRIẾT%' 
   OR original_name LIKE '%TRIẾT%' 
   OR original_name LIKE '%CNXH%' 
   OR original_name LIKE '%MÁC%' 
   OR original_name LIKE '%PLĐC%' 
   OR original_name LIKE '%TTHCM%'
   OR original_name LIKE '%kinh_te_chinh_tri%'
   OR original_name LIKE '%ASEAN%'
""")

# Update cryptography documents
conn.execute("""
UPDATE documents 
SET subject_code = 'CRYPTO201', subject_name = 'Mật mã học & An toàn Thông tin'
WHERE original_name LIKE '%Ma hoa%' 
   OR original_name LIKE '%RC4%' 
   OR original_name LIKE '%TWOFISH%'
""")

# Update networking documents
conn.execute("""
UPDATE documents 
SET subject_code = 'CS202', subject_name = 'Mạng máy tính & Bảo mật Web'
WHERE original_name LIKE '%BMWEB%' 
   OR original_name LIKE '%MMH%' 
""")

# Ensure core CS101 documents have CS101
conn.execute("""
UPDATE documents 
SET subject_code = 'CS101', subject_name = 'Lập trình C & Cấu trúc Dữ liệu'
WHERE original_name LIKE '%CS101%' 
   OR original_name LIKE '%Lập trình C%' 
   OR original_name LIKE '%con trỏ%' 
   OR original_name LIKE '%BFS%' 
   OR original_name LIKE '%Cấu trúc dữ liệu%' 
   OR original_name LIKE '%Giai_Thuat%'
   OR original_name LIKE '%RBTree%'
""")

conn.commit()
print("Successfully classified all documents by subject!")
