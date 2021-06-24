const roteador = require('express').Router()
const TabelaFornecedor = require('./TabelaFornecedor')
const Fornecedor = require('./Fornecedor')
const SerializadorFornecedor = require('../../Serializador').SerializadorFornecedor



roteador.options('/', (req, res) => {
    res.set('Access-Control-Allow-Methods', 'GET, POST')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.status(204)
    res.end()
})

roteador.get('/', async (req, res) => {
    const resultados = await TabelaFornecedor.listar()
    res.status(200)
    const Serializador = new SerializadorFornecedor(
        resposta.getHeader('Content-Type'), ['empresa']
    )
    resposta.send(
        Serializador.serializar(resultados)
    )
})

roteador.post('/', async (requisicao, resposta, proximo) => {
    try{
        const dadosRecebidos = requisicao.body
        const fornecedor = new Fornecedor(dadosRecebidos)
        await fornecedor.criar()
        resposta.status(201)
        const Serializador = new SerializadorFornecedor(
            resposta.getHeader('Content-Type'), ['empresa']
        )
        resposta.send(
            Serializador.serializar(fornecedor)
        )
    } catch (erro) {
        proximo(erro)  
    }
   
})

roteador.options('/:idfornecedor', (req, res) => {
    res.set('Access-Control-Allow-Methods', 'GET, PUT, DELETE')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.status(204)
    res.end()
})

roteador.get('/:idfornecedor', async (req, res, proximo) => {
    try{
        const id = requisicao.params.idFornecedor
        const fornecedor = new Fornecedor ({ id: id })
        await fornecedor.carregar()
        res.status(200)
        const Serializador = new SerializadorFornecedor(
            resposta.getHeader('Content-Type'), 
            ['empresa', 'email', 'dataCriacao', 'dataAtualizacao', 'versao']
        )
        resposta.send(
            Serializador.serializar(fornecedor)
        )
    } catch (erro) {
        proximo(erro)
    }
})

roteador.put('/:idFornecedor', async (requisicao, resposta, proximo) => {
    try{
        const id = requisicao.params.idFornecedor
        const dadosRecebidos = requisicao.body
        const dados = Object.assign({}, dadosRecebidos, { id: id})
        const fornecedor = new Fornecedor(dados)
        await fornecedor.atualizar()
        resposta.status(204)
        resposta.end()
    } catch (erro){
        proximo(erro)
    }
})

roteador.delete('/:idFornecedor', async (req, res, proximo) => {
    try{
        const id = requisicao.params.idFornecedor
        const fornecedor = new Fornecedor({ id : id })
        await fornecedor.carregar()
        await fornecedor.remover()
        res.status(204)
        res.end()
    } catch (erro) {
       proximo(erro)
    }
})

const roteadorProdutos = require('./produtos')

const verificarFornecedor = async (requisicao, resposta, proximo) => {
    try{
        const id = requisicao.params.idFornecedor
        const fornecedor = new Fornecedor({ id: id })
        await fornecedor.carregar()
        requisicao.fornecedor = fornecedor
        proximo()
    } catch (erro) {
        proximo(erro)
    }
}

roteador.use('/:idFornecedor/produtos', verificarFornecedor, roteadorProdutos)

module.exports = roteador