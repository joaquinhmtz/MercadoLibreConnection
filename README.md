# MercadoLibre OAuth Integration

Un proyecto fullstack que implementa autenticación OAuth con MercadoLibre y recepción de notificaciones en tiempo real.

## 🔗 Link para tus clientes

**Una vez desplegado, envía este link a tus clientes:**

### Desarrollo (local):
```
http://localhost:3000
```

### Producción:
```
https://ucanapp.vercel.app
```

**¿Cómo funciona?**
1. Tú creas UNA aplicación en tu panel de MercadoLibre
2. Envías el link del frontend a todos tus clientes
3. Cada cliente hace clic en "Conectar con MercadoLibre"
4. Cada cliente autoriza TU aplicación a acceder a SU cuenta
5. Los tokens de cada cliente se guardan en tu base de datos con su `user_id` único
6. Tienes acceso a la data de TODOS los clientes que autoricen
7. Recibes notificaciones automáticas de todos ellos

**Ejemplo:**
- Cliente A autoriza → `user_id: "123456"` en tu BD
- Cliente B autoriza → `user_id: "789012"` en tu BD
- Cliente C autoriza → `user_id: "345678"` en tu BD

Todos usando el mismo link, pero cada uno genera sus propios tokens únicos.

## 🏗️ Arquitectura

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + React Router
- **Base de datos**: MongoDB
- **Autenticación**: OAuth 2.0 con MercadoLibre

## 📋 Características

- ✅ Autenticación OAuth completa con MercadoLibre
- ✅ Almacenamiento seguro de tokens en MongoDB
- ✅ Renovación automática de tokens
- ✅ Webhook para notificaciones en tiempo real
- ✅ Interfaz de usuario responsive
- ✅ Manejo de errores y estados de carga
- ✅ CORS configurado para desarrollo y producción

## 🚀 Configuración

### Backend (API)

1. **Instalar dependencias:**
```bash
cd API
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:
```env
CLIENT_ID=tu_client_id_de_mercadolibre
CLIENT_SECRET=tu_client_secret_de_mercadolibre
REDIRECT_URI=http://localhost:4000/auth/callback
MONGO_URI=mongodb://localhost:27017/mercadolibre_oauth
PORT=4000
NODE_ENV=development
FRONTEND_URL=https://ucanapp.vercel.app
```

3. **Ejecutar el servidor:**
```bash
npm run dev
```

### Frontend

1. **Instalar dependencias:**
```bash
cd front
npm install
```

2. **Configurar variables de entorno (opcional):**
```bash
# Crear archivo .env en la carpeta front
REACT_APP_BACKEND_URL=http://localhost:4000
```

3. **Ejecutar la aplicación:**
```bash
npm start
```

## 🔧 Configuración de MercadoLibre

1. **Crear una aplicación en MercadoLibre:**
   - Ve a [developers.mercadolibre.com](https://developers.mercadolibre.com)
   - Crea una nueva aplicación
   - Configura la URL de callback: `http://localhost:4000/auth/callback`

2. **Configurar notificaciones:**
   - En tu aplicación de MercadoLibre, configura la URL de notificaciones
   - URL de producción: `https://tu-backend-api.com/webhook/meli`
   - Selecciona los topics que deseas recibir (orders, items, questions, etc.)

## 📡 Endpoints del API

### Autenticación
- `GET /auth/meli` - Inicia el flujo OAuth
- `GET /auth/callback` - Callback de OAuth

### Usuario
- `GET /me/:user_id` - Obtiene datos del usuario

### Webhooks
- `POST /webhook/meli` - Recibe notificaciones de MercadoLibre
- `GET /webhook/events/:user_id` - Lista eventos recibidos

### Salud
- `GET /` - Health check del servidor

## 🗄️ Modelos de Base de Datos

### UserToken
```javascript
{
  user_id: String,        // ID único del usuario
  access_token: String,   // Token de acceso
  refresh_token: String,  // Token de renovación
  scope: String,          // Permisos otorgados
  expires_in: Number,     // Tiempo de expiración
  updated_at: Date        // Última actualización
}
```

### WebhookEvent
```javascript
{
  topic: String,          // Tipo de notificación
  user_id: String,        // ID del usuario
  resource: String,       // URL del recurso
  application_id: String, // ID de la aplicación
  attempts: Number,       // Número de intentos
  sent: Date,            // Fecha de envío
  received: Date,        // Fecha de recepción
  processed: Boolean,    // Si fue procesado
  data: Mixed,           // Datos del recurso
  error: String          // Error si ocurrió
}
```

## 🌐 Despliegue

### Backend
- Despliega en un servidor con HTTPS (Heroku, Railway, DigitalOcean, etc.)
- Configura las variables de entorno en producción
- Asegúrate de que MongoDB esté accesible

### Frontend
- Despliega en Vercel, Netlify o similar
- Configura `REACT_APP_BACKEND_URL` con la URL de tu backend
- El proyecto está configurado para `https://ucanapp.vercel.app`

## 🔒 Seguridad

- Los tokens se almacenan de forma segura en MongoDB
- CORS configurado para dominios específicos
- Validación de webhooks
- Renovación automática de tokens expirados

## 🐛 Debugging

### Logs del Backend
El servidor registra todas las operaciones importantes:
- Conexiones OAuth
- Renovación de tokens
- Webhooks recibidos
- Errores de API

### Verificar Webhooks
Puedes consultar los eventos recibidos:
```bash
GET /webhook/events/:user_id
```

## 📝 Notas Importantes

1. **URL de Callback**: Debe coincidir exactamente con la configurada en MercadoLibre
2. **HTTPS**: Para producción, el backend debe usar HTTPS para recibir webhooks
3. **Tokens**: Se renuevan automáticamente cuando expiran
4. **Scopes**: Los permisos solicitados son: `read_items,write_items,read_orders,read_users,read_shipping`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver el archivo LICENSE para más detalles.