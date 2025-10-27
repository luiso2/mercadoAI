# 🏗️ Arquitectura OAuth Correcta para ChatGPT Actions

## ❌ Problema Actual:

El flujo tiene **demasiados saltos**:

```
ChatGPT → Tu Backend → Google → Tu Backend → ChatGPT
           |                        ↑
           └─ Guarda state ─────────┘
                (SE PIERDE - Cross-domain cookies)
```

**Por qué falla:**
- Las cookies HTTP no persisten entre dominios
- ChatGPT → Backend → Google → Backend ❌
- El `state` se pierde en los redirects

---

## ✅ Solución: OAuth Directo (Sin Google Redirect)

### Flujo Correcto para ChatGPT Actions:

```
1. ChatGPT → GET /oauth/authorize
   ↓
2. Backend → Muestra página HTML con Google Sign-In Button
   ↓
3. Usuario → Click en "Sign in with Google" (JavaScript)
   ↓
4. Google → Popup de autenticación (client-side)
   ↓
5. Usuario → Autoriza
   ↓
6. JavaScript → Envía ID token al backend
   ↓
7. Backend → Valida token, genera authorization_code
   ↓
8. Backend → Redirige a ChatGPT con code
   ↓
9. ChatGPT → POST /oauth/token con code
   ↓
10. Backend → Devuelve JWT access_token
```

**Ventajas:**
- ✅ No hay redirects server-to-server
- ✅ No hay problemas de cookies cross-domain
- ✅ Google OAuth es client-side (popup)
- ✅ Compatible con ChatGPT Actions

---

## 🔄 Dos Opciones de Implementación:

### **Opción A: Quick Fix (Agregar URI en Google Console)**

**Pros:**
- Rápido (5 minutos)
- Mantiene el código actual

**Contras:**
- Aún tiene problemas de cookies
- No es el enfoque recomendado por OpenAI

**Pasos:**
1. Ve a Google Console
2. Agrega: `https://mercadoai-backend-production.up.railway.app/oauth/google/callback`
3. Prueba de nuevo

---

### **Opción B: Solución Correcta (Recomendada)**

**Pros:**
- ✅ Arquitectura correcta
- ✅ Sin problemas de cookies
- ✅ Mejor UX
- ✅ Recomendado por OpenAI

**Contras:**
- Requiere cambios en el código (30 min)

**Implementación:**

1. **Cambiar `/oauth/authorize` para que devuelva HTML en lugar de redirect:**

```typescript
oauthRouter.get('/authorize', (req, res) => {
  const { state, redirect_uri, client_id } = req.query;

  // Guardar state para después
  oauthStates.set(state, { state, redirect_uri, ... });

  // Devolver página HTML con Google Sign-In
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://accounts.google.com/gsi/client" async defer></script>
    </head>
    <body>
      <h1>Autorizar Mercado AI</h1>
      <div id="g_id_onload"
           data-client_id="${GOOGLE_CLIENT_ID}"
           data-callback="handleCredentialResponse">
      </div>
      <div class="g_id_signin" data-type="standard"></div>

      <script>
        function handleCredentialResponse(response) {
          // Enviar ID token al backend
          fetch('/oauth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              idToken: response.credential,
              state: '${state}'
            })
          })
          .then(r => r.json())
          .then(data => {
            // Redirigir a ChatGPT con el código
            window.location.href = data.redirect_url;
          });
        }
      </script>
    </body>
    </html>
  `);
});
```

2. **Agregar endpoint para verificar el ID token:**

```typescript
oauthRouter.post('/verify', async (req, res) => {
  const { idToken, state } = req.body;

  // Verificar ID token de Google
  const googleUser = await verifyGoogleIdToken(idToken);

  // Crear/actualizar usuario en DB
  let user = await User.findOne({ googleSub: googleUser.googleSub });
  if (!user) {
    user = await User.create({ ...googleUser });
  }

  // Generar authorization code
  const code = crypto.randomBytes(32).toString('base64url');
  grants.set(code, { userId: user._id, expiresAt: ... });

  // Recuperar redirect_uri del state
  const oauthState = oauthStates.get(state);
  const redirectUrl = new URL(oauthState.redirect_uri);
  redirectUrl.searchParams.set('code', code);
  redirectUrl.searchParams.set('state', state);

  res.json({ redirect_url: redirectUrl.toString() });
});
```

---

## 🎯 Recomendación:

**Implementar Opción B** porque:

1. Es la arquitectura correcta para ChatGPT Actions
2. Elimina problemas de cookies cross-domain
3. Mejor experiencia de usuario (popup)
4. Más mantenible a largo plazo

**¿Quieres que implemente la Opción B ahora?**

Tomará ~30 minutos y el flujo OAuth funcionará perfectamente.
