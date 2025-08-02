# Chefify - Backend API

Chefify es una API RESTful construida con **Node.js**, **Express**, **MongoDB Atlas** y Bun que gestiona usuarios, recetas, ingredientes e imágenes. Incluye autenticación JWT, control de roles (admin/user), subida de imágenes con Cloudinary, y un sistema robusto de refresco de tokens.

---

## ✨ Características Principales

- Autenticación segura con JWT + Refresh Token
- Verificación de email mediante token.
- Flujo de reseteo de password
- Middleware de roles (admin/user)
- Subida y eliminación de imágenes en Cloudinary
- Relación entre usuarios y recetas
- Seed para poblar colecciones
- Seed para inicialización de admin
- Creación de recetas originales mediante integración con OpenAI.
- Protección contra duplicados en arrays

---

## 🌐 Rutas Base

Todas las rutas están bajo el prefijo:

```
/chefify/api/v1
```

---

## 📂 Instalación

```bash
git clone https://github.com/tuusuario/chefify-backend.git
cd chefify-backend
npm install
```

### Variables de entorno `.env`

```dotenv
PORT=3000
MONGO_URI=your_mongo_atlas_connection
JWT_SECRET=your_jwt_secret
COOKIE_NAME=accessToken
REFRESH_COOKIE_NAME=refreshToken
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
BASE_ROUTE=chefify/api/v1
NODE_ENV=development
JWT_EXPIRES_IN="<Ex: "1h">";
REFRESH_EXPIRES_IN_DAYS=<Ex: 14>;
OPENAI_API_KEY=your_key
SMTP_HOST=your_smtp
SMTP_PORT=port
SMTP_USER=user_account
SMTP_PASS=smtp_pass
```

---

## 🔒 Autenticación & Roles

### Roles:

- `user`: Por defecto al registrarse
- `admin`: Puede cambiar roles y eliminar cuentas de cualquier usuario

### Endpoints de Auth

```
POST    /auth/login
POST    /auth/logout
POST    /auth/refresh
POST    /auth/logout-all
POST    /auth/logout-all/:id   (Solo admin)
GET     /auth/verify-email
GET     /auth/forgot-password
POST    /auth/reset-password
```

Los tokens se gestionan mediante cookies seguras:

- `accessToken`: expira en 1h
- `refreshToken`: expira en 7 días

Otros tokens como los de verificación y reset se manejan en DB.

---

## 💼 Modelos principales

### Usuario

```ts
{
    _id: string,
    name: string,
    email: string,
    password: string,
    foodPreference: string,
    savedRecipes: string[],
    imgUrl: string,
    imgPublicId: string,
    role: string ("user", "admin"),
    iaUsage: iaUsageSchema,
    emailVerificationToken: string, ,
    emailVerificationExpires: Date,
    resetPasswordToken: string,
    resetPasswordExpires: Date,
    isVerified: Boolean,
  }
```

### Receta (Recipe)

```ts
{
    _id: string,
    userId: string (ref user),
    title: String,
    ingredients: IngredientRecipe,
    instructions: string[],
    categories: {
    type: string[],
    imgUrl: string,
    imgPublicId: string,
    servings: number,
    prepTime: number ,
    utensils: string[],
  }
```

---

## 📚 Endpoints Principales

### Usuarios

```
GET     /user               (admin o el mismo usuario)
GET     /user/:id           (admin)
GET     /user/:id           (admin)
PATCH   /user/:id           (admin o el mismo usuario)
DELETE  /user/:id           (admin o el mismo usuario)
GET     /user/my-recipes    (todos los usuarios)
GET     /user/saved-recipes (todos los usuarios)
```

### Recetas

```
GET     /recipe
POST    /recipe
GET     /recipe/:id
PATCH   /recipe/:id
DELETE  /recipe/:id
```

### Ingredientes

```
GET     /ingredient
POST    /ingredient
PATCH   /ingredient/:id
DELETE  /ingredient/:id
```

### Imágenes (media)

```
POST    /media/upload       (con imagen)
DELETE  /media/:public_id
```

### Endpoints exclusivos para admin

```
POST    /media/upload       (con imagen)
DELETE  /media/:public_id
```

---

## 🧵 Seed - Semilla de Datos

Incluye scripts para cargar ingredientes y recetas iniciales así como el seed para iniciar el perfil de admin:

```bash
bun run recipe-seed
bun run admin-seed
```

---

## 🚫 Protecciones y Validaciones

- Middleware `authenticate`: verifica JWT desde cookie o header
- Middleware `authGuard`: verifica si es admin o dueño del recurso
- Middleware `ownership`: valida propiedad de recurso
- Zod para validación de datos y payloads JWT

---

## 📁 Estructura del Proyecto

```
/src
  /config
  /controllers
  /data
  /docs
  /errors
  /middlewares
  /models
  /repository
  /routes
  /schemas
  /scripts
  /services
  /types
  /utils
  app.ts
/tests
index.ts
README.MD
```

---

## 📍 Despliegue

- MongoDB: Mongo Atlas
- Servidor: Local (desarrollo), preparado para deploy

---

## 📅 Autor

- Nombre: \[Tu Nombre]
- Email: [raacevedof@gmail.com](mailto:raacevedof@gmail.com)
- Proyecto como parte de la formación en thePower

---

## 🔗 Repositorio

[https://github.com/tuusuario/chefify-backend](https://github.com/tuusuario/chefify-backend)

---
