# Root visual review caught a semantic phoneme defect

The first production source d4ccfb2219495bf14d50f0e1ba81484deb7e53ee passed the literal sound-key harness, but the actual mobile screenshot showed a /c/ prompt with Lion, Cat and Kite. Both Cat and Kite begin with /k/; only Cat was accepted. Root rejected the apparent pass and returned the defect to Luna.

The original normalization only stripped slashes/case. The corrective comparison maps the actual C/Cat and K/Kite pool entries to the same phoneme key; grapheme labels, teaching prompts and narration remain unchanged. No other pool equivalence is assumed. The full Sound Safari harness now uses C/K phoneme equivalence, with additional actual-control sampling of both C and K prompts at both widths. Acceptance requires the corrective candidate and production runs; initial literal-key results alone are superseded.
