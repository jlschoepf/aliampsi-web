# AL·IAM·PSI — Sitio institucional + Panel de administración

Sitio web de la **Alianza Iberoamericana de Psiquiatría Infantojuvenil y Profesiones Afines**, con un panel de administración propio para gestionar todo el contenido.

Construido con **Next.js 14** (App Router), **Prisma** y **PostgreSQL**, con subida de imágenes vía **Vercel Blob**. Pensado para desplegarse en **Vercel**.

---

## Requisitos

- Node.js 18.18 o superior (recomendado 20+)
- npm
- Una base de datos **PostgreSQL** (local con Docker, o en la nube: Neon, Supabase, Vercel Postgres…)

---

## Puesta en marcha (desarrollo local)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Base de datos

**Opción A — Postgres local con Docker** (incluido):

```bash
docker compose up -d
```

Esto levanta Postgres en `localhost:5432` con las credenciales que ya vienen en `.env.example`.

**Opción B — Neon / Supabase (nube):** creá un proyecto gratis y copiá las cadenas de conexión.

### 3. Variables de entorno

```bash
cp .env.example .env
```

Editá `.env`:

- `DATABASE_URL` y `DIRECT_URL` — con Docker ya funcionan tal cual. Con Neon/Supabase, pegá las cadenas del panel (la *pooled* en `DATABASE_URL`, la *directa* en `DIRECT_URL`).
- `AUTH_SECRET` — generá una con `openssl rand -base64 32`.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — credenciales del primer administrador.
- `BLOB_READ_WRITE_TOKEN` — opcional en local (ver sección Imágenes).

### 4. Crear tablas y cargar contenido inicial

```bash
npm run setup      # prisma db push + seed
```

### 5. Levantar el servidor

```bash
npm run dev
```

Abrí **http://localhost:3000** — sitio público en `/`, panel en `/login`.

### Credenciales por defecto

- **Correo:** `admin@aliampsi.com`
- **Contraseña:** `aliampsi2025`

> Cambialas en `.env` **antes** del `setup`.

---

## Scripts

| Script              | Qué hace                                          |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                            |
| `npm run build`     | Genera Prisma Client y compila para producción    |
| `npm start`         | Sirve la versión compilada                        |
| `npm run setup`     | Crea las tablas y carga los datos iniciales       |
| `npm run db:push`   | Aplica el esquema a la base de datos              |
| `npm run db:seed`   | Carga admin + contenido de ejemplo                |
| `npm run db:studio` | Abre Prisma Studio para ver/editar la base        |

---

## Qué se administra desde el panel

En `/admin` se puede crear, editar, eliminar y publicar/despublicar:

- **Noticias** — resumen, contenido, imagen de portada y página de detalle propia.
- **Publicaciones / Revistas** — tipo (revista, artículo, documento) y enlace.
- **Congresos y actividades** — fechas, lugar y enlace al programa.
- **Asociaciones integrantes** — sigla, país, sitio web, logo y orden.

Lo marcado como *Publicado* aparece automáticamente en el sitio público.

---

## Imágenes (subir archivos)

Cada formulario con imagen permite **subir un archivo** o **pegar una URL**. Los archivos se guardan en **Vercel Blob**.

- **En Vercel:** creá un Blob Store (pestaña *Storage* → *Blob*). La variable `BLOB_READ_WRITE_TOKEN` se agrega sola al proyecto.
- **En local:** copiá ese token desde el panel de Vercel a tu `.env` para probar la subida. Si lo dejás vacío, la subida por archivo queda deshabilitada pero podés seguir cargando imágenes por URL.

Solo un administrador con sesión activa puede subir archivos (la ruta `/api/upload` valida la sesión). Se aceptan JPG, PNG, WebP, GIF y SVG de hasta 5 MB.

---

## Despliegue en Vercel

1. Subí el proyecto a un repositorio (GitHub/GitLab) e importalo en Vercel.
2. Creá la base **PostgreSQL** (Neon, Supabase o Vercel Postgres) y el **Blob Store**.
3. Cargá las variables de entorno en Vercel:
   - `DATABASE_URL` (pooled) y `DIRECT_URL` (directa)
   - `AUTH_SECRET`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   - `BLOB_READ_WRITE_TOKEN` (se crea sola al agregar el Blob Store)
4. **Preparar la base una sola vez** (desde tu máquina, apuntando a la base de producción):

   ```bash
   npm run db:push     # crea las tablas
   npm run db:seed     # crea el admin
   ```

5. Deploy. El `build` de Vercel ya ejecuta `prisma generate` automáticamente.

> El sitio no depende de WordPress: es código propio, editable y sin costos de licencias.

---

## Estructura del proyecto

```
src/
  app/
    (public)/        → sitio público (home, noticias, congresos, etc.)
    login/           → acceso al panel
    admin/           → panel protegido + CRUD de cada sección
    api/upload/      → subida de imágenes a Vercel Blob (protegida)
  components/        → header, footer, tarjetas, UI del admin, campo de imagen
  lib/               → base de datos, autenticación, utilidades
prisma/
  schema.prisma      → modelos de datos (PostgreSQL)
  seed.ts            → datos iniciales
docker-compose.yml   → Postgres local para desarrollo
```

---

## Seguridad

- Contraseñas hasheadas con **bcrypt**.
- Sesión en cookie **httpOnly** firmada con JWT (**jose**).
- Todas las acciones del panel y la subida de imágenes verifican la sesión.

Cambiá `AUTH_SECRET` y las credenciales por defecto antes de publicar.
