/**
 * Handle CRLF
 * @param raw
 * @returns
 */
export const CRLFHandler = (raw: string) => raw.replace(/([\r|\r\n])/g, "\n")
