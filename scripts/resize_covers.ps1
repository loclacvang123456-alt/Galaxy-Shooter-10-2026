Add-Type -AssemblyName System.Drawing

function Resize-And-Crop {
    param(
        [string]$sourcePath,
        [string]$destPath,
        [int]$targetW,
        [int]$targetH
    )
    $srcImg = [System.Drawing.Image]::FromFile($sourcePath)
    $srcW = $srcImg.Width
    $srcH = $srcImg.Height
    
    $targetAspect = $targetW / $targetH
    $srcAspect = $srcW / $srcH

    if ($srcAspect -gt $targetAspect) {
        $cropH = $srcH
        $cropW = [int]($srcH * $targetAspect)
        $cropX = [int](($srcW - $cropW) / 2)
        $cropY = 0
    } else {
        $cropW = $srcW
        $cropH = [int]($srcW / $targetAspect)
        $cropX = 0
        $cropY = [int](($srcH - $cropH) / 2)
    }

    $destBmp = New-Object System.Drawing.Bitmap($targetW, $targetH)
    $g = [System.Drawing.Graphics]::FromImage($destBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $targetW, $targetH)
    $g.DrawImage($srcImg, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]95)

    $destBmp.Save($destPath, $codec, $encoderParams)

    $g.Dispose()
    $destBmp.Dispose()
    $srcImg.Dispose()
    Write-Output "Successfully generated: $destPath"
}

Resize-And-Crop 'c:\work\Game Shotting Block\covers\cover_1x1_800x800.jpg' 'c:\work\Game Shotting Block\covers\game_512x512.jpg' 512 512
Resize-And-Crop 'c:\work\Game Shotting Block\covers\cover_16x9_1920x1080.jpg' 'c:\work\Game Shotting Block\covers\game_512x384.jpg' 512 384
Resize-And-Crop 'c:\work\Game Shotting Block\covers\cover_16x9_1920x1080.jpg' 'c:\work\Game Shotting Block\covers\game_512x340.jpg' 512 340
Resize-And-Crop 'c:\work\Game Shotting Block\covers\cover_16x9_1920x1080.jpg' 'c:\work\Game Shotting Block\covers\game_200x120.jpg' 200 120
Resize-And-Crop 'c:\work\Game Shotting Block\covers\cover_16x9_1920x1080.jpg' 'c:\work\Game Shotting Block\covers\game_1280x720.jpg' 1280 720
Resize-And-Crop 'c:\work\Game Shotting Block\covers\cover_16x9_1920x1080.jpg' 'c:\work\Game Shotting Block\covers\game_1280x550.jpg' 1280 550

