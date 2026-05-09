# Archive

Histórico não-canônico. Material que foi removido do fluxo ativo mas pode ter contexto útil em situações específicas.

## Por que arquivar (e não apagar)

- Decisões abandonadas ainda explicam por que o código atual existe.
- Hipóteses de produto descartadas podem voltar à mesa.
- Auditoria histórica (legal, compliance) pode precisar reler.

Arquivar ≠ recuperar automaticamente. Material aqui **só volta para o fluxo ativo** se um dos critérios abaixo for satisfeito.

## Critérios de recuperação

Item volta de `Docs/archive/` para `Docs/` ativo se:

1. **Spec não implementada que entrou no roadmap atual.** Ex: feature foi adiada, agora foi priorizada — recuperar o spec original em vez de reescrever.
2. **Decisão arquitetural não documentada em outro lugar.** Ex: por que escolhemos X em vez de Y — se a justificativa só vive aqui, recupere para `Docs/arquitetura/` ou ADR em `Docs/PRPs/_adr/`.
3. **Compliance/legal exige histórico.** Ex: auditoria pede contexto de uma versão antiga dos termos.

Caso contrário: fica arquivado. Não promova "porque é bonito".

## Como recuperar (passo a passo)

1. Identifique a pasta-fonte em `Docs/archive/<YYYY-MM>_<topic>/`.
2. Leia `_REASON.md` da pasta — confirma o motivo do arquivamento.
3. Copie (não mova) o arquivo para o destino ativo apropriado.
4. Adicione no destino: `> Recuperado de Docs/archive/<source>. Razão: <critério>.`
5. Atualize o `_REASON.md` da pasta arquivada com a data e motivo da recuperação.

## Convenção `_REASON.md`

Toda pasta arquivada **deve** ter `_REASON.md` na raiz com:

- **O que era** (1 frase)
- **Por que arquivou** (decisão, data, motivo)
- **Decisão que substituiu** (link pro doc canônico vivo)
- **Critério de recuperação** (qual dos 3 critérios acima dispararia)

Sem `_REASON.md`, a pasta vira lixo silencioso.

## Inventário

(Vazio inicialmente. Cada pasta arquivada aparece aqui com seu `_REASON.md`.)

| Pasta | Origem | O que tem | Quando recuperar | Última revisão |
|---|---|---|---|---|
| (vazio) | — | — | — | — |
