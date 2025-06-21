Smaak - Sistema de Gerenciamento Operacional

O Smaak é uma aplicação multiplataforma desenvolvida para facilitar o controle operacional de empresas do ramo alimentício, proporcionando uma administração eficiente de produtos, estoques, vendas e finanças por meio de uma interface intuitiva e acessível.

🚀 Funcionalidades Principais:

    -Cadastro, edição e exclusão de produtos e ingredientes
    -Gerenciamento de estoque com alertas automáticos
    -Registro e visualização de vendas realizadas
    -Controle financeiro básico (entradas e saídas)
    -Geração de relatórios simples com base nos dados armazenados
    -Histórico de compras
    -Acesso seguro por login autenticado
    -Integração total entre Front-End e Back-End via API
    -Armazenamento de dados em nuvem (Firebase Firestore)

🏗️ Arquitetura do Projeto

O sistema é composto por três camadas principais:
  
    -Front-End:
      Desenvolvido em React Native, oferece uma experiência responsiva e acessível em dispositivos móveis.
      Principais arquivos:
        -home.tsx, listarProduto.tsx, cadastrarProduto.tsx, editarProduto.tsx
        -listarIngrediente.tsx, cadastrarIngrediente.tsx, editarIngrediente.tsx
        -cadastrarCompra.tsx, detalhesCompra.tsx, historicoCompra.tsx
        -pagamento.tsx, sucessoPagamento.tsx, relatorioFinanceiro.tsx, previsaoVendas.tsx
        -index.tsx (ponto de entrada)
    -Back-End:
      Desenvolvido em Python com o framework FastAPI, responsável pelo processamento das regras de negócio e integração com o banco de dados.
      Principais arquivos:
        -main.py (ponto de entrada da API)
        -crud.py (operações de banco de dados)
        -conection_database.py (conexão com o Firestore)
        -ml_files/ (pasta com arquivos de dados históricos para análises e previsões)
    -Banco de Dados:
      Utiliza Firebase Firestore para armazenamento seguro e escalável das informações de usuários, produtos, pedidos e registros financeiros.

📦 Instalação e Execução

Pré-requisitos:

    Node.js e npm/yarn
    Python 3.8+
    Conta no Firebase com Firestore configurado

Front-End:

    cd <pasta-do-front>  
    npm install  
    npm start  

Back-End:

    cd <pasta-do-back>  
    pip install -r requirements.txt  
    uvicorn main:app --reload  

Configuração do Firebase:
Adicione suas credenciais do Firebase no arquivo de configuração utilizado pelo back-end (conection_database.py).
📁 Estrutura de Pastas

  
├── front/                # Código React Native  
│   ├── *.tsx  
│   └── ...  
├── back/                 # Código FastAPI  
│   ├── main.py  
│   ├── crud.py  
│   ├── conection_database.py  
│   ├── ml_files/         # Dados de vendas históricos (.csv)  
│   │   ├── 2 agosto_limpo.csv  
│   │   ├── 3 setembro_limpo.csv  
│   │   ├── ...  
│   └── ...  
└── README.md  

📊 Dados e Relatórios

O projeto inclui arquivos .csv com dados históricos de vendas, localizados em back/ml_files/, que podem ser utilizados para análises, previsões e geração de relatórios financeiros.

👥 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

📄 Licença

Este projeto é de uso interno da Smaak. Para outros usos, consulte os responsáveis pelo projeto.
