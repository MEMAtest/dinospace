# Reuse-only run accounting repair

The independent review of051b540 found verified audio whose manifest mapping was absent could consume a run or wait for paid capacity before repair. The B4-only execution preclassification now restores verified mappings before capacity and run accounting. Existing byte-hash/provider-receipt checks remain mandatory.

The temporary fixture deliberately saturates its isolated request journal and omits six manifest mappings while all47 fixture clips have valid source-bound or simulated fixture receipt proofs. Execution repairs the six mappings with zero runs, zero provider requests and unchanged journal. All28 focused tests passed; scoped ESLint/source diff checks passed. This is fixture execution only; no real provider was called. Independent follow-up review is pending.
