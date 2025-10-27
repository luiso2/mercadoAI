# 🔐 Solución al Error de Redirect URI

## ❌ Error Actual:

```
redirect_uri=https://mercadoai-backend-production.up.railway.app/oauth/google/callback
flowName=GeneralOAuthFlow
```

Este error significa que Google **no reconoce** esa URL como autorizada.

---

## ✅ Solución en 5 Pasos:

### **PASO 1: Abrir Google Cloud Console**

Click en este link directo:
👉 https://console.cloud.google.com/apis/credentials/oauthclient/943966324180-vgecl7gupn8gjm9i9l4388u8o5vpt8t8.apps.googleusercontent.com

*(O navega manualmente: Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs → Tu Client ID)*

---

### **PASO 2: Click en "EDIT" ✏️**

En la parte superior derecha, verás un botón de lápiz **"Edit"**. Haz click.

---

### **PASO 3: Buscar "Authorized redirect URIs"**

Scroll down hasta encontrar la sección que dice:
```
Authorized redirect URIs
```

Ahí verás una lista de URLs (probablemente vacía o con pocas).

---

### **PASO 4: Agregar las 3 URIs**

Click en **"+ ADD URI"** y agrega **UNA POR UNA** estas URLs:

```
URI 1:
https://mercadoai-backend-production.up.railway.app/oauth/google/callback

URI 2:
https://mercadoai-backend-production.up.railway.app/auth/google/callback

URI 3:
https://mercadoai-backend-production.up.railway.app/api/auth/google/callback
```

**⚠️ IMPORTANTE:**
- Copia y pega exactamente como están (sin espacios extras)
- No agregues "/" al final
- Usa HTTPS (no HTTP)

---

### **PASO 5: Guardar Cambios**

1. Scroll hasta el final de la página
2. Click en **"SAVE"** 💾
3. Espera la confirmación verde "Client ID updated"
4. **Espera 1-2 minutos** para que Google propague los cambios

---

## 🧪 Verificar que Funcionó:

Después de 1-2 minutos, intenta autenticarte de nuevo en ChatGPT.

**Resultado esperado:**
- Google mostrará la pantalla de login ✅
- Después de autenticar, te redirigirá de vuelta a ChatGPT ✅
- ChatGPT obtendrá tu access token ✅

---

## 📸 Referencia Visual:

La sección "Authorized redirect URIs" debe verse así:

```
Authorized redirect URIs
  ✓ https://mercadoai-backend-production.up.railway.app/oauth/google/callback
  ✓ https://mercadoai-backend-production.up.railway.app/auth/google/callback
  ✓ https://mercadoai-backend-production.up.railway.app/api/auth/google/callback

  [+ ADD URI]
```

---

## 🔍 Si el Error Persiste:

1. **Verifica que guardaste los cambios** en Google Console
2. **Espera 2-3 minutos** (Google puede tardar en propagar)
3. **Cierra y abre ChatGPT** para forzar una nueva sesión
4. **Intenta de nuevo** el proceso de autorización

---

## 📝 Notas Técnicas:

- El backend ya está configurado para aceptar estos 3 paths
- Las URLs están case-sensitive (respeta mayúsculas/minúsculas)
- Google valida que la URL coincida EXACTAMENTE
- No agregues parámetros de query (?state=...) a las URIs

---

## ✅ Checklist:

- [ ] Abrí el link de Google Console
- [ ] Hice click en "Edit"
- [ ] Agregué la URI 1: `/oauth/google/callback`
- [ ] Agregué la URI 2: `/auth/google/callback`
- [ ] Agregué la URI 3: `/api/auth/google/callback`
- [ ] Hice click en "Save"
- [ ] Esperé 1-2 minutos
- [ ] Intenté autenticarme de nuevo en ChatGPT

---

**Una vez completados estos pasos, el error desaparecerá y podrás autenticarte exitosamente.** 🎉
