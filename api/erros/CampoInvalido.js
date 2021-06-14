class CampoInvalido extends Error {
    constructor (campo) {
        const mensagem = `O Campo ${campo} está Inválido!`
        super(mensagem) 
        this.name = 'CampoInválido'
        this.idErro = 1
    }
}

module.exports = CampoInvalido