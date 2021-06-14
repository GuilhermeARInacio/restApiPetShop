const ValorNaoSuportado = require('./erros/ValorNaoSuportado')
const jsontoxml = require('jsontoxml')

class Serealizador {
    json (dados) {
        JSON.stringify(dados)
    }

    xml (dados) {
        let tag = this.tagSingular

        if(Array.isArray(dados)){
            tag = this.tagPlural
            dados = dados.map((item) => {
                return {
                    [this.tagSingular]: item
                }
            })
        }
        return jsontoxml({ [this.tag] : dados})
    }

    serializar (dados) {
        dados = this.filtrar(dados)
        if (this.contentType === 'application/json') {
            return this.json(dados)
        }

        if (this.contentType === 'application/xml') {
            return this.xml(dados)
        }
        throw new ValorNaoSuportado(this.contentType)
    }

    filtrarObjeto (dados) {
        const novoObjeto = {}
        this.camposPublicos.forEach((campo) => {
            if(dados.hasOwnProperty(campo)) {
                novoObjeto[campo] = dados[campo]
            }
        })

        return novoObjeto
    }

    filtrar (dados) {
        if (Array.isArray(dados)) {
            dados = dados.map(item => {this.filtrarObjeto})
        } else {
            dados = this.filtrarObjeto(dados)
        }
    }
    
}

class SerealizadorFornecedor extends Serealizador {
    constructor(contentType, camposExtras) {
        super()
        this.contentType = contentType
        const camposPublicos = ['id', 'empresa', 'categoria'].concat(camposExtras || [])
        this.tagSingular = 'fornecedor'
        this.tagPlural = 'fornecedores'
    }
    
}

class SerealizadorErro extends Serealizador {
    constructor (contentType, camposExtras) {
        super()
        this.contentType = contentType
        this.camposPublicos = [
            'id',
            'mensagem'
        ].concat(camposExtras || [])
        this.tagSingular = 'erro'
        this.tagPlural = 'erros'
    }
}

module.exports = { 
    Serealizador: Serealizador,
    SerealizadorFornecedor : SerealizadorFornecedor,
    SerealizadorErro : SerealizadorErro,
    fomatosAceitos: ['application/json', 'application/xml']
}