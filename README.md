# Tramas Ocultas

## Acesso privado

O site usa login individual com usuários armazenados no Neon. A proteção usa sessões assinadas por cookie no servidor e não depende do Supabase.

Configure estas variáveis no `.env` local e nas variáveis do provedor de deploy:

```env
SITE_ADMIN_EMAIL=seu-email@exemplo.com
SITE_ADMIN_PASSWORD=uma-senha-forte
```

No primeiro login em `/acesso`, o administrador será criado automaticamente. Depois, em `/admin`, ele poderá criar usuários individuais, liberar acessos e revogar contas. Visitantes sem sessão serão redirecionados para a tela de login. A sessão dura 30 dias; os capítulos também validam o usuário no servidor antes de consultar o Neon.

Para gerar um segredo forte no PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

