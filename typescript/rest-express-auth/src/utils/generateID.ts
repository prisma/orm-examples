import crypto from 'crypto'

export const generateID = async (length: number) => {
  return crypto.randomBytes(length).toString('base64')
}
