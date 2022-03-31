FROM node:16-alpine

ARG MONGODB

ENV MONGODB ${MONGODB}

COPY . .

RUN npm ci

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]

