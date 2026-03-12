import path from "node:path"

export function getServerDataDirectory() {
  const configuredDirectory = process.env.DATA_DIRECTORY?.trim()
  if (!configuredDirectory) {
    return path.join(process.cwd(), "data")
  }

  return path.isAbsolute(configuredDirectory)
    ? configuredDirectory
    : path.join(process.cwd(), configuredDirectory)
}
