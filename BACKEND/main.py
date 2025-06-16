# backend/main.py
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from collections import defaultdict
from pydantic import BaseModel
from banco.crud import delete_document_database, edit_database, visualizate_document_database, visualizate_collection_database, add_database
import hashlib

# Adicionar estes imports após os imports existentes
import pandas as pd
from prophet import Prophet
import numpy as np
from datetime import datetime, timedelta
import json
import os

print("TESTE_IGOR:", os.environ.get("TESTE_IGOR"))

app = FastAPI()

# Liberar acesso para o React Native (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # durante o desenvolvimento pode deixar assim
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo do corpo da requisição
class LoginRequest(BaseModel):
    username: str
    password: str

class IngredienteRequest(BaseModel):  
    id_ingrediente: str  
    nome: str  
    unidade: str  
    preco: float  
  
class ProdutoIngredienteRequest(BaseModel):  
    id_ingrediente: str  
    quantidade: float  
  
class ProdutoRequest(BaseModel):  
    id_produto: str  
    nome: str  
    preco: float  
    ingredientes: list[ProdutoIngredienteRequest]

class ProdutoPagamentoRequest(ProdutoRequest):
    quantidade: int 

class PagamentoRequest(BaseModel):
    id_pagamento: str 
    data: str
    forma_pagamento: str
    cpf_cnpj: str
    valor_total: str
    produtos: list[ProdutoPagamentoRequest]

@app.post("/login")  
def login(data: LoginRequest, request: Request):  
    try:  
        user_data = visualizate_document_database("usuarios", data.username)  
  
        if not user_data:  
            return {"success": False, "message": "Usuário não encontrado"}  
  
        # password_hash = hashlib.sha256(data.password.encode()).hexdigest()  
  
        if user_data.get("senha") == data.password:  
            return {"success": True, "message": "Login bem-sucedido"}  
        else:  
            return {"success": False, "message": "Senha incorreta"}  
    except Exception as e:  
        print(f"Erro no login: {e}")  
        # Retorne sempre JSON, mesmo em caso de erro  
        return {"success": False, "message": f"Erro interno: {str(e)}"}
    
@app.post("/produtos")
def salvar_produto(data: ProdutoRequest):
    dados_produto = {
        'id_produto': data.id_produto,
        'nome': data.nome,
        'preco': data.preco,
        'ingredientes': [ing.model_dump() for ing in data.ingredientes]
    }

    add_database(data.id_produto, "produtos", dados_produto)

    return {"sucess": True, "message": "Produto Salvo com sucesso"}

@app.get("/produtos")
def listar_produtos():
    produtos = visualizate_collection_database('produtos')
    return produtos

