# Script de verificación de datos en Firebase
# Verifica usuarios y servicios registrados

$API_URL = "http://localhost:5000"

Write-Host "`n🔍 Verificación de Base de Datos" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Función para hacer login y obtener token
function Get-AuthToken {
    param($email, $password)
    
    Write-Host "🔐 Iniciando sesión con: $email" -ForegroundColor Yellow
    $body = @{
        email = $email
        password = $password
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -Body $body -ContentType "application/json"
        if ($response.exito) {
            Write-Host "✅ Login exitoso" -ForegroundColor Green
            return $response.token
        } else {
            Write-Host "❌ Error en login: $($response.mensaje)" -ForegroundColor Red
            return $null
        }
    } catch {
        Write-Host "❌ Error de conexión: $_" -ForegroundColor Red
        return $null
    }
}

# Solicitar credenciales
Write-Host "Por favor ingresa tus credenciales:" -ForegroundColor Cyan
$email = Read-Host "Email"
$password = Read-Host "Contraseña" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Obtener token
$token = Get-AuthToken -email $email -password $passwordPlain

if (-not $token) {
    Write-Host "`n❌ No se pudo obtener el token. Verifica tus credenciales." -ForegroundColor Red
    exit 1
}

Write-Host "`n📊 Token obtenido: $($token.Substring(0, 30))...`n" -ForegroundColor Gray

# Headers con autorización
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Verificar perfil del usuario
Write-Host "`n👤 Verificando Perfil del Usuario..." -ForegroundColor Yellow
Write-Host "====================================`n" -ForegroundColor Yellow

try {
    $perfil = Invoke-RestMethod -Uri "$API_URL/auth/perfil" -Method Get -Headers $headers
    
    if ($perfil.exito) {
        Write-Host "✅ Datos del Usuario:" -ForegroundColor Green
        Write-Host "   ID: $($perfil.usuario.id)" -ForegroundColor White
        Write-Host "   Nombre: $($perfil.usuario.nombre) $($perfil.usuario.apellido)" -ForegroundColor White
        Write-Host "   Email: $($perfil.usuario.email)" -ForegroundColor White
        Write-Host "   Teléfono: $($perfil.usuario.telefono)" -ForegroundColor White
        Write-Host "   Tipo: $($perfil.usuario.tipoUsuario)" -ForegroundColor White
    } else {
        Write-Host "❌ No se pudo obtener el perfil" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error al obtener perfil: $_" -ForegroundColor Red
}

# Verificar servicios (solo para profesionales)
Write-Host "`n💇 Verificando Servicios..." -ForegroundColor Yellow
Write-Host "====================================`n" -ForegroundColor Yellow

try {
    $servicios = Invoke-RestMethod -Uri "$API_URL/servicios" -Method Get -Headers $headers
    
    if ($servicios.exito) {
        if ($servicios.servicios.Count -eq 0) {
            Write-Host "ℹ️  No hay servicios registrados aún" -ForegroundColor Cyan
        } else {
            Write-Host "✅ Servicios encontrados: $($servicios.servicios.Count)" -ForegroundColor Green
            foreach ($servicio in $servicios.servicios) {
                Write-Host "`n   📋 Servicio:" -ForegroundColor White
                Write-Host "      ID: $($servicio.id)" -ForegroundColor Gray
                Write-Host "      Nombre: $($servicio.nombre)" -ForegroundColor White
                Write-Host "      Descripción: $($servicio.descripcion)" -ForegroundColor White
                Write-Host "      Precio: $$$($servicio.precio)" -ForegroundColor White
                Write-Host "      Duración: $($servicio.duracion) min" -ForegroundColor White
                Write-Host "      Activo: $($servicio.activo)" -ForegroundColor White
            }
        }
    } else {
        Write-Host "ℹ️  $($servicios.mensaje)" -ForegroundColor Cyan
    }
} catch {
    $errorMsg = $_.Exception.Message
    if ($errorMsg -like "*403*") {
        Write-Host "ℹ️  Esta cuenta es de tipo Cliente (no puede ver servicios)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error al obtener servicios: $errorMsg" -ForegroundColor Red
    }
}

# Verificar turnos
Write-Host "`n📅 Verificando Turnos..." -ForegroundColor Yellow
Write-Host "====================================`n" -ForegroundColor Yellow

try {
    # Intentar obtener turnos como profesional
    $turnosProf = Invoke-RestMethod -Uri "$API_URL/turnos/profesional/mis-turnos" -Method Get -Headers $headers
    
    if ($turnosProf.exito) {
        Write-Host "✅ Turnos como Profesional: $($turnosProf.turnos.Count)" -ForegroundColor Green
        foreach ($turno in $turnosProf.turnos) {
            Write-Host "`n   📅 Turno:" -ForegroundColor White
            Write-Host "      ID: $($turno.id)" -ForegroundColor Gray
            Write-Host "      Fecha: $($turno.fecha) a las $($turno.hora)" -ForegroundColor White
            Write-Host "      Estado: $($turno.estado)" -ForegroundColor White
        }
    }
} catch {
    # Si falla, intentar como cliente
    try {
        $turnosCliente = Invoke-RestMethod -Uri "$API_URL/turnos/cliente/mis-turnos" -Method Get -Headers $headers
        
        if ($turnosCliente.exito) {
            if ($turnosCliente.turnos.Count -eq 0) {
                Write-Host "ℹ️  No hay turnos agendados" -ForegroundColor Cyan
            } else {
                Write-Host "✅ Turnos como Cliente: $($turnosCliente.turnos.Count)" -ForegroundColor Green
                foreach ($turno in $turnosCliente.turnos) {
                    Write-Host "`n   📅 Turno:" -ForegroundColor White
                    Write-Host "      ID: $($turno.id)" -ForegroundColor Gray
                    Write-Host "      Fecha: $($turno.fecha) a las $($turno.hora)" -ForegroundColor White
                    Write-Host "      Estado: $($turno.estado)" -ForegroundColor White
                }
            }
        }
    } catch {
        Write-Host "ℹ️  No hay turnos registrados" -ForegroundColor Cyan
    }
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "✨ Verificación completada" -ForegroundColor Green
Write-Host "`n💡 Tip: También puedes verificar en Firebase Console:" -ForegroundColor Yellow
Write-Host "   https://console.firebase.google.com" -ForegroundColor Cyan
Write-Host ""
