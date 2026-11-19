# E13/finalizar-entrega.ps1 — roda DEPOIS de tirar todos os prints.
#
# Uso (PowerShell, na pasta raiz PhotoSphere-WEB):
#   powershell -ExecutionPolicy Bypass -File .\E13\finalizar-entrega.ps1
#
# O que faz:
#   1. Confere se todos os prints pedidos estão em photosphere-frontend\01 - Docs\atividade13\
#   2. Marca como feitos ([X]) os itens pendentes da Atividade 13 nos três checklists
#   3. Gera os dois .zip da entrega dentro de E13\ (sem node_modules; o backend também sem .env)

$ErrorActionPreference = 'Stop'
$root   = Split-Path -Parent $PSScriptRoot
$docs   = Join-Path $root 'photosphere-frontend\01 - Docs'
$prints = Join-Path $docs 'atividade13'
$tar    = Join-Path $env:SystemRoot 'System32\tar.exe'
$utf8   = New-Object System.Text.UTF8Encoding($false)

# ─── 1. Prints ────────────────────────────────────────────────────────────────
$esperados = @(
  'colecao-privada.jpg', 'salvar-modal.jpg', 'otimista-modal.jpg', 'rollback-modal.jpg',
  'detalhe-colecao.jpg', 'colecao-privada-visitante.jpg', 'debounce.jpg', 'busca.jpg',
  'navbar-busca.jpg', 'contador-controle.jpg', 'contador-certo.jpg', 'colecoes-banco.jpg',
  'curl-01-criar.jpg', 'curl-02-listar.jpg', 'curl-03-adicionar.jpg', 'curl-04-remover.jpg',
  'curl-05-ler.jpg', 'curl-06-status.jpg', 'curl-07-excluir-album.jpg', 'curl-08-excluir-foto.jpg',
  'curl-09-busca.jpg', 'curl-11-regressao.jpg'
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
Set-Checked (Join-Path $root 'E13\checklists.md') $null
Set-Checked (Join-Path $prints 'checklists.md') $null
Set-Checked (Join-Path $docs 'checklists.md') '## ATIVIDADE 13'

# ─── 3. Zips ──────────────────────────────────────────────────────────────────
$nome = 'MarcosViniciusDaSilvaZacchi-PhotoSphere'
$back = Join-Path $root "E13\$nome-backend.zip"
$front = Join-Path $root "E13\$nome-frontend.zip"
Remove-Item $back, $front -ErrorAction SilentlyContinue

& $tar -a -cf $back --exclude=node_modules --exclude=.env -C (Join-Path $root 'photosphere-api') .
& $tar -a -cf $front --exclude=node_modules --exclude=dist -C (Join-Path $root 'photosphere-frontend') .

foreach ($z in $back, $front) {
  $mb = [math]::Round((Get-Item $z).Length / 1MB, 1)
  Write-Host "Zip gerado: $z ($mb MB)" -ForegroundColor Green
}

Write-Host "`nPronto! Envie os dois .zip de E13\ e confira a pasta '01 - Docs\atividade13' (ela já vai dentro do zip do frontend)." -ForegroundColor Cyan
