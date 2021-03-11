type Label = Readonly<{name?: string}>
export type PullRequest = Readonly<{
    number: number,
    headRef: string,
    labels: Label[],
}>
