# ⚠️ PASO CRÍTICO: Configurar Google Console

## 🚨 IMPORTANTE - SIN ESTO NO FUNCIONARÁ

Para que la autenticación funcione, **DEBES** agregar las redirect URIs en Google Cloud Console.

---

## 📍 Paso 1: Ir a Google Console

Click aquí: 👉 https://console.cloud.google.com/apis/credentials/oauthclient/943966324180-vgecl7gupn8gjm9i9l4388u8o5vpt8t8.apps.googleusercontent.com

O navega manualmente:
1. Google Cloud Console
2. APIs & Services
3. Credentials
4. OAuth 2.0 Client IDs
5. Tu Client ID

---

## 📍 Paso 2: Click en "EDIT" ✏️

En la parte superior derecha de la página.

---

## 📍 Paso 3: Agregar Redirect URIs

Scroll down hasta la sección **"Authorized redirect URIs"**

Click en **"+ ADD URI"** y agrega **UNA POR UNA**:

```
https://mercadoai-backend-production.up.railway.app/oauth/google/callback
```

**⚠️ IMPORTANTE:**
- Copia exactamente (sin espacios)
- Usa HTTPS (no HTTP)
- No agregues "/" al final
- Asegúrate que termine en `/oauth/google/callback`

---

## 📍 Paso 4: Guardar

1. Scroll hasta el final
2. Click en **"SAVE"** 💾
3. Espera la confirmación verde

---

## 📍 Paso 5: Esperar 1-2 Minutos

Google necesita tiempo para propagar los cambios.

---

## ✅ Verificar que Está Guardado

La sección "Authorized redirect URIs" debe mostrar:

```
✓ https://mercadoai-backend-production.up.railway.app/oauth/google/callback
```

---

## 🧪 Ahora Sí - Intenta Autenticarte

Una vez que:
1. ✅ Agregaste la URI en Google Console
2. ✅ Guardaste los cambios
3. ✅ Esperaste 1-2 minutos
4. ✅ Railway terminó de desplegar (2-3 min más)

**Entonces puedes intentar autenticarte en ChatGPT.**

---

## 🔄 Flujo Esperado

1. ChatGPT → Te redirige a Google
2. Google → Muestra pantalla de selección de cuenta
3. Seleccionas tu cuenta
4. Google → Te redirige de vuelta a tu backend
5. Backend → Genera token y redirige a ChatGPT
6. ✅ Listo!

---

## ❌ Si NO Agregaste la URI

Google mostrará este error:

```
Error 400: redirect_uri_mismatch

The redirect URI in the request:
https://mercadoai-backend-production.up.railway.app/oauth/google/callback
does not match the ones authorized for the OAuth client.
```

**Solución:** Agrega la URI en Google Console (pasos arriba).

---

## 🎯 Estado Actual del Backend

- ✅ Código desplegado en Railway
- ✅ State management con Map (no sessions)
- ✅ Redirect a Google configurado
- ⏳ **Esperando que agregues URI en Google Console**

---

**Una vez que agregues la URI en Google Console, podrás autenticarte exitosamente.** 🎉
