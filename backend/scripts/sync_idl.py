import json
import os

def sync_idl():
    src = os.path.join("program", "target", "idl", "unisynapse.json")
    dst = os.path.join("frontend", "src", "lib", "idl.ts")

    with open(src, "r", encoding="utf-8") as f:
        idl_json = json.load(f)

    idl_str = json.dumps(idl_json, indent=2)

    content = (
        'import type { Idl } from "@coral-xyz/anchor";\n\n'
        'export const PROGRAM_ID = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS";\n\n'
        f"export const IDL = {idl_str} as unknown as Idl;\n"
    )

    with open(dst, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Synced Anchor IDL to {dst} ({len(idl_json.get('instructions', []))} instructions, {len(idl_json.get('accounts', []))} accounts)")

if __name__ == "__main__":
    sync_idl()
