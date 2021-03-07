# unresolved-review-threads

GitHub Action to prevent the merge of pull request having unresolved review threads

[![Build Status](https://github.com/SamuelCabralCruz/unresolved-review-threads/workflows/CI%20-%20Pipeline/badge.svg)](https://github.com/SamuelCabralCruz/unresolved-review-threads/actions)

## Example Usage

- Create a unresolvedReviewThreads.yml file with the following content:
    ```yaml
    name: Unresolved Review Threads 
    pull_request_review_comment:
      types: [created, edited, deleted]

    jobs:
      unresolvedReviewThreads:
        runs-on: ubuntu-latest
        steps:
          - uses: SamuelCabralCruz/unresolved-review-threads@v1.x
            env:
              GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    ```
