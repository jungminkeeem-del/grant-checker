import fs from 'fs'
import path from 'path'

// pdf-parse ESM 호환성 처리
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse')

let cachedText: string | null = null

export async function getRegulationText(): Promise<string> {
  if (cachedText) return cachedText

  const pdfPath = path.join(process.cwd(), 'public', 'regulation.pdf')
  const buffer = fs.readFileSync(pdfPath)
  const data = await pdfParse(buffer)
  cachedText = data.text as string
  return cachedText
}