@app.put("/produtos/{id_produto}")
def editar_produto(id_produto: str, data: ProdutoRequest):
    try:
        edit_database("produtos", id_produto, data.model_dump())
        return {"success": True, "message": "Produto editado com sucesso"}
    except Exception as e:
        print("Erro ao editar produto", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/produtos/{id_produto}")
def deletar_produto(id_produto: str):
    try:
        delete_document_database("produtos", id_produto)
        return {"sucess": True, "message": "Produto excluído com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ingredientes")
def salvar_ingrediente(data: IngredienteRequest): 
    dados_ingrediente = {
        'id_ingrediente': data.id_ingrediente,
        'nome': data.nome,
        'preco': data.preco,
        'unidade': data.unidade
    }

    add_database(data.id_ingrediente, 'ingredientes', dados_ingrediente)
    
    return {"sucess": True, "message": "Ingrediente Salvo com sucesso"}

@app.get("/ingredientes")
def listar_ingredientes():
    ingredientes  = visualizate_collection_database('ingredientes')
    return ingredientes

@app.put("/ingredientes/{id_ingrediente}")
def editar_ingrediente(id_ingrediente: str, data: IngredienteRequest):
    try:
        edit_database("ingredientes", id_ingrediente, data.model_dump())
        return {"success": True, "message": "Ingrediente editado com sucesso"}
    except Exception as e:
        print("Erro ao editar ingrediente", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/ingredientes/{id_ingrediente}")
def deletar_ingrediente(id_ingrediente: str):
    try:
        delete_document_database("ingredientes", id_ingrediente)
        return {"sucess": True, "message": "Ingrediente excluído com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/pagamento")
def salvar_pagamento(data: PagamentoRequest):
    dados_pagamento = {
        'id_pagamento': data.id_pagamento,
        'data': data.data,
        'forma_pagamento': data.forma_pagamento,
        'cpf_cnpj': data.cpf_cnpj,
        'valor_total': data.valor_total, 
        'produtos': [produto.model_dump() for produto in data.produtos]
    }

    add_database(data.id_pagamento, 'pagamento', dados_pagamento)
    print('pagamento realizado com sucesso')

    return {"success": True, "message": "Pagamento Salvo com sucesso"}

@app.get("/pagamento")
def listar_pagamentos():
    pagamentos = visualizate_collection_database('pagamento')
    return pagamentos

@app.get("/pagamento/{id_pagamento}")  
def listar_pagamentos_por_produto(id_pagamento: str):  
    try:   
        pagamento_por_produto = visualizate_document_database("pagamento", id_pagamento)  
        print(pagamento_por_produto)  
        if not pagamento_por_produto:  
            raise HTTPException(status_code=404, detail="Pagamento não encontrado")  
        return pagamento_por_produto   
    except Exception as e:  
        raise HTTPException(status_code=500, detail=str(e))

# Função para gerar relatório mensal  
def gerar_relatorio_mensal(mes_ano: str):  
    """  
    Gera relatório mensal com base nos pagamentos do mês especificado  
    Formato do mes_ano: "2025-06" (ano-mês)  
    """  
    try:  
        print(f"Gerando relatório para: {mes_ano}")  
          
        # Buscar todos os pagamentos  
        pagamentos = visualizate_collection_database('pagamento')  
        print(f"Total de pagamentos encontrados: {len(pagamentos)}")  
          
        # Filtrar pagamentos do mês especificado  
        pagamentos_mes = []  
        for pagamento in pagamentos:  
            data_pagamento = pagamento.get('data', '')  
              
            # Extrair ano-mês da data ISO (2025-06-09T00:53:53.208Z -> 2025-06)  
            if data_pagamento:  
                try:  
                    # Pegar apenas os primeiros 7 caracteres (YYYY-MM)  
                    ano_mes_pagamento = data_pagamento[:7]  
                    print(f"Comparando: '{ano_mes_pagamento}' com '{mes_ano}'")  
                      
                    if ano_mes_pagamento == mes_ano:  
                        pagamentos_mes.append(pagamento)  
                        print(f"✓ Pagamento incluído: {data_pagamento}")  
                except:  
                    print(f"Erro ao processar data: {data_pagamento}")  
          
        print(f"Pagamentos filtrados para {mes_ano}: {len(pagamentos_mes)}")  
          
        # Calcular receita total  
        receita_total = 0  
        produtos_vendidos = defaultdict(lambda: {'quantidade': 0, 'receita': 0, 'nome': ''})  
          
        for pagamento in pagamentos_mes:  
            valor_total_str = pagamento.get('valor_total', '0')  
            # Remover vírgulas e converter para float  
            valor_total = float(str(valor_total_str).replace(',', '.'))  
            receita_total += valor_total  
            print(f"Valor adicionado: {valor_total}")  
              
            # Processar produtos vendidos  
            produtos = pagamento.get('produtos', [])  
            for produto in produtos:  
                id_produto = produto.get('id_produto', '')  
                nome_produto = produto.get('nome', '')  
                preco_produto_str = produto.get('preco', 0)  
                preco_produto = float(str(preco_produto_str).replace(',', '.'))  
                  
                produtos_vendidos[id_produto]['quantidade'] += 1  
                produtos_vendidos[id_produto]['receita'] += preco_produto  
                produtos_vendidos[id_produto]['nome'] = nome_produto  
          
        print(f"Receita total calculada: {receita_total}")  
        print(f"Produtos únicos vendidos: {len(produtos_vendidos)}")  
          
        # Converter para lista e ordenar por quantidade vendida  
        produtos_mais_vendidos = []  
        for id_produto, dados in produtos_vendidos.items():  
            produtos_mais_vendidos.append({  
                'id_produto': id_produto,  
                'nome': dados['nome'],  
                'quantidade': dados['quantidade'],  
                'receita': dados['receita']  
            })  
          
        # Ordenar por quantidade (decrescente)  
        produtos_mais_vendidos.sort(key=lambda x: x['quantidade'], reverse=True)  
          
        # Criar documento do relatório  
        relatorio = {  
            'mes_ano': mes_ano,  
            'total_receita': receita_total,  
            'produtos_mais_vendidos': produtos_mais_vendidos,  
            'total_vendas': len(pagamentos_mes),  
            'data_geracao': datetime.now().isoformat()  
        }  
          
        print(f"Relatório final: {relatorio}")  
          
        # Salvar na coleção de relatórios mensais  
        add_database(mes_ano, 'relatorios_mensais', relatorio)  
          
        return relatorio  
          
    except Exception as e:  
        print(f"Erro ao gerar relatório mensal: {e}")  
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para gerar relatório mensal  
@app.post("/gerar-relatorio-mensal/{mes_ano}")  
def criar_relatorio_mensal(mes_ano: str):  
    """  
    Endpoint para gerar relatório mensal  
    Exemplo: POST /gerar-relatorio-mensal/2024-01  
    """  
    try:  
        relatorio = gerar_relatorio_mensal(mes_ano)  
        return {"success": True, "message": "Relatório gerado com sucesso", "relatorio": relatorio}  
    except Exception as e:  
        raise HTTPException(status_code=500, detail=str(e))  
  
# Endpoint para buscar relatório mensal  
@app.get("/relatorio-mensal/{mes_ano}")  
def obter_relatorio_mensal(mes_ano: str):  
    """  
    Endpoint para buscar relatório mensal  
    Regenera se houver pagamentos mais recentes que o relatório  
    """  
    try:  
        # Buscar relatório existente  
        relatorio_existente = visualizate_document_database('relatorios_mensais', mes_ano)  
          
        # Se não existir, gerar  
        if not relatorio_existente:  
            print(f"Relatório não existe para {mes_ano}, gerando...")  
            return gerar_relatorio_mensal(mes_ano)  
          
        # Verificar se há pagamentos mais recentes que o relatório  
        data_geracao_relatorio = relatorio_existente.get('data_geracao', '')  
          
        # Buscar pagamentos do mês  
        pagamentos = visualizate_collection_database('pagamento')  
        pagamentos_mes = []  
          
        for pagamento in pagamentos:  
            data_pagamento = pagamento.get('data', '')  
            if data_pagamento and data_pagamento[:7] == mes_ano:  
                pagamentos_mes.append(pagamento)  
          
        # Verificar se algum pagamento é mais recente que o relatório  
        precisa_atualizar = False  
        for pagamento in pagamentos_mes:  
            data_pagamento = pagamento.get('data', '')  
            if data_pagamento > data_geracao_relatorio:  
                precisa_atualizar = True  
                print(f"Encontrado pagamento mais recente: {data_pagamento}")  
                break  
          
        if precisa_atualizar:  
            print(f"Regenerando relatório para {mes_ano} devido a novos pagamentos")  
            return gerar_relatorio_mensal(mes_ano)  
        else:  
            print(f"Usando relatório existente para {mes_ano}")  
            return relatorio_existente  
          
    except Exception as e:  
        print(f"Erro ao obter relatório mensal: {e}")  
        raise HTTPException(status_code=500, detail=str(e))


# ==================== MACHINE LEARNING - PREVISÃO DE VENDAS ====================

def carregar_dados_limpos():  
    """  
    Carrega dados dos CSVs já limpos (formato: Data,Total)  
    """  
    try:  
        print("📊 Carregando dados limpos...")  
          
        # Lista dos arquivos CSV limpos  
        arquivos_limpos = [  
            './ml_files/2 agosto_limpo.csv',  
            './ml_files/3 setembro_limpo.csv',   
            './ml_files/4 outubro_limpo.csv',  
            './ml_files/5 novembro_limpo.csv',  
            './ml_files/6 dezembro_limpo.csv',  
            './ml_files/7 janeiro_limpo.csv',  
            './ml_files/8 fevereiro_limpo.csv',  
            './ml_files/9 março_limpo.csv',  
            './ml_files/10 abril_limpo.csv',  
            './ml_files/11 maio_limpo.csv'  
        ]  
          
        dados_consolidados = []  
          
        for arquivo in arquivos_limpos:  
            if os.path.exists(arquivo):  
                print(f"  📄 Carregando: {os.path.basename(arquivo)}")  
                  
                # Carregar CSV (formato já limpo: Data,Total)  
                df = pd.read_csv(arquivo)  
                  
                # Converter para formato Prophet  
                for _, row in df.iterrows():  
                    dados_consolidados.append({  
                        'ds': pd.to_datetime(row['Data']),  
                        'y': float(row['Total'])  
                    })  
                  
                print(f"    ✅ {len(df)} registros carregados")  
            else:  
                print(f"    ❌ Arquivo não encontrado: {arquivo}")  
          
        if not dados_consolidados:  
            raise Exception("Nenhum dado encontrado nos arquivos CSV")  
          
        # Criar DataFrame e ordenar por data  
        df_final = pd.DataFrame(dados_consolidados)  
        df_final = df_final.sort_values('ds').reset_index(drop=True)  
          
        # Preencher lacunas de datas (importante para continuidade temporal)  
        df_final = df_final.set_index('ds').resample('D').sum().fillna(0).reset_index()  
          
        print(f"✅ Dados consolidados: {len(df_final)} dias")  
        print(f"📅 Período: {df_final['ds'].min().date()} até {df_final['ds'].max().date()}")  
        print(f"💰 Total de vendas: R$ {df_final['y'].sum():.2f}")  
        print(f"📊 Média diária: R$ {df_final['y'].mean():.2f}")  
        print(f"🎯 Dias com vendas: {len(df_final[df_final['y'] > 0])}")  
          
        return df_final  
          
    except Exception as e:  
        print(f"❌ Erro ao carregar dados: {e}")  
        raise e  
  
def treinar_modelo_otimizado():  
    """  
    Treina modelo Prophet otimizado para dados já limpos  
    """  
    try:  
        print("🤖 Treinando modelo Prophet...")  
          
        # Carregar dados limpos  
        df = carregar_dados_limpos()  
          
        # Configuração otimizada do Prophet  
        model = Prophet(  
            # Sazonalidades  
            daily_seasonality=False,      # Não precisamos (dados diários)  
            weekly_seasonality=True,      # Padrões semanais importantes  
            yearly_seasonality=True,      # Padrões anuais importantes  
              
            # Parâmetros de ajuste  
            changepoint_prior_scale=0.05, # Menos sensível a mudanças bruscas  
            seasonality_prior_scale=10.0,  # Mais peso na sazonalidade  
            holidays_prior_scale=10.0,     # Mais peso nos feriados  
              
            # Configurações gerais  
            seasonality_mode='multiplicative', # Melhor para vendas  
            interval_width=0.80,              # Intervalo de confiança 80%  
            growth='linear'                   # Crescimento linear  
        )  
          
        # Adicionar feriados brasileiros  
        model.add_country_holidays(country_name='BR')  
          
        # Adicionar sazonalidades customizadas  
        model.add_seasonality(name='monthly', period=30.5, fourier_order=5)  
          
        # Treinar modelo  
        print("  🔄 Treinando...")  
        model.fit(df)  
          
        print("  ✅ Modelo treinado com sucesso!")  
        return model, df  
          
    except Exception as e:  
        print(f"❌ Erro ao treinar modelo: {e}")  
        raise e  
  
def gerar_previsao_otimizada(dias: int = 30):  
    """  
    Gera previsão usando modelo otimizado  
    """  
    try:  
        print(f"🔮 Gerando previsão para {dias} dias...")  
          
        # Treinar modelo  
        model, df_historico = treinar_modelo_otimizado()  
          
        # Gerar previsões futuras  
        future = model.make_future_dataframe(periods=dias, freq='D')  
        forecast = model.predict(future)  
          
        # Extrair apenas previsões futuras  
        previsoes_futuras = forecast.tail(dias)[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].copy()  
          
        # Aplicar regras de negócio  
        previsoes = []  
        media_historica = df_historico[df_historico['y'] > 0]['y'].mean()  
          
        for _, row in previsoes_futuras.iterrows():  
            valor_previsto = max(0, float(row['yhat']))  # Nunca negativo  
            limite_inf = max(0, float(row['yhat_lower']))  
            limite_sup = max(valor_previsto, float(row['yhat_upper']))  
              
            # Aplicar mínimo realista (10% da média histórica)  
            if valor_previsto > 0 and valor_previsto < (media_historica * 0.1):  
                valor_previsto = media_historica * 0.1  
              
            # Ajuste para fim de semana  
            data_obj = pd.to_datetime(row['ds'])  
            if data_obj.weekday() >= 5:  # Sábado ou domingo  
                valor_previsto *= 0.7  
                limite_sup *= 0.7  
              
            previsoes.append({  
                'data': row['ds'].strftime('%Y-%m-%d'),  
                'previsao': round(valor_previsto, 2),  
                'limite_inferior': round(limite_inf, 2),  
                'limite_superior': round(limite_sup, 2),  
                'dia_semana': data_obj.strftime('%A')  
            })  
          
        # Calcular resumo  
        total_previsto = sum([p['previsao'] for p in previsoes])  
        media_diaria = total_previsto / dias if dias > 0 else 0  
          
        resultado = {  
            'previsoes_diarias': previsoes,  
            'resumo': {  
                'total_previsto': round(total_previsto, 2),  
                'media_diaria': round(media_diaria, 2),  
                'periodo_dias': dias,  
                'data_inicio': previsoes[0]['data'] if previsoes else '',  
                'data_fim': previsoes[-1]['data'] if previsoes else ''  
            },  
            'qualidade_modelo': {  
                'dados_historicos': len(df_historico),  
                'periodo_historico': f"{df_historico['ds'].min().date()} até {df_historico['ds'].max().date()}",  
                'media_historica': round(media_historica, 2),  
                'dias_com_vendas': len(df_historico[df_historico['y'] > 0]),  
                'cobertura_temporal': f"{(df_historico['ds'].max() - df_historico['ds'].min()).days} dias"  
            },  
            'data_geracao': datetime.now().isoformat(),  
            'versao_modelo': 'otimizado_v2'  
        }  
          
        print(f"✅ Previsão gerada: R$ {total_previsto:.2f} total")  
        print(f"   📊 Média diária: R$ {media_diaria:.2f}")  
          
        return resultado  
          
    except Exception as e:  
        print(f"❌ Erro ao gerar previsão: {e}")  
        raise e  
  
def salvar_previsao_otimizada(previsao_data, dias):  
    """  
    Salva previsão no banco  
    """  
    try:  
        doc_id = f"previsao_otimizada_{dias}_dias"  
          
        previsao_completa = {  
            **previsao_data,  
            'id_previsao': doc_id,  
            'status': 'ativa'  
        }  
          
        # Salvar (substitui se já existir)  
        add_database(doc_id, 'previsoes_vendas', previsao_completa)  
          
        print(f"💾 Previsão salva: {doc_id}")  
        return doc_id  
          
    except Exception as e:  
        print(f"❌ Erro ao salvar previsão: {e}")  
        raise e  
  
# ==== ENDPOINTS DE MACHINE LEARNING OTIMIZADOS ====  
  
@app.get("/previsao-vendas-otimizada/{dias}")  
def buscar_previsao_otimizada(dias: int = 30):  
    """  
    Busca previsão otimizada existente ou gera nova  
    """  
    try:  
        doc_id = f"previsao_otimizada_{dias}_dias"  
        previsao_existente = visualizate_document_database('previsoes_vendas', doc_id)  
          
        if previsao_existente:  
            # Verificar se é recente (menos de 24h)  
            data_geracao = previsao_existente.get('data_geracao', '')  
            if data_geracao:  
                data_geracao_dt = datetime.fromisoformat(data_geracao.replace('Z', '+00:00'))  
                if (datetime.now() - data_geracao_dt.replace(tzinfo=None)).hours < 24:  
                    print(f"📊 Retornando previsão existente (recente)")  
                    return previsao_existente  
          
        # Gerar nova previsão  
        print(f"🔄 Gerando nova previsão otimizada...")  
        resultado = gerar_previsao_otimizada(dias)  
        salvar_previsao_otimizada(resultado, dias)  
          
        return resultado  
          
    except Exception as e:  
        print(f"❌ Erro ao buscar previsão otimizada: {e}")  
        raise HTTPException(status_code=500, detail=str(e))  
  
@app.post("/gerar-previsao-vendas-otimizada/{dias}")  
def gerar_nova_previsao_otimizada(dias: int = 30):  
    """  
    SEMPRE gera nova previsão otimizada  
    """  
    try:  
        resultado = gerar_previsao_otimizada(dias)  
        doc_id = salvar_previsao_otimizada(resultado, dias)  
          
        return {  
            "success": True,  
            "message": f"Nova previsão otimizada gerada para {dias} dias",  
            "doc_id": doc_id,  
            "previsao": resultado  
        }  
          
    except Exception as e:  
        print(f"❌ Erro ao gerar previsão otimizada: {e}")  
        raise HTTPException(status_code=500, detail=str(e))  
  
@app.get("/analisar-dados-limpos")  
def analisar_dados_limpos():  
    """  
    Analisa qualidade dos dados limpos  
    """  
    try:  
        df = carregar_dados_limpos()  
          
        # Estatísticas detalhadas  
        stats = {  
            'resumo_geral': {  
                'total_dias': len(df),  
                'periodo_completo': f"{df['ds'].min().date()} até {df['ds'].max().date()}",  
                'dias_com_vendas': len(df[df['y'] > 0]),  
                'dias_sem_vendas': len(df[df['y'] == 0]),  
                'cobertura_temporal_dias': (df['ds'].max() - df['ds'].min()).days  
            },  
            'vendas': {  
                'total_vendas': round(df['y'].sum(), 2),  
                'media_diaria': round(df['y'].mean(), 2),  
                'mediana_diaria': round(df['y'].median(), 2),  
                'desvio_padrao': round(df['y'].std(), 2),  
                'valor_minimo': round(df['y'].min(), 2),  
                'valor_maximo': round(df['y'].max(), 2)  
            },  
            'tendencias': {  
                'ultimos_30_dias_media': round(df.tail(30)['y'].mean(), 2),  
                'primeiros_30_dias_media': round(df.head(30)['y'].mean(), 2),  
                'crescimento_percentual': round(((df.tail(30)['y'].mean() / df.head(30)['y'].mean()) - 1) * 100, 2) if df.head(30)['y'].mean() > 0 else 0  
            },  
            'qualidade_dados': {  
                'continuidade_temporal': 'Boa' if len(df[df['y'] == 0]) < len(df) * 0.3 else 'Regular',  
                'variabilidade': 'Alta' if df['y'].std() / df['y'].mean() > 1 else 'Normal',  
                'adequado_para_previsao': len(df) >= 90  
            }  
        }  
          
        # Últimos 10 dias  
        ultimos_dados = df.tail(10)[['ds', 'y']].copy()  
        ultimos_dados['ds'] = ultimos_dados['ds'].dt.strftime('%Y-%m-%d')  
        ultimos_dados = ultimos_dados.to_dict('records')  
          
        return {  
            'estatisticas': stats,  
            'ultimos_10_dias': ultimos_dados,  
            'status': 'dados_limpos_carregados'  
        }  
          
    except Exception as e:  
        print(f"❌ Erro ao analisar dados limpos: {e}")  
        raise HTTPException(status_code=500, detail=str(e))  
  
@app.get("/status-modelo")  
def status_modelo():  
    """  
    Retorna status do modelo e dados  
    """  
    try:  
        # Verificar se arquivos existem  
        arquivos_encontrados = []  
        arquivos_faltando = []  
          
        arquivos_esperados = [  
            '2 agosto_limpo.csv', '3 setembro_limpo.csv', '4 outubro_limpo.csv',  
            '5 novembro_limpo.csv', '6 dezembro_limpo.csv', '7 janeiro_limpo.csv',  
            '8 fevereiro_limpo.csv', '9 março_limpo.csv', '10 abril_limpo.csv', '11 maio_limpo.csv'  
        ]  
          
        for arquivo in arquivos_esperados:  
            caminho = f'./ml_files/{arquivo}'  
            if os.path.exists(caminho):  
                arquivos_encontrados.append(arquivo)  
            else:  
                arquivos_faltando.append(arquivo)  
          
        # Verificar previsões existentes  
        previsoes_existentes = []  
        for dias in [7, 15, 30, 60]:  
            doc_id = f"previsao_otimizada_{dias}_dias"  
            previsao = visualizate_document_database('previsoes_vendas', doc_id)  
            if previsao:  
                previsoes_existentes.append({  
                    'periodo': f"{dias} dias",  
                    'data_geracao': previsao.get('data_geracao', ''),  
                    'total_previsto': previsao.get('resumo', {}).get('total_previsto', 0)  
                })  
          
        return {  
            'arquivos_csv': {  
                'encontrados': len(arquivos_encontrados),  
                'total_esperado': len(arquivos_esperados),  
                'lista_encontrados': arquivos_encontrados,  
                'lista_faltando': arquivos_faltando  
            },  
            'previsoes_existentes': previsoes_existentes,  
            'modelo_status': 'otimizado_v2',  
            'pronto_para_uso': len(arquivos_encontrados) > 0  
        }  
          
    except Exception as e:  
        raise HTTPException(status_code=500, detail=str(e))  
  
# Manter endpoints antigos para compatibilidade (redirecionam para otimizados)  
@app.get("/previsao-vendas/{dias}")  
def buscar_previsao_compatibilidade(dias: int = 30):  
    """Compatibilidade - redireciona para versão otimizada"""  
    return buscar_previsao_otimizada(dias)  
  
@app.post("/gerar-previsao-vendas/{dias}")  
def gerar_previsao_compatibilidade(dias: int = 30):  
    """Compatibilidade - redireciona para versão otimizada"""  
    return gerar_nova_previsao_otimizada(dias)