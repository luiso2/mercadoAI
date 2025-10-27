# Guía Completa: Configurar ChatGPT Actions para Mercado AI

## 📋 Información del Backend

**URL Base:** `https://mercadoai-backend-production.up.railway.app`

**Estado:** ✅ Operacional

---

## 🚀 Paso 1: Crear tu GPT Personalizado

1. Ve a: **https://chatgpt.com/gpts/editor**
2. Click en **"Create a GPT"**
3. En la pestaña **"Configure"**, llena los siguientes campos:

### Información Básica:

**Name:**
```
Mercado AI - Lista de Compras Inteligente
```

**Description:**
```
Asistente inteligente para gestionar tu lista de compras. Agrega productos, marca como comprados, obtén sugerencias automáticas y compara precios de tiendas.
```

**Instructions:**
```
Eres un asistente de compras inteligente que ayuda a los usuarios a gestionar su lista de compras de forma eficiente.

CAPACIDADES:
- Crear y gestionar listas de compras
- Agregar productos con cantidad, unidad y categoría
- Marcar productos como "comprados" o "pendientes"
- Generar sugerencias inteligentes basadas en la lista actual
- Buscar precios en tiendas (actualmente modo demo con datos simulados)
- Comparar precios entre diferentes tiendas

INSTRUCCIONES:
1. Cuando el usuario mencione productos, pregunta si quiere agregarlos a una lista nueva o existente
2. Si menciona cantidades, úsalas (ej: "2 litros de leche" → qty: 2, unit: "litro")
3. Cuando complete compras, ofrece marcar productos como "comprados"
4. Proactivamente sugiere productos complementarios (ej: si agrega pasta, sugiere salsa)
5. Si pregunta por precios, usa la búsqueda de tiendas
6. Usa emojis para hacer las respuestas más amigables 🛒

TONO: Amigable, servicial y eficiente
```

**Conversation starters:**
```
📝 Crear una nueva lista de compras
➕ Agregar productos a mi lista
✅ Ver mi lista actual
💰 Comparar precios de productos
```

---

## 🔗 Paso 2: Importar el Schema OpenAPI

1. En la sección **"Actions"**, click en **"Create new action"**
2. En **"Authentication"**, selecciona **"OAuth"** (lo configuraremos después)
3. En el campo **"Schema"**, pega la siguiente URL:

```
https://mercadoai-backend-production.up.railway.app/openapi
```

4. Click en **"Import from URL"**
5. ChatGPT cargará automáticamente todas las operaciones disponibles

### Operaciones que se importarán:
- ✅ `healthCheck` - Verificar estado del servicio
- ✅ `getLists` - Obtener todas las listas del usuario
- ✅ `createList` - Crear nueva lista
- ✅ `getListById` - Obtener lista específica
- ✅ `addItemToList` - Agregar producto a lista
- ✅ `updateItem` - Actualizar producto (marcar como comprado)
- ✅ `deleteItem` - Eliminar producto
- ✅ `getSuggestions` - Obtener sugerencias inteligentes
- ✅ `searchStores` - Buscar productos en tiendas
- ✅ `comparePrices` - Comparar precios entre tiendas

---

## 🔐 Paso 3: Configurar OAuth 2.0

Después de importar el schema, configura la autenticación:

### En la sección "Authentication":

1. **Authentication Type:** `OAuth`

2. **Client ID:**
```
chatgpt-mercado-ai
```

3. **Client Secret:**
```
no-secret-needed
```
*(Déjalo vacío o usa cualquier valor - no se valida)*

4. **Authorization URL:**
```
https://mercadoai-backend-production.up.railway.app/oauth/authorize
```

5. **Token URL:**
```
https://mercadoai-backend-production.up.railway.app/oauth/token
```

6. **Scope:**
```
openid email profile
```

7. **Token Exchange Method:** `Default (POST request)`

---

## 🌐 Paso 4: Configurar Google OAuth Redirect

ChatGPT te mostrará un **Callback URL** después de configurar OAuth. Ejemplo:
```
https://chatgpt.com/aip/g-XXXXXXXX/oauth/callback
```

**Copia esa URL** y agrégala en Google Cloud Console:

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Encuentra tu OAuth 2.0 Client ID: `943966324180-vgecl7gupn8gjm9i9l4388u8o5vpt8t8.apps.googleusercontent.com`
3. Click en ✏️ **Edit**
4. En **"Authorized redirect URIs"**, agrega:
```
https://chatgpt.com/aip/g-XXXXXXXX/oauth/callback
```
*(Reemplaza con tu URL exacta de ChatGPT)*

