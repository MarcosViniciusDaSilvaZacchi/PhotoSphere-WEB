# E15/finalizar-entrega.ps1 — roda DEPOIS de tirar todos os prints.
#
# Uso (PowerShell, na pasta raiz PhotoSphere-WEB):
#   powershell -ExecutionPolicy Bypass -File .\E15\finalizar-entrega.ps1
#
# O que faz:
#   1. Confere se todos os prints pedidos estão em photosphere-frontend\01 - Docs\atividade15\
#   2. Marca como feitos ([X]) os itens pendentes da Atividade 15 nos três checklists
#   3. Gera os dois .zip da entrega dentro de E15\ (sem node_modules; o backend também sem .env)

$ErrorActionPreference = 'Stop'
$root   = Split-Path -Parent $PSScriptRoot
$docs   = Join-Path $root 'photosphere-frontend\01 - Docs'
$prints = Join-Path $docs 'atividade15'
$tar    = Join-Path $env:SystemRoot 'System32\tar.exe'
$utf8   = New-Object System.Text.UTF8Encoding($false)

# ─── 1. Prints ────────────────────────────────────────────────────────────────
$esperados = @(
  'guarda-comum.jpg', 'guarda-localstorage.jpg', 'dashboard.jpg', 'denuncias-lista.jpg',
  'revisar-lenta.jpg', 'pulo-paginacao.jpg', 'usuarios-busca.jpg', 'bloquear-modal.jpg',
  'bloqueado-login.jpg', 'itens-excluir.jpg', 'banco-denuncias.jpg', 'controle-bloqueio.jpg',
  'controle-isadmin.jpg', 'curl-1-guarda.jpg', 'curl-2-dashboard.jpg', 'curl-3-denuncias.jpg',
  'curl-4-revisar.jpg', 'curl-5-usuarios.jpg', 'curl-6-bloquear.jpg', 'curl-7-rebaixado.jpg',
  'curl-8-fotos.jpg', 'curl-9-regressao.jpg'
)
$faltando = @()
foreach ($nome in $esperados) {
  # aceita também prints divididos em -a/-b (ex.: curl-2-toggle-a.jpg)
  $base = [IO.Path]::GetFileNameWithoutExtension($nome)
  $achou = Get-ChildItem -Path $prints -Filter "$base*.jpg" -ErrorAction SilentlyContinue
  if (-not $achou) { $faltando += $nome }
}
if ($faltando.Count -gt 0) {
  Write-Host "`nFaltam estes prints em $prints :" -ForegroundColor Yellow
  $faltando | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
  $resp = Read-Host "`nContinuar mesmo assim? (s/N)"
  if ($resp -ne 's') { Write-Host 'Nada foi alterado.'; exit 1 }
} else {
  Write-Host "OK: os $($esperados.Count) prints estão na pasta." -ForegroundColor Green
}

# ─── 2. Checklists ────────────────────────────────────────────────────────────
function Set-Checked([string]$path, [string]$fromHeading) {
  $text = [IO.File]::ReadAllText($path, $utf8)
  $start = if ($fromHeading) { $text.IndexOf($fromHeading) } else { 0 }
  if ($start -lt 0) { throw "Seção '$fromHeading' não encontrada em $path" }
  $before = $text.Substring(0, $start)
  $after  = $text.Substring($start).Replace('- [ ]', '- [X]')
  [IO.File]::WriteAllText($path, $before + $after, $utf8)
  Write-Host "Checklist marcado: $path" -ForegroundColor Green
}
Set-Checked (Join-Path $root 'E15\checklists.md') $null
Set-Checked (Join-Path $prints 'checklists.md') $null
Set-Checked (Join-Path $docs 'checklists.md') '## ATIVIDADE 15'

# ─── 3. Zips ──────────────────────────────────────────────────────────────────
$nome = 'MarcosViniciusDaSilvaZacchi-PhotoSphere'
$back = Join-Path $root "E15\$nome-backend.zip"
$front = Join-Path $root "E15\$nome-frontend.zip"
Remove-Item $back, $front -ErrorAction SilentlyContinue

& $tar -a -cf $back --exclude=node_modules --exclude=.env -C (Join-Path $root 'photosphere-api') .
& $tar -a -cf $front --exclude=node_modules --exclude=dist -C (Join-Path $root 'photosphere-frontend') .

foreach ($z in $back, $front) {
  $mb = [math]::Round((Get-Item $z).Length / 1MB, 1)
  Write-Host "Zip gerado: $z ($mb MB)" -ForegroundColor Green
}

Write-Host "`nPronto! Envie os dois .zip de E15\ e confira a pasta '01 - Docs\atividade15' (ela já vai dentro do zip do frontend)." -ForegroundColor Cyan
