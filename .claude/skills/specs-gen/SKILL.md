---
name: specs-gen
description: "Generate specs for a new feature or a refacto. Creates new folder with specific scafolding."
---

1. Do deep research on the user query and ask as many questions as necessary to clarify everyting.
2. Chunk the specs into plausible commits:
   2.a. Never deliberately make a commit that will leave the repository in a broken state, even if you intend to shortly make another that will fix it.
   2.b. Prefer small commits to large commits. When tracking down the source of some issue by chopping through the repository, it is easier to track down the source of a problem if the steps are small; and it is easier to quickly understand the changes in a small commit.
   2.c. Prefer a single commit for a single feature, fix or other logical unit of work; avoid "partial" commits that introduce changes that are not functional without further commits, and avoid compound commits that contain several unrelated changes. If you are making a stylistic change that does not change functionality, commit that separately. All this increases the likelihood of leaving the build unbroken, and makes it much easier for another person unpicking codebase issues to understand the sequence of functional changes that took place and to grasp each individual change quickly.
   2.d. If it is a very complex feature or refactor that cannot be made safe or useful to commit while partially written, then you can as a last resort commit a broken state with --no-verify.
   2.e. User-facing changes should always be tested manually with: agent-browser if changes are made on the frontend, curl reqs or unit tests for backend. Make sure to remind it on each task file.
3. The output is a new folder in ./specs which contains 00-plan.md and 0X-<task-name>.md files for each commit and an empty progress.txt file. Each task + plan + progress (history) should have enough context for a fresh agent to continue working on it.

**Do NOT implement. Just create the specs.**