5. Click en **"Save"**

---

## ✅ Paso 5: Probar la Autenticación

1. En el editor de GPT, scroll down hasta **"Test"**
2. Click en **"Test action"**
3. Deberías ver un mensaje: *"Authorization needed"*
4. Click en **"Authorize"**
5. Serás redirigido a Google para iniciar sesión
6. Después de autenticar, volverás a ChatGPT
7. El GPT ahora puede llamar a todas las operaciones

---

## 🧪 Paso 6: Probar Funcionalidades

### Prueba 1: Crear Lista
```
Usuario: "Crea una lista llamada Supermercado Semanal"
```

**El GPT debería:**
- Llamar a `createList` con título "Supermercado Semanal"
- Confirmar creación y mostrar el ID de la lista

### Prueba 2: Agregar Productos
```
Usuario: "Agrega 2 litros de leche, 1 kg de arroz y pasta"
```

**El GPT debería:**
- Llamar a `addItemToList` 3 veces
- Configurar qty y unit correctamente
- Confirmar cada producto agregado

### Prueba 3: Obtener Sugerencias
```
Usuario: "¿Qué más me recomiendas comprar?"
```

**El GPT debería:**
- Llamar a `getSuggestions`
- Mostrar productos complementarios (ej: salsa para la pasta)

### Prueba 4: Marcar como Comprado
```
Usuario: "Ya compré la leche"
```

**El GPT debería:**
- Llamar a `updateItem` con status: "bought"
- Confirmar que se marcó como comprado

### Prueba 5: Comparar Precios
```
Usuario: "¿Cuánto cuesta la leche en diferentes tiendas?"
```

**El GPT debería:**
- Llamar a `comparePrices` o `searchStores`
- Mostrar precios de diferentes tiendas (datos demo)

---

## 🔧 Troubleshooting

### Error: "Authorization failed"
**Solución:** Verifica que la Callback URL de ChatGPT esté agregada en Google Cloud Console

### Error: "Cannot GET /oauth/authorize"
**Solución:** El backend está activo. Verifica la URL exacta en ChatGPT.

### Error: "Invalid grant"
**Solución:** El código de autorización expiró (60 segundos). Intenta de nuevo.

### El GPT no recuerda listas entre conversaciones
**Solución:** Es normal. Cada sesión de ChatGPT es independiente. Los datos están en MongoDB, pero necesitas el list_id para acceder.

---

## 📊 Datos de Prueba

El sistema incluye un **provider mock** con datos simulados para testing:

### Tiendas disponibles:
- Ralphs
- Vons
- Whole Foods
- Trader Joe's

### Productos con precios:
- **Leche:** $3.99 - $4.99
- **Pan:** $2.49 - $3.99
- **Huevos:** $3.49 - $5.99
- **Manzanas:** $1.99 - $2.99/lb
- **Arroz:** $4.99 - $6.99
- **Pasta:** $1.49 - $2.99

---

## 🎯 Mejores Prácticas

1. **Sé específico con cantidades:**
   - ✅ "2 litros de leche"
   - ❌ "leche" (el GPT preguntará cuánto)

2. **Usa lenguaje natural:**
   - ✅ "Agrega tomates y lechuga"
   - ✅ "Ya compré el pan"
   - ✅ "¿Cuánto cuesta el arroz?"

3. **El GPT puede inferir categorías:**
   - "Leche" → Lácteos
   - "Manzanas" → Frutas
   - "Arroz" → Granos

4. **Pide sugerencias proactivamente:**
   - "¿Qué me falta?"
   - "Dame ideas para completar mi lista"

---

## 🚀 Próximos Pasos (Producción)

Para llevar esto a producción real:

1. **Reemplazar Mock Provider:**
   - Integrar APIs reales de supermercados (Instacart, Amazon Fresh, etc.)
   - Implementar scraping de precios

2. **Persistencia de Grants:**
   - Usar Redis en lugar de memoria
   - Configurar en Railway: `railway add redis`

3. **Rate Limiting:**
   - Implementar límites de requests por usuario

4. **Analytics:**
   - Trackear productos más agregados
   - Sugerencias basadas en ML

---

## 📞 Soporte

**Backend Status:** https://mercadoai-backend-production.up.railway.app/health

**GitHub Repo:** https://github.com/luiso2/mercadoAI

**API Docs:** https://mercadoai-backend-production.up.railway.app/openapi

---

¡Tu GPT está listo para gestionar listas de compras inteligentes! 🛒✨
