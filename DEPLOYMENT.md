# 🚀 Deployment Guide - LoL Impostor

Guía paso a paso para subir **LoL Impostor** a producción completamente gratis usando **Vercel** (Frontend) y **Railway** (Backend).

## 📋 Requisitos Previos

- Cuenta de GitHub
- Cuenta de Vercel (gratis)
- Cuenta de Railway (gratis)
- Node.js 18+ instalado localmente

## 🎯 Arquitectura de Deployment

```
┌─────────────────┐    API Calls    ┌──────────────────┐
│   Vercel App    │◄─────────────────│  Railway Server  │
│  (Frontend)     │   WebSocket      │   (Backend)      │
│                 │                  │                  │
│ • React build   │                  │ • Node.js API    │
│ • Static files  │                  │ • Socket.io      │
│ • CDN global    │                  │ • In-memory DB   │
└─────────────────┘                  └──────────────────┘
```

---

## 🚂 Paso 1: Deploy del Backend (Railway)

### 1.1 Preparar el Backend

Primero, vamos a optimizar el backend para producción:

```bash
cd lol-impostor-backend
```

Crear archivo de configuración Railway:

**`railway.toml`**:
```toml
[build]
  builder = "nixpacks"

[deploy]
  startCommand = "npm start"
  restartPolicyType = "ON_FAILURE"
  restartPolicyMaxRetries = 10
```

### 1.2 Configurar Variables de Entorno

Crear `.env` para desarrollo local:
```bash
cp .env.example .env
```

### 1.3 Deploy en Railway

