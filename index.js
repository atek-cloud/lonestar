import express from 'express'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()

app.head('/', (req, res) => res.status(200).end())
app.use(express.static(join(__dirname, 'frontend/ui')))
app.use((req, res) => res.sendFile(join(__dirname, 'frontend/ui/index.html')))

const PORT = Number(process.env.ATEK_ASSIGNED_PORT)
app.listen(PORT, () => console.log('Lonestar listening on', PORT))