import type { Idl } from "@coral-xyz/anchor";

export const PROGRAM_ID = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS";

export const IDL = {
  "version": "0.1.0",
  "name": "unisynapse",
  "instructions": [
    {
      "name": "initializeStudent",
      "docs": [
        "1. Kh\u1edfi t\u1ea1o t\u00e0i kho\u1ea3n h\u1ecdc t\u1eadp phi t\u1eadp trung cho sinh vi\u00ean"
      ],
      "accounts": [
        {
          "name": "studentAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "recordAcademicProof",
      "docs": [
        "2. Ghi nh\u1eadn b\u1eb1ng ch\u1ee9ng h\u1ecdc li\u1ec7u h\u1ecdc thu\u1eadt \u0111\u00e3 qua 6 c\u1ed5ng ki\u1ec3m \u0111\u1ecbnh l\u00ean Solana Devnet (Legacy)"
      ],
      "accounts": [
        {
          "name": "academicProof",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "studentAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "docId",
          "type": "string"
        },
        {
          "name": "checksumSha256",
          "type": "string"
        },
        {
          "name": "qualityScore",
          "type": "u8"
        },
        {
          "name": "chunkCount",
          "type": "u16"
        }
      ]
    },
    {
      "name": "initializeOracleRegistry",
      "docs": [
        "3. Kh\u1edfi t\u1ea1o Oracle Registry cho m\u1ea1ng l\u01b0\u1edbi Autonomous Oracle"
      ],
      "accounts": [
        {
          "name": "oracleRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "minScore",
          "type": "u8"
        }
      ]
    },
    {
      "name": "rotateOracleAuthority",
      "docs": [
        "4. Lu\u00e2n chuy\u1ec3n / C\u1eadp nh\u1eadt kh\u00f3a Oracle Authority (Admin only)"
      ],
      "accounts": [
        {
          "name": "oracleRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newOracleAuthority",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "setOraclePaused",
      "docs": [
        "5. T\u1ea1m d\u1eebng ho\u1eb7c k\u00edch ho\u1ea1t l\u1ea1i Oracle Registry (Admin only)"
      ],
      "accounts": [
        {
          "name": "oracleRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "paused",
          "type": "bool"
        }
      ]
    },
    {
      "name": "recordOracleAttestation",
      "docs": [
        "6. Ghi nh\u1eadn ch\u1ee9ng th\u1ef1c Autonomous On-Chain Oracle Attestation (P0 Core)"
      ],
      "accounts": [
        {
          "name": "oracleRegistry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleAttestation",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "replayRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "studentAccount",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "student",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracleAuthority",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "Autonomous Oracle Agent signing authority"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Account paying for rent exemption (Oracle Agent or Admin treasury)"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "docId",
          "type": "string"
        },
        {
          "name": "docHashHex",
          "type": "string"
        },
        {
          "name": "qualityScore",
          "type": "u8"
        },
        {
          "name": "chunkCount",
          "type": "u16"
        },
        {
          "name": "nonce",
          "type": "u64"
        },
        {
          "name": "expiresAt",
          "type": "i64"
        }
      ]
    },
    {
      "name": "recordLabelingConsensus",
      "docs": [
        "7. Ghi nh\u1eadn k\u1ebft qu\u1ea3 \u0111\u1ed3ng thu\u1eadn g\u00e1n nh\u00e3n d\u1eef li\u1ec7u (Data Labeling Consensus)"
      ],
      "accounts": [
        {
          "name": "consensusProof",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "taskId",
          "type": "string"
        },
        {
          "name": "winningLabel",
          "type": "string"
        },
        {
          "name": "confidenceBps",
          "type": "u16"
        },
        {
          "name": "totalVotes",
          "type": "u32"
        }
      ]
    },
    {
      "name": "recordFiatOnrampSettlement",
      "docs": [
        "8. Ghi nh\u1eadn quy\u1ebft to\u00e1n c\u1ed5ng On-Ramp VietQR ACB sang SOL Devnet"
      ],
      "accounts": [
        {
          "name": "onrampRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "orderCode",
          "type": "string"
        },
        {
          "name": "amountVnd",
          "type": "u64"
        },
        {
          "name": "lamportsSol",
          "type": "u64"
        },
        {
          "name": "recipient",
          "type": "publicKey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "OracleRegistry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "oracleAuthority",
            "type": "publicKey"
          },
          {
            "name": "minScore",
            "type": "u8"
          },
          {
            "name": "isPaused",
            "type": "bool"
          },
          {
            "name": "totalAttestations",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "OracleAttestation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "docId",
            "type": "string"
          },
          {
            "name": "docHashHex",
            "type": "string"
          },
          {
            "name": "qualityScore",
            "type": "u8"
          },
          {
            "name": "chunkCount",
            "type": "u16"
          },
          {
            "name": "nonce",
            "type": "u64"
          },
          {
            "name": "verifiedAt",
            "type": "i64"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          },
          {
            "name": "oracleAuthority",
            "type": "publicKey"
          },
          {
            "name": "student",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "ReplayRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oracleAuthority",
            "type": "publicKey"
          },
          {
            "name": "nonce",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "StudentAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "unipoints",
            "type": "u64"
          },
          {
            "name": "reputationScore",
            "type": "u32"
          },
          {
            "name": "totalDocuments",
            "type": "u32"
          },
          {
            "name": "totalTasksCompleted",
            "type": "u32"
          },
          {
            "name": "registeredAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "AcademicProofAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "docId",
            "type": "string"
          },
          {
            "name": "checksumSha256",
            "type": "string"
          },
          {
            "name": "qualityScore",
            "type": "u8"
          },
          {
            "name": "chunkCount",
            "type": "u16"
          },
          {
            "name": "verifiedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "ConsensusProofAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "taskId",
            "type": "string"
          },
          {
            "name": "winningLabel",
            "type": "string"
          },
          {
            "name": "confidenceBps",
            "type": "u16"
          },
          {
            "name": "totalVotes",
            "type": "u32"
          },
          {
            "name": "finalizedAt",
            "type": "i64"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "FiatOnRampAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "orderCode",
            "type": "string"
          },
          {
            "name": "amountVnd",
            "type": "u64"
          },
          {
            "name": "lamportsSol",
            "type": "u64"
          },
          {
            "name": "recipient",
            "type": "publicKey"
          },
          {
            "name": "treasury",
            "type": "publicKey"
          },
          {
            "name": "settledAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "OracleRegistryInitialized",
      "fields": [
        {
          "name": "admin",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oracleAuthority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "minScore",
          "type": "u8",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "OracleAuthorityRotated",
      "fields": [
        {
          "name": "admin",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldAuthority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newAuthority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "OraclePausedStateChanged",
      "fields": [
        {
          "name": "admin",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "isPaused",
          "type": "bool",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "OracleAttestationRecorded",
      "fields": [
        {
          "name": "docId",
          "type": "string",
          "index": false
        },
        {
          "name": "docHash",
          "type": "string",
          "index": false
        },
        {
          "name": "qualityScore",
          "type": "u8",
          "index": false
        },
        {
          "name": "chunkCount",
          "type": "u16",
          "index": false
        },
        {
          "name": "oracle",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "student",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "StudentRegistered",
      "fields": [
        {
          "name": "student",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "AcademicProofAnchored",
      "fields": [
        {
          "name": "student",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "docId",
          "type": "string",
          "index": false
        },
        {
          "name": "checksum",
          "type": "string",
          "index": false
        },
        {
          "name": "qualityScore",
          "type": "u8",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "ConsensusFinalized",
      "fields": [
        {
          "name": "taskId",
          "type": "string",
          "index": false
        },
        {
          "name": "winningLabel",
          "type": "string",
          "index": false
        },
        {
          "name": "confidenceBps",
          "type": "u16",
          "index": false
        },
        {
          "name": "totalVotes",
          "type": "u32",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "FiatOnRampSettled",
      "fields": [
        {
          "name": "orderCode",
          "type": "string",
          "index": false
        },
        {
          "name": "amountVnd",
          "type": "u64",
          "index": false
        },
        {
          "name": "lamportsSol",
          "type": "u64",
          "index": false
        },
        {
          "name": "recipient",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidQualityScore",
      "msg": "\u0110i\u1ec3m ch\u1ea5t l\u01b0\u1ee3ng h\u1ecdc thu\u1eadt ph\u1ea3i n\u1eb1m trong kho\u1ea3ng t\u1eeb 0 \u0111\u1ebfn 100."
    },
    {
      "code": 6001,
      "name": "ConfidenceBelowThreshold",
      "msg": "\u0110\u1ed9 tin c\u1eady ch\u01b0a \u0111\u1ea1t ng\u01b0\u1ee1ng \u0111\u1ed3ng thu\u1eadn t\u1ed1i thi\u1ec3u (80%)."
    },
    {
      "code": 6002,
      "name": "ArithmeticOverflow",
      "msg": "L\u1ed7i tr\u00e0n s\u1ed1 h\u1ecdc."
    },
    {
      "code": 6003,
      "name": "Unauthorized",
      "msg": "Kh\u00f4ng c\u00f3 quy\u1ec1n th\u1ef1c hi\u1ec7n thao t\u00e1c n\u00e0y."
    },
    {
      "code": 6004,
      "name": "OraclePaused",
      "msg": "H\u1ec7 th\u1ed1ng Oracle \u0111ang t\u1ea1m d\u1eebng b\u1ea3o tr\u00ec."
    },
    {
      "code": 6005,
      "name": "UnauthorizedOracle",
      "msg": "Ch\u1eef k\u00fd kh\u00f4ng kh\u1edbp v\u1edbi Oracle Authority \u0111\u00e3 \u0111\u0103ng k\u00fd."
    },
    {
      "code": 6006,
      "name": "QualityBelowThreshold",
      "msg": "\u0110i\u1ec3m ch\u1ea5t l\u01b0\u1ee3ng ch\u01b0a \u0111\u1ea1t ng\u01b0\u1ee1ng t\u1ed1i thi\u1ec3u c\u1ee7a Oracle."
    },
    {
      "code": 6007,
      "name": "InvalidDocId",
      "msg": "M\u00e3 t\u00e0i li\u1ec7u kh\u00f4ng h\u1ee3p l\u1ec7 ho\u1eb7c v\u01b0\u1ee3t qu\u00e1 \u0111\u1ed9 d\u00e0i cho ph\u00e9p (1-64 k\u00fd t\u1ef1)."
    },
    {
      "code": 6008,
      "name": "InvalidHashLength",
      "msg": "\u0110\u1ed9 d\u00e0i m\u00e3 b\u0103m SHA-256 kh\u00f4ng h\u1ee3p l\u1ec7 (y\u00eau c\u1ea7u \u0111\u00fang 64 k\u00fd t\u1ef1 hex)."
    },
    {
      "code": 6009,
      "name": "AttestationExpired",
      "msg": "Ch\u1ee9ng th\u1ef1c Oracle \u0111\u00e3 qu\u00e1 h\u1ea1n hi\u1ec7u l\u1ef1c."
    }
  ]
} as unknown as Idl;
