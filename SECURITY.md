# Security

Keep Node.js and dependencies within their supported ranges. Before converting
untrusted specifications, inspect the selected source and destination paths.
The converters treat specification content as data; they do not execute steps
or Doc Strings. Existing output files require an explicit `--force`.

For a potential vulnerability, use the private reporting channel of the hosting
repository when available. Otherwise contact its maintainer privately. Avoid
including credentials or sensitive source documents in public reports.

Include the package and Node versions, affected command, a minimal sanitized
input, and the observed behavior. Security fixes should include a regression
test and pass the package's full verification command.
