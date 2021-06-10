const ModeloTabela = require('../rotas/fornecedores/ModeloTabelaFornecedor')

ModeloTabela.sync()
    .then(() => console.log('Tabela Criada com sucesso'))
    .catch(console.log)