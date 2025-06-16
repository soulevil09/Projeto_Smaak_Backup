import hashlib
from .conection_database import inicializate_database

_db = None

def get_db():
    global _db
    if _db is None:
        _db = inicializate_database()
    return _db

# função de adição no database
def add_database(nome_documento, colecao, dados):
    db = get_db()
    novo_documento = db.collection(colecao).document(nome_documento)
    novo_documento.set(dados)
    print(f'{colecao} adicionados')

def visualizate_collection_database(colecao):
    db = get_db()
    produtos_ref = db.collection(colecao)
    produtos = produtos_ref.get()
    lista = []
    for produto in produtos:
        lista.append(produto.to_dict())
    return lista

def visualizate_document_database(colecao, documento):
    db = get_db()
    produto_ref = db.collection(colecao).document(documento)
    produto = produto_ref.get()
    if produto.exists:
        print(f'{produto.id} => {produto.to_dict()}')
        return produto.to_dict()
    else:
        print(f'O documento {documento} não encontrado na coleção {colecao}')
        return None

def edit_database(colecao, documento, novos_dados):
    db = get_db()
    doc_ref = db.collection(colecao).document(documento)
    doc_snapshot = doc_ref.get()
    if doc_snapshot.exists:
        doc_ref.update(novos_dados)
        print(f"O Documento {documento} da coleção {colecao} foi alterado com sucesso!")
    else:
        print("Documento não encontrado.")

def delete_document_database(colecao, documento):
    db = get_db()
    db.collection(colecao).document(documento).delete()
    print(f'{documento} removido da coleção {colecao}')

def delete_collection_database(colecao):
    db = get_db()
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