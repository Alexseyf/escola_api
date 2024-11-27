import express from 'express'
import routesAdmins from './routes/admins'
import routesAlunos from './routes/alunosAtivos'
import routesAlunosInativos from './routes/alunosInativos'
import routesLogin from './routes/login'
import routesRecuperaSenha from './routes/recuperaSenha'
import routesValidaSenha from './routes/validaSenha'

const app = express()
const port = 3000

app.use(express.json())

app.use("/admins", routesAdmins)
app.use("/alunos", routesAlunos)
app.use("/inativos", routesAlunosInativos)
app.use("/login", routesLogin)
app.use("/recupera-senha", routesRecuperaSenha)
app.use("/valida-senha", routesValidaSenha)

app.get('/', (req, res) => {
  res.send('API - Escola Educação Infantil')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})