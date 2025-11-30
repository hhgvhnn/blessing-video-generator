# Download and Install Python Script

$url = "https://www.python.org/ftp/python/3.13.0/python-3.13.0-amd64.exe"
$path = "$PWD\python_installer.exe"

Write-Host "Downloading Python 3.13.0..."
try {
    # Ensure TLS 1.2 is used for secure download
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $url -OutFile $path
    Write-Host "Download complete."
} catch {
    Write-Error "Download failed. Please check your internet connection."
    Write-Error $_
    exit 1
}

Write-Host "Installing Python..."
Write-Host "Please accept the User Account Control (UAC) prompt if it appears."

# /quiet: Silent installation
# InstallAllUsers=1: Install for all users
# PrependPath=1: Add Python to PATH environment variable
# Include_test=0: Do not install test suite
$args = "/quiet InstallAllUsers=1 PrependPath=1 Include_test=0"

try {
    $process = Start-Process -FilePath $path -ArgumentList $args -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host "Python installed successfully!"
    } else {
        Write-Error "Installation failed with exit code: $($process.ExitCode)"
    }
} catch {
    Write-Error "Failed to run installer."
    Write-Error $_
}

# Clean up
if (Test-Path $path) {
    Remove-Item $path -ErrorAction SilentlyContinue
}
