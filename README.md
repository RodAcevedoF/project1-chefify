# Chefify - Backend API

Chefify es una API RESTful construida con **Node.js**, **Express**, **MongoDB Atlas**, **Bun** y **TypeScript** que gestiona usuarios, recetas, ingredientes e imágenes. La autenticación se gestiona por sesiones server-side (Redis). Testing con **Bun** y **Supertest**.

---

## ✨ Características Principales

- Autenticación segura con sesiones server-side (Redis)
- Verificación de email mediante token.
- Flujo de reseteo de password
- Middleware de roles (admin/user)
- Subida y eliminación de imágenes en Cloudinary
- Relación entre usuarios y recetas
- Seed para poblar colecciones
- Seed para inicialización de admin
- Creación de recetas originales mediante integración con OpenAI.
- Validación con Zod.

---

## 🌐 Rutas Base

Todas las rutas están bajo el prefijo:

```
/chefify/api/v1
```

---

## 📂 Instalación

Para un resumen rápido, sigue los pasos en la documentación completa en `/docs`.

Clona y prepara el proyecto:

```bash
git clone https://github.com/tuusuario/chefify-backend.git
cd chefify-backend
bun install
```

Variables de entorno: copia `.env.example` a `.env` y completa los valores. Para más detalles y lista completa de variables revisa `docs/installation.md`.

---

## 🔒 Autenticación & Roles

### Roles:

- `user`: Por defecto al registrarse
- `admin`: Puede cambiar roles y eliminar cuentas de cualquier usuario

### Endpoints de Auth (resumen)

```
POST    /auth/login - logueo de usuario (crea sesión server-side)
POST    /auth/logout - Destruye la sesión server-side y borra la cookie de sesión
POST    /auth/logout-all - Elimina todas las sesiones abiertas para el usuario autenticado
GET     /auth/me - Obtener el usuario autenticado / estado de la sesión
```

La autenticación se gestiona mediante sesiones almacenadas en el servidor (Redis). El cliente recibe una cookie de sesión HttpOnly; el frontend debe enviar credenciales (cookies) con las peticiones. Para detalles y migración desde la estrategia previa (JWT) ver `docs/migration/session-auth.md`.

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
