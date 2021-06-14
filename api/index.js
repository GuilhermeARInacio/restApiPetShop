const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const config = require('config')
const roteador = require('./rotas/fornecedores')
const NaoEncontrado = require('./erros/NaoEncontrado')
const CampoInvalido = require('./erros/CampoInvalido')
const DadosNaoFornecidos = require('./erros/DadosNaoFornecidos')
const ValorNaoSuportado = require('./erros/ValorNaoSuportado')
const formatosAceitos = require('./Serealizador').fomatosAceitos
const { SerealizadorErro } = require('./Serealizador')

app.use(bodyParser.json())

app.use('/api/fornecedores', roteador)

app.use((requisicao, resposta, proximo) => {
    let formatoRequisitado = requisicao.header('Accept')

    if(formatoRequisitado === '*/*') {
        formatoRequisitado = 'application/json'
    }

    if(formatosAceitos.indexOf(formatoRequisitado) === -1) {
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
    const serealizador = new SerealizadorErro(
        res.getHeader('Content-Type')
    )
    res.status(status)
    res.send(
        serealizador.serializar({
            mensagem: erro.message,
            id: erro.idErro
        })
    )
})

app.listen(config.get('api.porta'), () => {console.log('Api listen in port 3000')})