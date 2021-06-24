const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const config = require('config')
const roteador = require('./rotas/fornecedores')
const NaoEncontrado = require('./erros/NaoEncontrado')
const CampoInvalido = require('./erros/CampoInvalido')
const DadosNaoFornecidos = require('./erros/DadosNaoFornecidos')
const ValorNaoSuportado = require('./erros/ValorNaoSuportado')
const formatosAceitos = require('./Serializador').fomatosAceitos
const { SerializadorErro } = require('./Serializador')

app.use(bodyParser.json())

app.use('/api/fornecedores', roteador)

const roteadorV2 = require('./rotas/fornecedores/rotas.v2')
app.use('/api/v2/fornecedores', roteadorV2)

app.use((requisicao, resposta, proximo) => {
    resposta.set('Access-Control-Allow-Origin', '*')
    proximo()
})

app.use((requisicao, resposta, proximo) => {
    console.log(requisicao)
    let formatoRequisitado = requisicao.header('Accept')

    if(formatoRequisitado === '*/*') {
        console.log(formatoRequisitado)
        formatoRequisitado = 'application/json'
        console.log(formatoRequisitado)
    }

    if(formatosAceitos.indexOf(formatoRequisitado) === -1) {
        console.log(formatoRequisitado)
        resposta.status(406)
        resposta.end()
        return
    }

    resposta.setHeader('Content-Type', formatoRequisitado)
    proximo()
})

app.use((erro, requisicao, res, proximo) => {
    let status = 500
    if(erro instanceof NaoEncontrado){
       status = 404
    } 
    if(erro instanceof CampoInvalido || erro instanceof DadosNaoFornecidos){
        status = 400
    }
    if(erro instanceof ValorNaoSuportado) {
        status = 406
    }
    const Serializador = new SerializadorErro(
        res.getHeader('Content-Type')
    )
    res.status(status)
    res.send(
        Serializador.serializar({
            mensagem: erro.message,
            id: erro.idErro
        })
    )
})

app.listen(config.get('api.porta'), () => {console.log('Api listen in port 3000')})