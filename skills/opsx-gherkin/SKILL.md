---
name: opsx-gherkin
description: Write, review, or convert specification syntax that must remain compatible between OpenSpec, Markdown with Gherkin (.feature.md), and plain Gherkin (.feature) using opsx-gherkin. Use for format mappings, compatibility constraints, and conversion diagnostics; ordinary prose editing or choosing application behavior does not need this skill.
---

# OpenSpec and Gherkin compatibility

Preserve the intended behavior while expressing it in the requested format.
Read the [canonical compatibility contract](references/OPENSPEC_MDG_PROFILE.feature.md)
in full before authoring or changing a compatible specification. Its Rules and
Scenarios specify the converter and demonstrate the format. Apply that structure
and its compatibility constraints to the requested domain's behavior. The contract
defines the supported mappings; this entry point explains how to use them.

## Select the representation

| Input | Output | Command |
| --- | --- | --- |
| Markdown with Gherkin | OpenSpec | `opsx-gherkin mdg-to-opsx` |
| OpenSpec | Markdown with Gherkin | `opsx-gherkin opsx-to-mdg` |
| OpenSpec | Plain Gherkin | `opsx-gherkin opsx-to-feature` |

These are the supported conversion directions. Plain `.feature` is an output
and a directly validatable format; it is not a converter input.

After reading the contract, choose a complete example for the constructs you need:

- Basic main spec: [minimal.feature.md](references/examples/minimal.feature.md),
  with a Feature description, a software target, one normative Rule, and a single-row Outline;
  equivalent [OpenSpec](references/examples/minimal.openspec.md) and
  [plain Gherkin](references/examples/minimal.feature).
- Shared setup, outlines, multiple Examples groups, Data Tables, and Doc Strings:
  [account.feature.md](references/examples/account.feature.md), with
  [OpenSpec](references/examples/account.openspec.md) and
  [plain Gherkin](references/examples/account.feature) counterparts.
- Delta operations: [authentication-delta.feature.md](references/examples/authentication-delta.feature.md)
  with [OpenSpec](references/examples/authentication-delta.openspec.md) and
  [plain Gherkin](references/examples/authentication-delta.feature) counterparts.
  This is a structural change document; each added/modified behavior still needs
  a complete example, while removal/rename entries retain their restricted shape.
- Finding and retrieving the contract: [profile-access.feature.md](references/profile-access.feature.md).

These examples apply the canonical contract to their own domains.

## Author within the contract

- Model each completed Feature as one whole public use case. Give each scenario
  its own necessary prior facts, one action or query, and observable consequences.
  Keep acceptance and rejection in separate scenarios of the same use case.
- Expose meaningful example values as named Outline arguments, even for one row.
  Keep independent roles distinct, such as stored/submitted credentials and
  requested/resulting quantities. Keep fixed criteria in Rules, cohesive records
  in Data Tables, and literal source text intact when the use case examines it.
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
- Identify a completed Feature's verification boundary: `@code` for software,
  `@skill` for an agent applying guidance, `@prompt` for a model executing a prompt,
  or `@plugin` for its host integration. The software teaching examples use `@code`.
  These tags identify the exercised boundary, not its internal dependencies.
  Descriptive topic tags are optional and need not be copied from the contract.
- Conversion accepts compatible untagged documents and plain Scenarios too.
  Preserve their existing model; do not insert targets or invent parameters
  while converting. Authoring conventions do not narrow syntax acceptance.
- In MDG, put each tag in its own backtick span immediately above the tagged
  heading. In native Gherkin, use bare tags. Reserve `@openspec-*` and `@mdg-*`
  names for the structural roles defined by the contract.
- For deltas, mark the Feature and each operation as the contract specifies.
  REMOVED supports the requirement name only. RENAMED supports its canonical
  FROM and TO names only. Additional removal/rename content has no mapping;
  report that boundary instead of silently deleting information.

### Keep table and argument values intact

Indent Markdown table rows by two spaces. In MDG, put data rows directly after
the header, without a separator row; the converter emits this canonical form.
OpenSpec tables retain their Markdown separator row. The pinned MDG parser
accepts either input form and preserves the interpreted rows; table formatting
must not change Examples cases or Data Table values. Plain Gherkin also omits
separators. Use `\|` for a literal pipe, `\\` for a literal backslash,
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

Direct endpoint validation checks syntax rather than conversion eligibility.
The standalone OpenSpec validator below accepts main specifications. For deltas,
use a supported conversion: it invokes the official strict delta validator and
checks model preservation.

```sh
validate-spec --format openspec spec.md
validate-spec --format mdg input.feature.md
validate-spec --format feature output.feature
```

Passing these checks establishes example syntax and conversion preservation.
Review the authored scenarios against the requested domain behavior as well;
validator success alone does not establish reliable agent authoring.

With npm/npx, use `npx opsx-gherkin <command>` for the main CLI and
`npx --package opsx-gherkin validate-spec ...` for the standalone validator.
`opsx-gherkin profile` prints the same contract linked above.

Exit status `1` means invalid input, unsupported profile content, or failed
conversion validation; `2` means usage or I/O failure. Read stderr and correct
the indicated issue without inventing a mapping or changing the intended
behavior. If the CLI is unavailable, explain the syntax from the contract and
state that execution has not been verified.
