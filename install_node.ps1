# Download and Install Node.js Script

$url = "https://nodejs.org/dist/v24.11.1/node-v24.11.1-x64.msi"
$output = "$PWD\node_installer.msi"

Write-Host "Downloading Node.js v24.11.1 LTS..."
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $url -OutFile $output
    Write-Host "Download complete."
} catch {
    Write-Error "Download failed. Please check your internet connection."
    Write-Error $_
    exit 1
}

Write-Host "Installing Node.js..."
Write-Host "A User Account Control (UAC) prompt will appear. Please click 'Yes' to continue."

# /i: install
# /qn: quiet, no UI
# /norestart: do not restart automatically
$args = "/i `"$output`" /qn /norestart"

try {
    $process = Start-Process msiexec.exe -ArgumentList $args -Verb RunAs -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host "Node.js installed successfully!"
        Write-Host "Please restart your terminal or editor to use 'node' and 'npm' commands."
    } else {
        Write-Error "Installation failed with exit code: $($process.ExitCode)"
    }
} catch {
    Write-Error "Failed to start installer."
    Write-Error $_
}

# Clean up
if (Test-Path $output) {
    Remove-Item $output -ErrorAction SilentlyContinue
}
