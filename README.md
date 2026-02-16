

## Project info



## How can I edit this code?

There are several ways of editing your application.







**Use your preferred IDE**



The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?





Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

## Configuración de la API

La base URL de la API se centraliza en `src/lib/config.ts` mediante la constante `API_BASE`.

- En desarrollo la configuración por defecto apunta a `/ords` para aprovechar el proxy de Vite y evitar problemas de CORS.
- En producción la configuración por defecto apunta a `https://oracleapex.com/ords`.

Puedes sobrescribir la base URL mediante la variable de entorno `VITE_API_BASE`. Ejemplos:

`.env` (desarrollo, usa proxy):
```
VITE_API_BASE=/ords
```

`.env` (producción):
```
VITE_API_BASE=https://oracleapex.com/ords
```

Ejemplo de uso en el código:
```ts
import { API_BASE } from '@/lib/config';
fetch(`${API_BASE}/josegalvez/paginaweb/articulos`);
```


