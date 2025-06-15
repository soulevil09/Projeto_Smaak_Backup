import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

def inicializate_database():
    cred_json = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")
    if cred_json:
        # Railway: carrega do JSON da variável de ambiente
        cred_dict = json.loads(cred_json)
        cred = credentials.Certificate(cred_dict)
    else:
        # Local: carrega do arquivo
        cred = credentials.Certificate(r"C:\Users\igor\Documents\PROJETO SMAAK\BACKEND\banco\credentials.json")

    # Só inicializa se ainda não foi inicializado
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)

    db = firestore.client()
    print('banco inicializado com sucesso!')
    return db