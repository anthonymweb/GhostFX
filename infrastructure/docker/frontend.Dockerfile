FROM node:22-alpine

WORKDIR /app

COPY package.json /app/package.json
COPY tsconfig.base.json /app/tsconfig.base.json
COPY apps/frontend/package.json /app/apps/frontend/package.json
COPY packages/shared-types/package.json /app/packages/shared-types/package.json
COPY packages/ui/package.json /app/packages/ui/package.json

RUN npm install

COPY apps/frontend /app/apps/frontend
COPY packages/shared-types /app/packages/shared-types
COPY packages/ui /app/packages/ui

WORKDIR /app/apps/frontend
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
