# Fresh Phase 2 default repair

Source `f9d3982`, candidate http://127.0.0.1:5364/.

Independent original observation463bdfc showed zero eligible Chapter2 words despite Grown-ups showing full Phase2 selected. Root confirmed different absent-profile defaults: literacy used only12 starting sounds, while learningProgress/settings used23 Phase2 sounds. Literacy now uses the same canonical PHASE_SOUNDS[2]. Explicit selectedSounds and legacy taughtGraphemes remain respected. Phase3 remains unavailable until introduced.

Regression verifies fresh displayed settings and reader agree, Chapter2 has20+ eligible words and Chapter3 remains unavailable. Existing explicit taught-profile/decodability and LetterLaunch checks pass:26tests,0failures; scoped lint/configured build pass. Build retains existing Browserslist/chunk warnings.

Frozen5362 is preserved. New5364 dist is immutable; generated manifest is a local file hash inventory, not a claimed all-file HTTP audit. Independent actual fresh-profile controls and critical served hashes are assigned. No audio/manifest/provider call or deployment.
