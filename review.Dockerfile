# Imagem base derivada do Node
FROM node

# Diretório de trabalho
WORKDIR /app

# Comando para copiar o código fonte (inclui o services/review)
COPY . /app

# Comando para instalar as dependências
RUN npm install

# Comando para inicializar (executar) a aplicação
# ATENÇÃO: Aponta para o index.js do Review
CMD ["node", "/app/services/review/index.js"]