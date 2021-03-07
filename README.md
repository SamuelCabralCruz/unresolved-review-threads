# unresolved-review-threads

GitHub Action to prevent the merge of pull request having unresolved review threads

[![Build Status](https://github.com/SamuelCabralCruz/unresolved-review-threads/workflows/CI%20-%20Pipeline/badge.svg)](https://github.com/SamuelCabralCruz/unresolved-review-threads/actions)

## Example Usage

- Create a unresolvedReviewThreads.yml file with the following content:
    ```yaml
    name: Unresolved Review Threads 
    on:
      pull_request:
        types: [opened, edited, labeled, reopened, review_requested]
        branch:
          - main
      pull_request_review_comment:
        types: [created, edited, deleted]

    jobs:
      build:
        name: 'Unresolved Review Threads'
        runs-on: ubuntu-latest
        steps:
          - uses: SamuelCabralCruz/unresolved-review-threads@v1.x
            with:
              label: 'myCustomLabelTrigger'
            env:
              GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    ```
- If no label input is provided, the action will use a label name `reviewThreadsResolved` by default.
