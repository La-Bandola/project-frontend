FROM node:20-alpine

# Indica que este contenedor usa el entorno de desarrollo de Node
ENV NODE_ENV=development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Documenta el puerto que expone el servidor de desarrollo de Vite
EXPOSE 5173
