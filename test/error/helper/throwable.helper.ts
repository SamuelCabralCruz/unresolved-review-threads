export const extractSafely = (throwingFunction: () => any) => {
  try {
    throwingFunction()
  } catch (e) {
    return e
  }
}

export const throwOriginal = () => {
  throw new Error('some original error')
}
