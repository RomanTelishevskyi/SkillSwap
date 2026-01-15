FROM node:20-alpine

WORKDIR /app

# Устанавливаем зависимости
COPY package.json package-lock.json* ./
RUN npm install

# Копируем исходники
COPY . .

# Vite dev server
EXPOSE 5173
CMD ["npm", "run", "dev"]
