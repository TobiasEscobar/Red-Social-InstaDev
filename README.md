# 📱 Red Social - InstaDev

> Proyecto final para la materia **Programación IV**. Una plataforma de red social con autenticación de usuarios, creación de publicaciones/comentarios, roles admin/user y dashboard con metricas y panel de usuarios. 

![Image](https://github.com/user-attachments/assets/a127663d-5491-4fa2-a091-4803e345feb9)

## ✨ Funcionalidades Principales

- Registro e inicio de sesión de usuarios.
- Creación/eliminación de publicaciones propias.
- Creación/edición y eliminación de comentarios propios en publicaciones.
- Gestión de perfil.
- Rol de administración con permisos de eliminación de publicaciones.
- Dashboard con métricas y control de usuarios.

## 🔐 Seguridad

- Autenticación JWT
- Roles (admin / user)
- Protección de rutas con Guards
- Variables sensibles gestionadas mediante env vars

## 🧱 Arquitectura

Este proyecto está estructurado como un monorepositorio:

- Frontend → Angular + Tailwind
- Backend  → NestJS API
- Database → MongoDB Atlas

## 🌍 Deploy

- Frontend: Vercel
- Backend: Render
- Base de datos: MongoDB Atlas

Las variables de entorno se configuran por plataforma y no se incluyen en el repositorio.

# 🛠 Tecnologías Utilizadas

### Frontend:
![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/css-%23663399.svg?style=for-the-badge&logo=css&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Backend y herramientas:
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) 
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
- Uso de **[CLOUDINARY](https://console.cloudinary.com/app/product-explorer)** para el almacenamiento de imagenes

---

# 🚀 Guía de Inicio Rápido

Realiza estos pasos para levantar el proyecto en tu entorno local.

### 1. Requisitos

Debes tener previamente instalado:
* Angular +17
* Node.js (v18 o superior recomendado)
* NPM
* Git

### 2. Instalación

Clona el repositorio e instala las dependencias para ambas partes:

```bash
# Clonar repositorio
git clone <URL_DEL_REPO>
cd RED-SOCIAL

# Instalar dependencias del Backend
cd Backend
npm install

# Instalar dependencias del Frontend
cd ../Frontend
npm install
```

### 3. Configuración de Entorno (.env)

**Backend:**
Crea un archivo `.env` en la raíz de la carpeta `Backend/` con las siguientes variables:

```env
MONGODB_URI=mongodb+srv://tu_usuario:contraseña@tucluster.mongodb.net/?appName=nombreCluster
PORT=3000
W
CLOUDINARY_CLOUD_NAME=nombre_cloud
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

URL_LOCAL=http://localhost:4200
URL_VERCEL=si queres deployarlo, agregá la URL de la app acá
JWT_SECRET=tu clave secreta de JWT



/*      FRONTEND      */

Ve a la ruta Frontend/src/ y crea una carpeta llamada environments. Dentro, crea un archivo environment.ts:

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};

```

### 4. Ejecución

Necesitarás dos terminales abiertas:

**Terminal 1 (Backend):**

```Bash
cd Backend
npm nest start --watch
```

- El servidor correrá usualmente en http://localhost:3000

**Terminal 2 (Frontend):**

```Bash
cd Frontend
ng serve
```

- La aplicación estará disponible en http://localhost:4200

---


# 📷 Imágenes

- Vista de Dashboard 1: ![Image](https://github.com/user-attachments/assets/6b706cea-0163-4d86-8628-b1c7cecea3ba)
- Vista de Dashboard 2: ![Image](https://github.com/user-attachments/assets/efef1afe-256a-4078-ab69-864bf92fdb8d)
- Vista de Perfil: ![Image](https://github.com/user-attachments/assets/fd29d433-5d1a-499a-91b7-f6888df58f3b)
- Modal de publicaciones: ![Image](https://github.com/user-attachments/assets/29327c15-6422-44a2-869e-d00de546b1c8)
- Vista de registro: ![Image](https://github.com/user-attachments/assets/fdcc4c02-7648-4149-8a86-381dec4cbd36)