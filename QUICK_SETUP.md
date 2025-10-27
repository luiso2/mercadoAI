# 🚀 Setup Rápido - Copia y Pega

## URLs del Backend

```
Base URL:
https://mercadoai-backend-production.up.railway.app

OpenAPI Schema:
https://mercadoai-backend-production.up.railway.app/openapi

Health Check:
https://mercadoai-backend-production.up.railway.app/health
```

---

## 🔧 Configuración OAuth en ChatGPT

### Client ID:
```
chatgpt-mercado-ai
```

### Client Secret:
```
no-secret-needed
```

### Authorization URL:
```
https://mercadoai-backend-production.up.railway.app/oauth/authorize
```

### Token URL:
```
https://mercadoai-backend-production.up.railway.app/oauth/token
```

### Scope:
```
openid email profile
```

---

## 🌐 Google Cloud Console

**Tu OAuth Client ID actual:**
```
943966324180-vgecl7gupn8gjm9i9l4388u8o5vpt8t8.apps.googleusercontent.com
```

**Authorized JavaScript origins ya configurados:**
```
https://mercadoai-backend-production.up.railway.app
http://localhost:8080
```

**Authorized redirect URIs actuales:**
```
https://mercadoai-backend-production.up.railway.app/auth/google/callback
http://localhost:8080/auth/google/callback
```

**AGREGAR:** Callback URL de ChatGPT (después de configurar OAuth)
```
https://chatgpt.com/aip/g-XXXXXXXX/oauth/callback
```
*(Reemplaza XXXXXXXX con tu ID de GPT)*

**Link directo para editar:**
https://console.cloud.google.com/apis/credentials/oauthclient/943966324180-vgecl7gupn8gjm9i9l4388u8o5vpt8t8.apps.googleusercontent.com

---

## 📝 Información del GPT

### Name:
```
Mercado AI
```

### Description:
```
Asistente para gestionar listas de compras con sugerencias inteligentes y comparación de precios
```

### Instructions: (versión corta)
```
Ayuda a usuarios a crear y gestionar listas de compras.

Funciones:
- Crear listas y agregar productos
- Marcar productos como comprados
- Sugerir productos complementarios
- Comparar precios entre tiendas (modo demo)

Usa lenguaje amigable con emojis 🛒
```

### Conversation Starters:
```
Crear lista de compras
Agregar productos
Ver mi lista
Comparar precios
```

---

## ✅ Checklist de Setup

- [ ] 1. Crear GPT en: https://chatgpt.com/gpts/editor
- [ ] 2. Importar schema desde: `https://mercadoai-backend-production.up.railway.app/openapi`
- [ ] 3. Configurar OAuth con las URLs de arriba
- [ ] 4. Copiar Callback URL de ChatGPT
- [ ] 5. Agregar Callback URL en Google Cloud Console
- [ ] 6. Hacer "Test action" para autorizar
- [ ] 7. Probar creando una lista
- [ ] 8. Probar agregando productos
- [ ] 9. Probar marcando producto como comprado
- [ ] 10. ✨ ¡GPT listo para usar!

---

## 🧪 Comandos de Prueba

Una vez configurado, prueba con:

```
1. "Crea una lista llamada Compras de la Semana"
2. "Agrega 2 litros de leche, 1 kg de arroz y pan"
3. "¿Qué más me recomiendas?"
4. "Ya compré la leche"
5. "¿Cuánto cuesta el arroz en diferentes tiendas?"
```

---

## 🔗 Enlaces Útiles

**Crear GPT:**
https://chatgpt.com/gpts/editor

**Google Cloud Console:**
https://console.cloud.google.com/apis/credentials

**Railway Dashboard:**
https://railway.app/dashboard

**Backend GitHub:**
https://github.com/luiso2/mercadoAI

---

## 📊 Endpoints Disponibles

| Operación | Método | Endpoint |
|-----------|--------|----------|
| Health Check | GET | `/health` |
| Verify Google Token | POST | `/auth/google/verify` |
| Get All Lists | GET | `/lists` |
| Create List | POST | `/lists` |
| Get List | GET | `/lists/{id}` |
| Add Item | POST | `/lists/{id}/items` |
| Update Item | PATCH | `/lists/{id}/items/{itemId}` |
| Delete Item | DELETE | `/lists/{id}/items/{itemId}` |
| Get Suggestions | GET | `/lists/{id}/suggest` |
| Search Stores | GET | `/stores/search` |
| Compare Prices | GET | `/compare/search` |

---

## 🛠️ Troubleshooting Rápido

**Error al autorizar:**
→ Verifica Callback URL en Google Console

**"Cannot GET /oauth/authorize":**
→ Verifica la URL exacta (sin espacios extras)

**El GPT no responde:**
→ Revisa que OAuth esté configurado correctamente

**"Invalid grant":**
→ El código expiró (60s), intenta de nuevo

---

¡Todo listo para configurar tu GPT! 🚀
