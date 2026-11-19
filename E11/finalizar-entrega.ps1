# E11/finalizar-entrega.ps1 — roda DEPOIS de tirar todos os prints.
#
# Uso (PowerShell, na pasta raiz PhotoSphere-WEB):
#   powershell -ExecutionPolicy Bypass -File .\E11\finalizar-entrega.ps1
#
# O que faz:
#   1. Confere se todos os prints pedidos estão em photosphere-frontend\01 - Docs\atividade11\
#   2. Marca como feitos ([X]) os itens pendentes da Atividade 11 nos três checklists
#   3. Gera os dois .zip da entrega dentro de E11\ (sem node_modules; o backend também sem .env)

$ErrorActionPreference = 'Stop'
$root   = Split-Path -Parent $PSScriptRoot
$docs   = Join-Path $root 'photosphere-frontend\01 - Docs'
$prints = Join-Path $docs 'atividade11'
$tar    = Join-Path $env:SystemRoot 'System32\tar.exe'
$utf8   = New-Object System.Text.UTF8Encoding($false)

# ─── 1. Prints ────────────────────────────────────────────────────────────────
$esperados = @(
  'seguindo.jpg', 'otimista.jpg', 'rollback.jpg', 'seguidores.jpg', 'feed-seguindo.jpg', 'follows.jpg',
  'curl-1-erros.jpg', 'curl-2-toggle.jpg', 'curl-3-contadores.jpg', 'curl-4-status.jpg',
  'curl-5-listas.jpg', 'curl-6-feed.jpg', 'curl-7-regressao.jpg'
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
Set-Checked (Join-Path $root 'E11\checklists.md') $null
Set-Checked (Join-Path $prints 'checklists.md') $null
Set-Checked (Join-Path $docs 'checklists.md') '## ATIVIDADE 11'

# ─── 3. Zips ──────────────────────────────────────────────────────────────────
$nome = 'MarcosViniciusDaSilvaZacchi-PhotoSphere'
$back = Join-Path $root "E11\$nome-backend.zip"
$front = Join-Path $root "E11\$nome-frontend.zip"
Remove-Item $back, $front -ErrorAction SilentlyContinue

& $tar -a -cf $back --exclude=node_modules --exclude=.env -C (Join-Path $root 'photosphere-api') .
& $tar -a -cf $front --exclude=node_modules --exclude=dist -C (Join-Path $root 'photosphere-frontend') .

foreach ($z in $back, $front) {
  $mb = [math]::Round((Get-Item $z).Length / 1MB, 1)
  Write-Host "Zip gerado: $z ($mb MB)" -ForegroundColor Green
}

Write-Host "`nPronto! Envie os dois .zip de E11\ e confira a pasta '01 - Docs\atividade11' (ela já vai dentro do zip do frontend)." -ForegroundColor Cyan
