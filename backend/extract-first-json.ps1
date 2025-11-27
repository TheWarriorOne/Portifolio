# extract-first-json.ps1
# Lê new-taskdef.json linha-a-linha, extrai o primeiro objeto JSON balanceado (por chaves {})
# e salva em new-taskdef.json.clean. Em seguida valida o JSON e, se ok, substitui o original.
# Uso: powershell -NoProfile -ExecutionPolicy Bypass -File .\extract-first-json.ps1

$ErrorActionPreference = 'Stop'

$inputFile  = "new-taskdef.json"
$tempFile   = "new-taskdef.json.clean"
$backupFile = "new-taskdef.json.bak"

if (-not (Test-Path $inputFile)) {
    Write-Error "Arquivo $inputFile não encontrado na pasta atual: $(Get-Location)"
    exit 1
}

# backup
Copy-Item $inputFile $backupFile -Force
Write-Host "Backup criado em: $backupFile"

try {
    $reader = [System.IO.File]::OpenText($inputFile)
    $writer = New-Object System.IO.StreamWriter($tempFile, $false, [System.Text.Encoding]::UTF8)

    $depth = 0
    $started = $false
    $lineNumber = 0
    while (-not $reader.EndOfStream) {
        $line = $reader.ReadLine()
        $lineNumber++
        # percorre caractere a caractere para contar '{' e '}'
        for ($i = 0; $i -lt $line.Length; $i++) {
            $ch = $line[$i]
            if ($ch -eq '{') { $depth++ ; $started = $true }
            elseif ($ch -eq '}') { $depth-- }
        }
        if ($started) {
            $writer.WriteLine($line)
        }
        if ($started -and $depth -eq 0) {
            # achou fechamento do primeiro objeto completo
            break
        }
    }

    $writer.Close()
    $reader.Close()

    if (-not (Test-Path $tempFile)) {
        Write-Error "Não foi possível criar $tempFile"
        exit 1
    }

    # validar o JSON extraído
    try {
        (Get-Content $tempFile -Raw) | ConvertFrom-Json | Out-Null
        Write-Host "OK: JSON extraído e válido. Substituindo o arquivo original..."
        Move-Item -Path $tempFile -Destination $inputFile -Force
        Write-Host "Substituição concluída. Arquivo original salvo como $backupFile"
    } catch {
        Write-Error "O JSON extraído NÃO é válido: $($_.Exception.Message)"
        Write-Host "O arquivo extraído foi salvo em: $tempFile para inspeção manual."
        exit 1
    }

} catch {
    Write-Error "Erro durante a operação: $($_.Exception.Message)"
    if ($writer) { $writer.Close() }
    if ($reader) { $reader.Close() }
    exit 1
}