1. **Ir a [railway.app](https://railway.app)** y hacer login con GitHub
2. **Crear nuevo proyecto**: "New Project" → "Deploy from GitHub repo"
3. **Conectar repositorio**: Seleccionar tu repositorio
4. **Configurar build**:
   - Root Directory: `lol-impostor-backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`

5. **Configurar variables de entorno** en Railway Dashboard:
   ```
   NODE_ENV=production
   PORT=3001
   CORS_ORIGINS=https://tu-app.vercel.app
   ```

6. **Deploy automático**: Railway detectará cambios y hará deploy automático

### 1.4 Obtener URL del Backend

Una vez deployado, Railway te dará una URL como:
`https://lol-impostor-backend-production.up.railway.app`

**¡Guarda esta URL!** La necesitarás para el frontend.

---

## 🌐 Paso 2: Deploy del Frontend (Vercel)

### 2.1 Configurar el Frontend para Producción

```bash
cd lol-impostor-frontend
```

Actualizar la URL del backend en `src/hooks/useSocket.ts`:

```typescript
const serverUrl = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://tu-backend-railway.up.railway.app'  // ← Tu URL de Railway
    : 'http://localhost:3001');
```

### 2.2 Crear Variables de Entorno

Crear `.env.local`:
```bash
VITE_API_URL=https://tu-backend-railway.up.railway.app
```

### 2.3 Deploy en Vercel

#### Método 1: Vercel CLI (Recomendado)
```bash
npm install -g vercel
vercel login
cd lol-impostor-frontend
vercel --prod
```

#### Método 2: Dashboard Web
1. **Ir a [vercel.com](https://vercel.com)** y hacer login
2. **Crear nuevo proyecto**: "New Project" → Import Git Repository
3. **Configurar build**:
   - Framework Preset: `Vite`
   - Root Directory: `lol-impostor-frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Variables de entorno**:
   ```
   VITE_API_URL=https://tu-backend-railway.up.railway.app
   ```

5. **Deploy**: Vercel hará deploy automático

### 2.4 Actualizar CORS en Backend

Una vez que tengas la URL de Vercel, actualizar en Railway:
```
CORS_ORIGINS=https://tu-app.vercel.app,https://tu-app-git-main.vercel.app,https://tu-app.vercel.app
```

---

## ⚙️ Paso 3: Configuración Final

### 3.1 Verificar Conexión

1. **Abrir tu app**: `https://tu-app.vercel.app`
2. **Verificar conexión**: Debe mostrar "Connected to server"
3. **Crear sala de prueba** y verificar que funcione

### 3.2 Configurar Dominios Personalizados (Opcional)

#### En Vercel:
- Dashboard → Project → Settings → Domains
- Agregar dominio personalizado

#### En Railway:
- Dashboard → Project → Settings → Networking
- Configurar dominio personalizado

---

## 🛠️ Scripts de Deployment Automático

### 3.3 Crear Scripts de Build y Deploy

En la raíz del proyecto, actualizar `package.json`:

```json
{
  "scripts": {
    "deploy:backend": "cd lol-impostor-backend && railway up",
    "deploy:frontend": "cd lol-impostor-frontend && vercel --prod",
    "deploy:all": "npm run deploy:backend && npm run deploy:frontend",
    "build:prod": "npm run build:backend && npm run build:frontend",
    "test:prod": "concurrently \"npm run start:backend\" \"npm run start:frontend\""
  }
}
```

---

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. **Frontend no se conecta al Backend**
```bash
# Verificar URLs en consola del navegador
# Revisar variables de entorno en Vercel
# Confirmar CORS en Railway
```

#### 2. **Build falla en Railway**
```bash
# Verificar Node.js version en railway.toml
# Revisar logs en Railway Dashboard
# Confirmar dependencias en package.json
```

#### 3. **WebSocket no funciona**
```bash
# Railway automáticamente soporta WebSockets
# Verificar que Socket.io esté configurado correctamente
# Revisar firewall/proxy si usas VPN
```

### Logs y Debugging

#### Railway Logs:
```bash
railway logs
```

#### Vercel Logs:
```bash
vercel logs https://tu-app.vercel.app
```

---

## 💰 Límites Gratis

### Railway (Backend)
- **$5 USD gratis** por mes
- **500 horas** de ejecución
- **1GB RAM** máximo
- **1GB storage**
- Perfecto para ~200 jugadores concurrentes

### Vercel (Frontend)
- **100GB bandwidth** por mes
- **Ilimitadas** builds y deployments
- **CDN global**
- **Dominios personalizados** gratis

---

## 🚀 Comandos de Deploy Rápido

### Una vez configurado, deploy es súper simple:

```bash
# Backend (desde lol-impostor-backend/)
git push origin main  # Railway auto-deploys

# Frontend (desde lol-impostor-frontend/)
vercel --prod

# O deploy todo de una vez
npm run deploy:all
```

---

## 📊 Monitoreo en Producción

### Railway Dashboard
- CPU/Memory usage
- Request logs
- Error tracking
- Performance metrics

### Vercel Analytics
- Page views
- Performance Core Web Vitals  
- User analytics
- Error tracking

---

## 🔒 Configuración de Seguridad

### Variables de Entorno Seguras

**Railway**:
```bash
# Nunca commitear .env a git
# Usar Railway dashboard para variables sensibles
# Configurar CORS estrictamente
```

**Vercel**:
```bash
# Variables que empiecen con VITE_ son públicas
# No poner secrets en variables VITE_*
# Usar Vercel dashboard para configuración
```

### HTTPS Automático
- **Railway**: HTTPS automático con certificados SSL
- **Vercel**: HTTPS automático con certificados SSL

---

## ✅ Checklist Final

- [ ] Backend deployado en Railway
- [ ] Frontend deployado en Vercel  
- [ ] Variables de entorno configuradas
- [ ] CORS configurado correctamente
- [ ] WebSocket funcionando
- [ ] Sala de prueba creada exitosamente
- [ ] Invitar amigos y probar multijugador

---

## 🎉 ¡Listo!

Tu **LoL Impostor** ahora está **100% funcional** en producción:

- **URL Frontend**: `https://tu-app.vercel.app`
- **URL Backend**: `https://tu-backend.up.railway.app`
- **Costo**: **Completamente GRATIS** 💰
- **Jugadores**: Hasta ~200 concurrentes
- **Deploy**: Automático con git push

**¡Comparte el link con tus amigos y a jugar!** 🎮

---

## 📞 Soporte

¿Problemas? Revisar:
1. **Railway logs** para backend issues
2. **Vercel logs** para frontend issues  
3. **Browser console** para debugging
4. **Network tab** para verificar requests

**¡Que disfrutes tu juego!** 🚀