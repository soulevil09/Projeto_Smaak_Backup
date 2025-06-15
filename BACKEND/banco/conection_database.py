import firebase_admin
from firebase_admin import credentials, firestore


def inicializate_database():
    cred = credentials.Certificate(r"C:\Users\igor\Documents\PROJETO SMAAK\BACKEND\banco\credentials.json")
    firebase_admin.initialize_app(cred)

    db = firestore.client()
    print('banco inicializado com sucesso!')
    
    return db


