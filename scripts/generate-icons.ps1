Add-Type -AssemblyName System.Drawing

$buildDir = Join-Path $PSScriptRoot "..\build"
if (!(Test-Path $buildDir)) {
    New-Item -ItemType Directory -Path $buildDir -Force | Out-Null
}

$size = 256
$bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

function Get-RoundedRectPath($r, $radius) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $radius * 2
    $path.AddArc($r.X, $r.Y, $d, $d, 180, 90)
    $path.AddArc($r.Right - $d, $r.Y, $d, $d, 270, 90)
    $path.AddArc($r.Right - $d, $r.Bottom - $d, $d, $d, 0, 90)
    $path.AddArc($r.X, $r.Bottom - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

$rect = New-Object System.Drawing.Rectangle 8, 8, 240, 240
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(255, 37, 99, 235)), ([System.Drawing.Color]::FromArgb(255, 79, 70, 229)), 45.0
$bgPath = Get-RoundedRectPath $rect 48
$g.FillPath($brush, $bgPath)

$calRect = New-Object System.Drawing.Rectangle 44, 55, 168, 150
$calBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
$calPath = Get-RoundedRectPath $calRect 24
$g.FillPath($calBrush, $calPath)

$hdrBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 30, 64, 175))
$hdrPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$hdrPath.AddArc(44, 55, 48, 48, 180, 90)
$hdrPath.AddArc(212 - 48, 55, 48, 48, 270, 90)
$hdrPath.AddLine(212, 95, 44, 95)
$hdrPath.CloseFigure()
$g.FillPath($hdrBrush, $hdrPath)

$ringBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 226, 232, 240))
$g.FillEllipse($ringBrush, 75, 40, 16, 24)
$g.FillEllipse($ringBrush, 165, 40, 16, 24)

$penCheck = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 16, 185, 129)), 18
$penCheck.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$penCheck.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$penCheck.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$g.DrawLine($penCheck, 90, 145, 118, 172)
$g.DrawLine($penCheck, 118, 172, 168, 118)

$pngPath = Join-Path $buildDir "icon.png"
$bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Write valid 256x256 PNG-compressed ICO container
$pngBytes = [System.IO.File]::ReadAllBytes($pngPath)
$icoPath = Join-Path $buildDir "icon.ico"
$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($ms)
$bw.Write([UInt16]0)
$bw.Write([UInt16]1)
$bw.Write([UInt16]1)
$bw.Write([Byte]0)
$bw.Write([Byte]0)
$bw.Write([Byte]0)
$bw.Write([Byte]0)
$bw.Write([UInt16]1)
$bw.Write([UInt16]32)
$bw.Write([UInt32]$pngBytes.Length)
$bw.Write([UInt32]22)
$bw.Write($pngBytes)
$bw.Flush()
[System.IO.File]::WriteAllBytes($icoPath, $ms.ToArray())
$bw.Close()
$ms.Close()

$g.Dispose()
$bmp.Dispose()
Write-Host "Icons generated at $buildDir"
