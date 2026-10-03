# Trace Challenge choice transition repair

Independent5223 mobile QA reproduced K→c with DOG/ANT/KID retained from K. All three visibly failed the c prompt, so the next round was blocked before its Find the word action. This failure stays attached to5223.

Round reset now clears the previous choice array. After a new letter is traced, Find the word creates its own seeded choices including the matching word. Pointer trace/hints and held Next mechanics are unchanged. Independent consecutive-letter verification and full Challenge matrix remain required. No production acceptance is claimed.
