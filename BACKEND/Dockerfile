# Use a imagem oficial do Python 3.9
FROM python:3.10-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia o arquivo requirements.txt para o container
COPY requirements.txt .

# Instala as dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o código do projeto para o container
COPY . .

# Expõe a porta 8000 (porta que o FastAPI vai usar)
EXPOSE 8000

# Comando para rodar a aplicação quando o container iniciar
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]