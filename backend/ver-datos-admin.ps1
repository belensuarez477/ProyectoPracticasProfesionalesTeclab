# Verificación rápida de datos - Sin necesidad de contraseña
# Este script consulta directamente Firestore

$token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTc2OTkwMTM3MiwiZXhwIjoxNzY5OTA0OTcyLCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0BiZWF1dHlzeXN0ZW1iYXNlLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwic3ViIjoiZmlyZWJhc2UtYWRtaW5zZGstZmJzdmNAYmVhdXR5c3lzdGVtYmFzZS5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInVpZCI6Imt2VkhBWWNkeThTV2FMY08zOTRMTEc2SlBFTTIifQ.Fx_II9ne2DRQVSnFMuhIs-WjnKos3PMYiPHavZ3q4TaAwhvTdqYWdwEVyI4iMTnDdg_VdkDj2gj_6erLIxEV1QOc2pEY_qVbXXEo_MPzf2wJaphFP-IaYxfI6JwKcak7pGnavWtoFzPTmH0bbIzOL0Am4_O3jHe52rRKWxncLvTgJihwvZKULo_8BlIzmH1hl8EFt-6Zb1vJJlbkfR7egO1sTsmj9H1G9HSEEopo5cI_iNVrAPGkxN9G55bRSgJKZER0-btJFz68kKh80TTKe5sFrElpXIpOmXY6QBvFgGbf3zYcNcBa-Yn9dM0glXPkX2k0EE8GBX-sPY3l4Sf4tQ"
$headers = @{
    "Authorization" = "Bearer $token"
}

Write-Host "🔍 Verificando datos de admin@admin.com..." -ForegroundColor Cyan
Write-Host ""

# Ver perfil
Write-Host "📋 PERFIL DEL USUARIO:" -ForegroundColor Yellow
$perfil = Invoke-RestMethod -Uri "http://localhost:5000/auth/perfil" -Headers $headers
$perfil.usuario | ConvertTo-Json

# Ver servicios
Write-Host "`n💇 SERVICIOS:" -ForegroundColor Yellow
try {
    $servicios = Invoke-RestMethod -Uri "http://localhost:5000/servicios" -Headers $headers
    if ($servicios.servicios.Count -gt 0) {
        $servicios.servicios | ConvertTo-Json
    } else {
        Write-Host "   No hay servicios creados" -ForegroundColor Gray
    }
} catch {
    Write-Host "   Usuario tipo cliente (no puede crear servicios)" -ForegroundColor Gray
}

# Ver turnos
Write-Host "`n📅 TURNOS:" -ForegroundColor Yellow
try {
    $turnos = Invoke-RestMethod -Uri "http://localhost:5000/turnos/profesional/mis-turnos" -Headers $headers
    if ($turnos.turnos.Count -gt 0) {
        $turnos.turnos | ConvertTo-Json
    } else {
        Write-Host "   No hay turnos" -ForegroundColor Gray
    }
} catch {
    try {
        $turnos = Invoke-RestMethod -Uri "http://localhost:5000/turnos/cliente/mis-turnos" -Headers $headers
        if ($turnos.turnos.Count -gt 0) {
            $turnos.turnos | ConvertTo-Json
        } else {
            Write-Host "   No hay turnos" -ForegroundColor Gray
        }
    } catch {
        Write-Host "   No hay turnos" -ForegroundColor Gray
    }
}

Write-Host "`n✅ Verificación completa" -ForegroundColor Green
