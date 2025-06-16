import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

def inicializate_database():
    print("🔍 Verificando variáveis de ambiente...")
    
    # Debug: listar algumas variáveis de ambiente
    print(f"PORT: {os.environ.get('PORT', 'não encontrada')}")
    print(f"RAILWAY_ENVIRONMENT: {os.environ.get('RAILWAY_ENVIRONMENT', 'não encontrada')}")
    
    cred_json = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")
    
    if cred_json:
        print("✅ Variável GOOGLE_APPLICATION_CREDENTIALS_JSON encontrada!")
        print(f"📏 Tamanho do JSON: {len(cred_json)} caracteres")
        try:
            # Railway: carrega do JSON da variável de ambiente
            cred_dict = json.loads(cred_json)
            print(f"✅ JSON parseado com sucesso! Project ID: {cred_dict.get('project_id', 'não encontrado')}")
            cred = credentials.Certificate(cred_dict)
        except json.JSONDecodeError as e:
            print(f"❌ Erro ao fazer parse do JSON: {e}")
            raise e
    else:
        print("❌ Variável GOOGLE_APPLICATION_CREDENTIALS_JSON NÃO encontrada!")
        print("🔍 Variáveis disponíveis que contêm 'GOOGLE' ou 'FIREBASE':")
        for key in os.environ.keys():
            if 'GOOGLE' in key.upper() or 'FIREBASE' in key.upper():
                print(f"  - {key}")
        
        # Local: carrega do arquivo
        print("📁 Tentando carregar arquivo local...")
        cred = credentials.Certificate(r"C:\Users\igor\Documents\PROJETO SMAAK\BACKEND\banco\credentials.json")

    # Só inicializa se ainda não foi inicializado
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
        print("🔥 Firebase inicializado com sucesso!")
    else:
        print("🔥 Firebase já estava inicializado")

    db = firestore.client()
    print('✅ Banco inicializado com sucesso!')
    return db