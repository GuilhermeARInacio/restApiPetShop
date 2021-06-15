const roteador = require('express').Router()
const ModeloTabela = require('./ModeloTabelaFornecedor')
const TabelaFornecedor = require('./TabelaFornecedor')
const Fornecedor = require('./Fornecedor')
const NaoEncontrado = require('../../erros/NaoEncontrado')
const SerealizadorFornecedor = require('../../Serealizador').SerealizadorFornecedor
const SerealizadorErro = require('../../Serealizador').SerealizadorErro

roteador.get('/', async (req, res) => {
    const resultados = await TabelaFornecedor.listar()
    res.status(200)
    const serealizador = new SerealizadorFornecedor(
        resposta.getHeader('Content-Type')
    )
    resposta.send(
        serealizador.serializar(resultados)
    )
})

roteador.post('/', async (requisicao, resposta, proximo) => {
    try{
        const dadosRecebidos = requisicao.body
        const fornecedor = new Fornecedor(dadosRecebidos)
        await fornecedor.criar()
        resposta.status(201)
        const serealizador = new SerealizadorFornecedor(
            resposta.getHeader('Content-Type')
        )
        resposta.send(
            serealizador.serializar(fornecedor)
        )
    } catch (erro) {
        proximo(erro)  
    }
   
})

roteador.get('/:idfornecedor', async (req, res, proximo) => {
    try{
        const id = requisicao.params.idFornecedor
        const fornecedor = new Fornecedor ({ id: id })
        await fornecedor.carregar()
        res.status(200)
        const serealizador = new SerealizadorFornecedor(
            resposta.getHeader('Content-Type'), 
            ['email', 'dataCriacao', 'dataAtualizacao', 'versao']
        )
        resposta.send(
            serealizador.serializar(fornecedor)
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
roteador.use('/:idFornecedor/produtos', roteadorProdutos)

module.exports = roteador