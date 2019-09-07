import * as fs from 'fs'

export function assertDirExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory does not exist: ${dirPath}`)
  }
}
