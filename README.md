# 🎮 LoL Impostor

Un juego de impostor inspirado en Among Us pero con campeones de League of Legends. Los jugadores deben dar pistas sobre su campeón asignado para identificar y expulsar al impostor.

## 🚀 Características

- **Multijugador en tiempo real** con Socket.io
- **3-8 jugadores** por sala con configuración flexible del host
- **Sistema de votación anónima** con revelación posterior
- **169 campeones de LoL** con imágenes desde Data Dragon
- **Chat en tiempo real** para dar pistas
- **Reconexión automática** si se pierde la conexión
- **Sin registro** - solo nicknames temporales

## 🎯 Cómo Jugar

1. **Crear/Unirse a una sala** con un código de 6 caracteres
2. **El host configura** número de jugadores e impostores
3. **Se asigna un campeón aleatorio** a todos excepto al(los) impostor(es)
4. **Dar pistas** en el chat sobre tu campeón (sin nombrarlo directamente)
5. **Votar para expulsar** al sospechoso impostor
6. **Ganar** eliminando a todos los impostores o siendo el último impostor

## 📁 Estructura del Proyecto

```
lol-impostor/
├── lol-impostor-backend/          # Servidor Node.js + Socket.io
│   ├── src/
│   │   ├── server.ts              # Servidor principal
│   │   ├── RoomManager.ts         # Gestión de salas y juegos
│   │   ├── types.ts               # Tipos TypeScript
│   │   └── champions.ts           # Lista de campeones
│   └── package.json
├── lol-impostor-frontend/         # Cliente React + TypeScript
│   ├── src/
│   │   ├── components/            # Componentes React
│   │   ├── hooks/                 # Hooks personalizados
│   │   ├── utils/                 # Utilidades
│   │   └── types.ts               # Tipos compartidos
│   └── package.json
└── champions.json                 # Lista original de campeones
```

## 🛠️ Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Backend
```bash
cd lol-impostor-backend
npm install
npm run dev          # Desarrollo en puerto 3001
npm run build        # Compilar para producción
npm start            # Ejecutar producción
```

### Frontend
```bash
cd lol-impostor-frontend
npm install
npm run dev          # Desarrollo en puerto 5173
npm run build        # Compilar para producción
npm run preview      # Vista previa de producción
```

## 🌐 Deployment

### Backend (Railway/Render)
1. Conectar repositorio
2. Configurar variables de entorno:
   - `NODE_ENV=production`
   - `PORT=3001`
3. Deploy automático desde main branch

### Frontend (Vercel/Netlify)
1. Conectar repositorio del frontend
2. Configurar build command: `npm run build`
3. Configurar output directory: `dist`
4. Actualizar URL del backend en `useSocket.ts`

## 🎮 Stack Tecnológico

### Backend
- **Node.js** + **Express** - Servidor HTTP
- **Socket.io** - Comunicación en tiempo real
- **TypeScript** - Tipado estático
- **UUID** - Generación de IDs únicos

### Frontend
- **React 18** + **TypeScript** - UI Framework
- **Vite** - Build tool y dev server
- **Bootstrap 5** - Estilos CSS
- **Socket.io Client** - Cliente WebSocket
- **Bootstrap Icons** - Iconos

### Datos
- **In-memory storage** - Sin base de datos para simplicidad
- **Data Dragon API** - Imágenes de campeones de Riot

## 🔧 Configuración del Host

El creador de la sala puede configurar:
- **Número máximo de jugadores** (3-8)
- **Cantidad de impostores** (1-2)
- **Tiempo de discusión** (opcional)
- **Tiempo de votación** (opcional)
- **Permitir reconexión** (sí/no)
- **Kick manual** de jugadores problemáticos

## 📊 Estados del Juego

- **WAITING** - Esperando jugadores
- **STARTING** - Asignando roles
- **DISCUSSION** - Dando pistas en el chat
- **VOTING** - Votación activa
- **REVEAL** - Mostrando resultados de votación
- **FINISHED** - Juego terminado

## 🐛 Solución de Problemas

### El frontend no se conecta al backend
- Verificar que el backend esté ejecutándose en el puerto correcto
- Revisar la URL del servidor en `useSocket.ts`
- Comprobar CORS en el servidor

### Las imágenes de campeones no cargan
- Data Dragon puede estar temporalmente inaccesible
- Se muestran imágenes de fallback automáticamente

### Desconexiones frecuentes
- Verificar conexión a internet
- El sistema permite reconexión automática si está habilitado

## 📚 Documentación Adicional

- **[QUICK-START.md](QUICK-START.md)** - Guía rápida para empezar en 5 minutos
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deploy completo a producción GRATIS
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Documentación técnica completa

## 🎯 Próximas Características

- [ ] Timers visuales para discusión/votación
- [ ] Historiales de partidas
- [ ] Estadísticas de jugador
- [ ] Más modos de juego
- [ ] Salas privadas con contraseña
- [ ] Sistema de ranking

## 🤝 Contribuir

1. Fork el repositorio
2. Crear feature branch (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la branch (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

¿Problemas o preguntas?
1. Revisar [QUICK-START.md](QUICK-START.md) para soluciones rápidas
2. Consultar [DEPLOYMENT.md](DEPLOYMENT.md) para issues de deployment
3. Ver [ARCHITECTURE.md](ARCHITECTURE.md) para entender el sistema

---

**¿Listo para jugar?** 🎮 ¡Crea una sala e invita a tus amigos!