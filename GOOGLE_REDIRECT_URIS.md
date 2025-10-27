# 🔗 URLs para Google Cloud Console

## 📍 Agregar estas Authorized Redirect URIs

Ve a: https://console.cloud.google.com/apis/credentials/oauthclient/943966324180-vgecl7gupn8gjm9i9l4388u8o5vpt8t8.apps.googleusercontent.com

Click en **Edit** ✏️ y agrega estas URIs en **"Authorized redirect URIs"**:

```
✅ https://mercadoai-backend-production.up.railway.app/oauth/google/callback
✅ https://mercadoai-backend-production.up.railway.app/auth/google/callback
✅ https://mercadoai-backend-production.up.railway.app/api/auth/google/callback
🆕 https://chatgpt.com/aip/g-XXXXXXXX/oauth/callback
```

**Nota:** Reemplaza `XXXXXXXX` con el ID de tu GPT (ChatGPT te lo dará después de configurar OAuth)

---

## 🔧 Rutas Soportadas Ahora

El backend ahora acepta callbacks en **TRES rutas diferentes**:

| Ruta | Uso |
|------|-----|
| `/oauth/google/callback` | Ruta original |
| `/auth/google/callback` | Alias para compatibilidad |
| `/api/auth/google/callback` | Para ChatGPT Actions |

---

## ✅ Verificar que funciona

Una vez que Railway termine de hacer redeploy, prueba:

```bash
# Debe responder "Invalid state parameter" (es esperado)
curl "https://mercadoai-backend-production.up.railway.app/api/auth/google/callback?state=test&code=test"

# Resultado esperado:
{"error":"Invalid state parameter"}
```

Si ves ese error, ¡está funcionando! El error es correcto porque no hay sesión activa.

---

## 🎯 Siguiente Paso

**Ahora puedes intentar autenticarte de nuevo en ChatGPT**

La URL que estabas usando debería funcionar:
```
https://mercadoai-backend-production.up.railway.app/api/auth/google/callback
```

---

## ⏱️ Tiempo Estimado

Railway tarda **~2-3 minutos** en hacer redeploy después del push.

Estoy monitoreando el despliegue en background. Te avisaré cuando esté listo. 🚀
