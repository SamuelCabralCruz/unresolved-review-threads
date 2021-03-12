# unresolved-review-threads

GitHub Action to prevent the merge of pull request having unresolved review threads.

[![Build Status](https://github.com/SamuelCabralCruz/unresolved-review-threads/workflows/CI%20-%20Pipeline/badge.svg)](https://github.com/SamuelCabralCruz/unresolved-review-threads/actions)

## Example Usage

- Create a unresolvedReviewThreads.yml file with the following content:

  ```yaml
  name: 'Unresolved Review Threads'
  on:
    pull_request_review_comment:
      types: [created, edited, deleted]

    issue_comment:
      types: [created]

    pull_request:
      types: [opened, reopened, labeled, unlabeled]
      branches:
        - main

  jobs:
    unresolvedReviewThreads:
      runs-on: ubuntu-latest
      steps:
        - uses: SamuelCabralCruz/unresolved-review-threads@v1.x
          env:
            GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  ```

- If no label input is provided, the action will use a label named `unresolvedThreads` by default.
- Don't forget to enforce the check in your branch rule settings

## Inputs

- `useLabelTrigger`: Flag indicating if label should be use to manually trigger the action.
  - __required__: false
  - __default value__: true
- `unresolvedLabel`: Specify the name of the label to mark a pull request having unresolved review threads.
  - __required__: false
  - __default value__: unresolvedThreads
- `useCommentTrigger`: Flag indicating if comment should be used to manually trigger the action. (default: false)
  - __required__: false
  - __default value__: false
- `resolvedCommentTrigger`: Specify the content of the comment to manually trigger the check when all review threads are resolved. (default: 'LGTM')
  - __required__: false
  - __default value__: LGTM
- `deleteResolvedCommentTrigger`: Flag indicating if comment used to manually trigger the action should be deleted.
  - __required__: false
  - __default value__: true
  
## Workflow

- This action flow is currently a lot more complicated than it would otherwise be if GitHub Actions could be triggered on
  TODO: Link support tickets here
  - `pull_request_review_comment` with types: ['created', 'deleted', 'resolved', 'unresolved']
  - `issue_comment` with types: ['reaction']
  - For the time being, I opted for the following workaround flow:
    - verification flow
      - check for unresolved review threads
      - if any unresolved threads
        - add unresolved label (`unresolvedThreads` by default)
      - otherwise
        - remove unresolved label if present
      - add commit status based on result
      - remove synchronisation label if present
      - remove synchronisation comment if present (configurable)
    - will be triggered on
      - `pull_request` with types: ['opened', 'reopened', 'labeled', 'unlabeled']
      - `pull_request_review_comment` with types: ['created', 'edited', 'deleted']
      - `issue_comment` with types: ['created']
        - if new comment match the configurable trigger (by default `ALL_RESOLVED`)
- This flow is far from perfect, but aim at producing the more friction less experience possible considering technological limitation
