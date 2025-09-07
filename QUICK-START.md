# ⚡ Quick Start - LoL Impostor

Guía súper rápida para tener tu juego funcionando en **5 minutos**.

## 🚀 Para Jugar AHORA (Local)

```bash
# 1. Clonar e instalar
git clone <tu-repo>
cd lol-impostor
npm run install:all

# 2. Ejecutar ambos servidores
npm run dev

# 3. Abrir navegador
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
```

**¡Listo!** Ya puedes crear salas y jugar con tus amigos en tu red local.

---

## 🌐 Para Subir GRATIS a Internet (5 min)

### Paso 1: Backend en Railway
1. Ir a **[railway.app](https://railway.app)** → Login con GitHub
2. **New Project** → **Deploy from GitHub repo**
3. Seleccionar carpeta `lol-impostor-backend`
4. Agregar variables:
   ```
   NODE_ENV=production
   CORS_ORIGINS=*
   ```
5. **Deploy** → Copiar URL (ej: `https://abc123.railway.app`)

### Paso 2: Frontend en Vercel
1. Ir a **[vercel.com](https://vercel.com)** → Login con GitHub  
2. **New Project** → Import tu repo
3. Seleccionar carpeta `lol-impostor-frontend`
4. Agregar variable:
   ```
   VITE_API_URL=https://tu-url-railway.railway.app
   ```
5. **Deploy** → ¡Listo!

### Paso 3: Configurar CORS
1. En Railway → Settings → Variables
2. Cambiar `CORS_ORIGINS` por tu URL de Vercel:
   ```
   CORS_ORIGINS=https://tu-app.vercel.app
   ```

**¡Ya tienes tu juego online GRATIS!** 🎉

---

## 🎮 Cómo Jugar

1. **Crear sala** → Te da un código de 6 letras (ej: `ABC123`)
2. **Invitar amigos** → Comparte el código
3. **Configurar** → Host elige jugadores e impostores
4. **Jugar** → Dan pistas del campeón, votan al impostor

### Reglas Rápidas:
- **Jugadores normales**: Reciben el mismo campeón, dan pistas sin nombrarlo
- **Impostor**: No conoce el campeón, debe fingir que sí
- **Objetivo**: Encontrar y expulsar al impostor por votación
- **Gana impostor**: Si no lo descubren
- **Ganan jugadores**: Si expulsan al impostor

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Ejecutar ambos servidores
npm run dev:backend      # Solo backend (puerto 3001)
npm run dev:frontend     # Solo frontend (puerto 5173)

# Producción
npm run build            # Compilar todo
npm run deploy:check     # Verificar que compila bien
npm run prod:test        # Probar build local

# Mantenimiento
npm run clean            # Limpiar builds
npm run install:all      # Instalar todas las dependencias
```

---

## 🆘 Problemas Comunes

### "No se conecta al servidor"
- ✅ Verificar que backend esté corriendo
- ✅ Revisar URL en consola del navegador
- ✅ Verificar firewall/antivirus

### "Build falla"
- ✅ `npm run install:all` para reinstalar
- ✅ Verificar Node.js 18+
- ✅ Revisar errores en consola

### "No puedo crear sala"
- ✅ Backend debe estar corriendo primero
- ✅ Verificar puerto 3001 libre
- ✅ Revisar logs del servidor

---

## 📱 Uso

### Local (Red LAN)
- Perfecto para jugar con amigos en la misma casa/oficina
- Sin límites de jugadores
- Sin costos

### Online (Internet)
- Para amigos remotos
- Gratis con Railway + Vercel
- Hasta ~200 jugadores concurrentes

---

## 💡 Tips Pro

1. **Compartir salas**: Manda el código por WhatsApp/Discord
2. **Reconexión**: Si se desconectan, pueden volver con el mismo código
3. **Host controls**: Solo el creador puede kickear y configurar
4. **Pistas creativas**: "Tiene escudo", "Es de Demacia", "Ultimate global"
5. **Voting strategy**: El impostor puede votar para confundir

---

## 🎯 Próximos Pasos

¿Quieres personalizar el juego?
- Ver `DEPLOYMENT.md` para deployment avanzado
- Ver `README.md` para documentación completa  
- Modificar campeones en `champions.json`
- Cambiar estilos en `src/index.css`

**¡Que disfrutes el juego!** 🚀🎮