export const PROGRAM_ID = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS";

export const IDL: any = {
  version: "0.1.0",
  name: "unisynapse",
  instructions: [
    {
      name: "initializeUser",
      accounts: [
        { name: "userAccount", isMut: true, isSigner: false },
        { name: "signer", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "recordContribution",
      accounts: [
        { name: "contribution", isMut: true, isSigner: false },
        { name: "userAccount", isMut: true, isSigner: false },
        { name: "signer", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "taskId", type: "string" },
        { name: "contributionType", type: "string" },
        { name: "qualityScore", type: "u8" },
        { name: "dataHash", type: "string" },
      ],
    },
  ],
  accounts: [
    {
      name: "userAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "publicKey" },
          { name: "unipoints", type: "u64" },
          { name: "reputationScore", type: "u32" },
        ],
      },
    },
    {
      name: "contribution",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "publicKey" },
          { name: "taskId", type: "string" },
          { name: "contributionType", type: "string" },
          { name: "qualityScore", type: "u8" },
          { name: "dataHash", type: "string" },
        ],
      },
    },
  ],
};
