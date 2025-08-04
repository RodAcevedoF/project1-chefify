# Chefify - Backend API

Chefify es una API RESTful construida con **Node.js**, **Express**, **MongoDB Atlas**, **Bun** y **TypeScript** que gestiona usuarios, recetas, ingredientes e imágenes. Incluye autenticación JWT, control de roles (admin/user), subida de imágenes con Cloudinary, un sistema robusto de refresco de tokens, verificación de email e integración con la API de OpenAI para la generación de recetas mediante LLM. 

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
POST    /auth/login - logueo de usuario, debe estar verificado
POST    /auth/logout - Elimina cookies (access y refresh)
POST    /auth/refresh - refresh token
POST    /auth/logout-all - Elimina todas las sesiones abiertas
POST    /auth/logout-all/:id - (Solo admin)
GET     /auth/verify-email - Verificacion de email flujo con nodemailer
GET     /auth/forgot-password - Reset de password flujo con nodemailer
POST    /auth/reset-password - Cambio de password con el token de /forgot-password
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
POST    /user               (solo admin) - Crear usuario
GET     /user               (user) - Info de usuario (self)
GET     /user/:id           (solo admin) - Info usuario especifico
GET     /user/email         Usuario por email
PATCH   /user/:id           (user) - Modificación de usuario
DELETE  /user/:id           (user) - Borrado de usuario
GET     /user/my-recipes    (user) - Recetas creadas por el propio usuario
GET     /user/saved-recipes (user) - Recetas guardadas por usuario
```

### Recetas

```
GET     /recipe            (user) - Todas las recetas
GET     /recipe            (user) - Todas las recetas
GET     /recipe/:id        (user) - Receta por ID
GET     /recipe/category   (user) - Recetas por categoria
GET     /recipe/suggested  (user) - Recetas sugerida por AI (OpenAI), uso controlado por middleware
POST    /recipe            (user) - Crear receta
PATCH   /recipe/:id        (user) - Modificación de receta
DELETE  /recipe/:id        (user) - Borrado de receta
```

### Ingredientes

```
GET     /ingredient          (user) - Todos los ingredientes
GET     /ingredient/search   (user) - Ingredientes por nombre (no estricto)
POST    /ingredient          (user) - Crear ingrediente
PATCH   /ingredient/:id      (user) - Modificacion de  ingrediente
DELETE  /ingredient/:id      (user) - Borrado de ingrediente
```

### Imágenes (media)

```
POST    /media/:type        (solo admin) - Subir imagen sin receta o user asociado
POST    /media/:type/:id    (user) - Subir imagen para receta propia o propio user
DELETE  /media/:type/:id    (user) - Borrado de imagen de receta o user
```

### Endpoints exclusivos para admin

```
POST    /admin/recipes       (solo admin) - Datos masivos por csv
POST    /admin/ingredients   (solo admin) - Datos masivos por csv
GET     /admin/users         (solo admin) - Todos los usuarios
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

- Middleware `authenticate`: verifica JWT desde cookie
- Middleware `authGuard`: verifica si es admin o dueño del recurso, reutiliza ownership.ts
- Middleware `ownership`: valida propiedad de recurso
- Control de errores centralizado y personalizados
- Zod para validación de datos y payloads JWT
- Middleware de subida de archivos CSV
- Middleware de subida en Cloudinary

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
  /templates
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
- Servidor: Local (desarrollo) + Docker

---

## 📅 Autor

- Nombre: Rodrigo A.
- Email: [raacevedof@gmail.com](mailto:raacevedof@gmail.com)

---

## 🔗 Repositorio

[https://github.com/tuusuario/chefify-backend](https://github.com/tuusuario/chefify-backend)

---
