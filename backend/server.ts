import express from 'express'
import cors from 'cors'
import multer from 'multer'
import csvToJson from 'convert-csv-to-json'

const app = express()
const port = process.env.PORT ?? 3000

const storage = multer.memoryStorage()
const upload = multer({ storage: storage})

let userData : Array<Record<string, string>> = []

app.use(cors());
app.post('/api/files', upload.single('file'), async (req, res) => {
// 1. Extract file from request
const { file }  = req
// 2. Validate that file exists
if (!file) {
  return res.status(500).json({ message: 'File is required'})
}
// 3. Validate file mimetype (csv)
if (file.mimetype !== 'text/csv') {
  return res.status(500).json({ message: 'File must be .csv' })
}
let json: Array<Record<string, string>> = []
try {
// 4. Transform file (buffer) to string
  const csv = Buffer.from(file.buffer).toString('utf-8')
// 5. Tranform string to JSON
  json = csvToJson.fieldDelimiter(',').csvStringToJson(csv)
} catch (e) {
  return res.status(500).json({ message: 'Error parsing csv file' })
}

// 6. Save JSON to DB or memory
userData = json
// 7. Return 200 with th message and JSON object
  return res.status(200).json({data: json, message: 'File uploaded successfully'})
})

app.get('/api/users', async (req, res) => { 
  // 1. Extract q param from req
  const { q } = req.query 
  // 2. Validate that q param exists
  if (!q) {
    return res.status(500).json({ message: 'Query param "q" is required'})
  }

  if (typeof q !== 'string') {
    return res.status(500).json({ message: 'Query param "q" must be a string'})
  }
  // 3. Filter the data from the db (or memory) with q param
  const search = q.toLowerCase()
  const filteredData = userData.filter(row => {
    return Object.values(row).some(value => value.toLowerCase().includes(search))
  })
  // 4. Return 200 with filtered data
  return res.status(200).json({data: filteredData})
})

app.listen(port, () => {
  console.log(`Server is running at: http://localhost:${port}`)
})