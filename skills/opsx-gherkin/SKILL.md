---
name: opsx-gherkin
description: Write, review, or convert specification syntax that must remain compatible between OpenSpec, Markdown with Gherkin (.feature.md), and plain Gherkin (.feature) using opsx-gherkin. Use for format mappings, compatibility constraints, and conversion diagnostics; ordinary prose editing or choosing application behavior does not need this skill.
---

# OpenSpec and Gherkin compatibility

Preserve the intended behavior while expressing it in the requested format.
Read the [canonical compatibility contract](references/OPENSPEC_MDG_PROFILE.feature.md)
before authoring or changing a compatible specification. That file defines the
supported mappings; this entry point explains how to use them.

## Select the representation

| Input | Output | Command |
| --- | --- | --- |
| Markdown with Gherkin | OpenSpec | `opsx-gherkin mdg-to-opsx` |
| OpenSpec | Markdown with Gherkin | `opsx-gherkin opsx-to-mdg` |
| OpenSpec | Plain Gherkin | `opsx-gherkin opsx-to-feature` |

These are the supported conversion directions. Plain `.feature` is an output
and a directly validatable format; it is not a converter input.

For a complete main-spec example, read [account.feature.md](references/examples/account.feature.md)
and its [OpenSpec](references/examples/account.openspec.md) or
[plain Gherkin](references/examples/account.feature) counterpart as needed.
For supported delta syntax, use [authentication-delta.feature.md](references/examples/authentication-delta.feature.md)
and its [OpenSpec counterpart](references/examples/authentication-delta.openspec.md).

## Author within the contract

- Match the requested representation: Gherkin headings and bullet steps in MDG,
  OpenSpec requirement headings and bold step keywords in OpenSpec, native
  keyword lines in `.feature`. A fenced native document is not MDG structure.
- Use the contract's Feature/Purpose, Rule/Requirement, Background, and
  Scenario mappings. Supply a meaningful main-spec Purpose and the required
  `SHALL` or `MUST` wording for ordinary Rules and ADDED/MODIFIED requirements.
- Place descriptions before their child structures. Keep each Background in
  its intended scope; preserve the original step roles and all example values.
- Use English structural keywords supported by this profile. Do not translate
  keywords or rewrite domain content merely to make conversion succeed.
- Bind outline placeholders with concrete Examples rows. Keep Examples groups,
  their tags, and step Data Tables distinct. Follow the contract's indented
  Markdown table syntax and escaping. Check parsed row counts and literal
  values, especially pipes, backslashes, newlines, and Doc String contents.
- In MDG, put each tag in its own backtick span immediately above the tagged
  heading. In native Gherkin, use bare tags. Reserve `@openspec-*` and `@mdg-*`
  names for the structural roles defined by the contract.
- For deltas, mark the Feature and each operation as the contract specifies.
  REMOVED supports the requirement name only. RENAMED supports its canonical
  FROM and TO names only. Additional removal/rename content has no mapping;
  report that boundary instead of silently deleting information.

### Keep table and argument values intact

Indent Markdown table rows by two spaces. Use one header row, one Markdown
separator row, then the intended data rows. The separator is formatting; it
must not become an Examples case or a Data Table value. Plain Gherkin tables
omit that separator. Use `\|` for a literal pipe, `\\` for a literal backslash,
and `\n` for a newline inside a cell. Do not apply cell escaping to Doc Strings.

Keep a Markdown Doc String in a triple-backtick block indented by two spaces
under its step; put its optional media type immediately after the opening fence.
Preserve the content's indentation relative to the fence. In an outline, each
`<placeholder>` names an Examples column; retain every intended data row and
verify the expanded cases. The account example demonstrates two separate
Examples groups and a JSON Doc String containing a placeholder.

## Convert and verify

Each converter accepts one path, `--text`, or stdin. Use stdout to inspect a
result; use `-o <destination>` for an explicit output file. Existing outputs
require `--force`. Respect the user's destination and overwrite intent.

```sh
opsx-gherkin mdg-to-opsx input.feature.md -o spec.md
opsx-gherkin opsx-to-mdg spec.md -o output.feature.md
opsx-gherkin opsx-to-feature spec.md -o output.feature
```

Use `--name` when OpenSpec text has no title or usable source-path context.
`--project-root` supplies existing main-spec context for delta validation when
needed. Consult a converter's `--help` for its exact options.

The converters validate both endpoints and reject changes to the normalized
model before emitting output. Formatting may become canonical; names, values,
structure, and supported metadata must retain their meaning.

Direct endpoint validation checks syntax rather than conversion eligibility:

```sh
validate-spec --format openspec spec.md
validate-spec --format mdg input.feature.md
validate-spec --format feature output.feature
```

With npm/npx, use `npx opsx-gherkin <command>` for the main CLI and
`npx --package opsx-gherkin validate-spec ...` for the standalone validator.
`opsx-gherkin profile` prints the same contract linked above.

Exit status `1` means invalid input, unsupported profile content, or failed
conversion validation; `2` means usage or I/O failure. Read stderr and correct
the indicated issue without inventing a mapping or changing the intended
behavior. If the CLI is unavailable, explain the syntax from the contract and
state that execution has not been verified.
