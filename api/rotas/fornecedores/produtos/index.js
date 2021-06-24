const roteador = require('express').Router({ mergeParams: true})
const Tabela = require('./TabelaProduto')
const Produto = require('./Produto')
const Serializador = require('../../../Serializador').SerializadorProduto

roteador.options('/', (req, res) => {
    res.set('Access-Control-Allow-Methods', 'GET, POST')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.status(204)
    res.end()
})

roteador.get('/', async (requisicao, resposta) => {
    const produtos = await Tabela.listar(requisicao.fornecedor.id)
    const serializador = new Serializador(
        resposta.getHeader('Content-Type')
    )
    resposta.send(
        serializador.serializar(produtos)
    )
})

roteador.post('/', async (requisicao,resposta, proximo) => {
    try{
        const idFornecedor = requisicao.fornecedor.id
        const corpo = requisicao.body
        const dados = Object.assign({}, corpo, { fornecedor: idFornecedor })
        const produto = new Produto(dados)
        await produto.criar()
        const serializador = new Serializador(
            resposta.getHeader('Content-Type')
        )
        resposta.set('Etag', produto.versao)
        const timeStamp = (new Date(produto.dataAtualizacao)).getTime()
        resposta.set('Last-Modified', timeStamp)
        resposta.set('Location', `/api/fornecedores/${produto.fornecedor}`)
        resposta.status(201)
        resposta.send(
            serializador.serializar(produto)
        )
    } catch (erro) {
        proximo(erro)
    }
})

roteador.options('/:id', (req, res) => {
    res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, HEAD')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.status(204)
    res.end()
})

roteador.delete('/:id', async (requisicao, resposta) => {
    const dados = {
        id: requisicao.params.id,
        fornecedor: requisicao.fornecedor.id
    }

    const produto = new Produto(dados)
    await produto.apagar()
    resposta.status(204)
    resposta.end()
})

roteador.get('/:id', async (req, res, proximo) => {
    try{
        const dados = {
            id: req.params.id,
            fornecedor: req.fornecedor.id
        }
    
        const produto = new Produto(dados)
        await produto.carregar()
        const serializador = new Serializador(
            resposta.getHeader('Content-Type'),
            ['preco', 'estoque', 'fornecedor', 'dataCriacao', 'dataAtualizacao', 'versao']
        )
        resposta.set('Etag', produto.versao)
        const timeStamp = (new Date(produto.dataAtualizacao)).getTime()
        resposta.set('Last-Modified', timeStamp)
        resposta.send(
            serializador.serializar(produto)
        )
    } catch (erro) {
        proximo(erro)
    }
})

roteador.head('/:id', async (req, res, proximo) => {
    try{
        const dados = {
            id: req.params.id,
            fornecedor: req.fornecedor.id
        }
    
        const produto = new Produto(dados)
        await produto.carregar()
        res.set('Etag', produto.versao)
        const timeStamp = (new Date(produto.dataAtualizacao)).getTime()
        res.set('Last-Modified', timeStamp)
        res.status(200)
        res.end()
    } catch (erro) {
        proximo(erro)
    }
})

roteador.put('/:id', async (req, res, proximo) =>{
    try{
        const dados = Object.assign(
            {},
            req.body,
            {
                id: req.params.id,
                fornecedor: req.fornecedor.id
            }
        )
    
        const produto = new Produto(dados)
        await produto.atualizar()
        await produto.carregar()
        resposta.set('Etag', produto.versao)
        const timeStamp = (new Date(produto.dataAtualizacao)).getTime()
        resposta.set('Last-Modified', timeStamp)
        res.status(204)
        res.end()
    } catch (erro){
        proximo(erro)
    }
})

roteador.options('/:id/diminuir-estoque', (req, res) => {
    res.set('Access-Control-Allow-Methods', 'POST')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.status(204)
    res.end()
})


roteador.post('/:id/diminuir-estoque', async (req, res, proximo) =>{
    try{
        const produto = new Produto({
            id: req.params.id,
            fornecedor: req.fornecedor.id
        })
        await produto.carregar()
        produto.estoque = produto.estoque - req.body.quantidade
        await produto.diminuirEstoque()
        await produto.carregar()
        resposta.set('Etag', produto.versao)
        const timeStamp = (new Date(produto.dataAtualizacao)).getTime()
        resposta.set('Last-Modified', timeStamp)
        res.status(204)
        res.end()
    } catch (erro) {
        proximo(erro)
    }
    
})
module.exports = roteador