import { Data, ApiUploadResponse } from "../types"
import { API_HOST } from "../config"

export const uploadFile = async (file: File): Promise<[Error?, Data?]> => {
  const formData = new FormData()
  formData.append('file', file)
  console.log('api_host here', API_HOST)
  try {
    const res = await fetch(`${API_HOST}/api/files`, {
      method: 'POST',
      body: formData
    })
    if(!res.ok) return [new Error(`Error uploading file: ${res.statusText}`)]
    const json = await res.json() as ApiUploadResponse
    return [undefined, json.data]
  } catch (e) {
    if (e instanceof Error) return [e]
  }
  return [new Error('Unknown error')]
}