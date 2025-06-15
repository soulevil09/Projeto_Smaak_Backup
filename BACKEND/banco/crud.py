import hashlib
from .conection_database import inicializate_database

db = inicializate_database()

# função de adição no database
def add_database(nome_documento, colecao, dados):
    # if "senha" in dados:                                                     # add
    #     dados["senha"] = hashlib.sha256(dados["senha"].encode()).hexdigest() # add
    novo_documento = db.collection(colecao).document(nome_documento)
    novo_documento.set(dados)
    print(f'{colecao} adicionados')

# Visualização da coleção inteira
def visualizate_collection_database(colecao):
    produtos_ref = db.collection(colecao)
    produtos =  produtos_ref.get()

    lista = []

    for produto in produtos:
        lista.append(produto.to_dict())

    return lista

# Visualização de um documento específico dentro da coleção
def visualizate_document_database(colecao, documento):

    produto_ref = db.collection(colecao).document(documento)

    produto =  produto_ref.get()

    if produto.exists:
        print(f'{produto.id} => {produto.to_dict()}')
        return produto.to_dict()
    else:
        print(f'O documento {documento} não encontrado na coleção {colecao}')
        return None

# edição de um documento específico dentro da coleção
def edit_database(colecao, documento, novos_dados):
    
    # Recuperar os dados do documento antigo
    doc_ref = db.collection(colecao).document(documento)
    doc_snapshot = doc_ref.get()

    if doc_snapshot.exists:
        
        doc_ref.update(novos_dados)
        print(f"O Documento {documento} da coleção {colecao} foi alterado com sucesso!")
    
    else:
        print("Documento não encontrado.")

# remoção de um documento dentro da colecao
def delete_document_database(colecao, documento):

    db.collection(colecao).document(documento).delete()
    print(f'{documento} removido da coleção {colecao}')

def delete_collection_database(colecao):

    db.collection(colecao).delete()
    print(f'coleção {colecao} removida')


# nome_docunento = 'Alline'
# colecao = 'usuarios'
# dados = {
#     'email': 'alline.ogs@gmail.com',
#     'nome': 'Alline',
#     'senha': '1234'
# }

# adicionar_usuario = add_database(nome_docunento, colecao, dados)