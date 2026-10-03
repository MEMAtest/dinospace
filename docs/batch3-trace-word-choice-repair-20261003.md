# Trace Challenge choice transition repair

Independent5223 mobile QA reproduced K→c with DOG/ANT/KID retained from K. All three visibly failed the c prompt, so the next round was blocked before its Find the word action. This failure stays attached to5223.

Round reset now clears the previous choice array. After a new letter is traced, Find the word creates its own seeded choices including the matching word. Pointer trace/hints and held Next mechanics are unchanged. Independent consecutive-letter verification and full Challenge matrix remain required. No production acceptance is claimed.

Root follow-up found the generic learning-event helper would mark an unhinted keyboard guide as independent, despite the handwriting award being correctly withheld. Trace completion now explicitly sets independent from the unassisted pointer result and masteryEligible false for keyboard practice. FirstAttempt still records whether an earlier response was wrong. Current5231 fullpointer matrix may proceed; keyboard classification requires the later source delta.

Keyboard instructions now explicitly distinguish sequential Right/Down advance and Left/Up rewind, rather than suggesting geometric arrow movement. The pointer guide draws two direction arrowheads on each non-dot path before start markers, matching its existing instruction to follow arrows. Guide points/tolerances/scoring are unchanged. Direction readability and marker visibility need a narrow rendered delta; full prior pointer geometry evidence remains under its original identity.
