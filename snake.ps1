# 贪吃蛇 PowerShell 版

# 设置窗口大小和缓冲区
$width = 40
$height = 20
try {
    $host.ui.RawUI.WindowSize = New-Object System.Management.Automation.Host.Size($width + 2, $height + 5)
    $host.ui.RawUI.BufferSize = New-Object System.Management.Automation.Host.Size($width + 2, $height + 5)
} catch {
    # 如果是在某些无法调整大小的终端中运行，忽略错误
}
$host.ui.RawUI.CursorSize = 0 # 尝试隐藏光标
Clear-Host

# 游戏变量
$snake = @(
    @{x=10; y=10},
    @{x=10; y=11},
    @{x=10; y=12}
)
$direction = "Up" # Up, Down, Left, Right
$lastDirection = "Up" # 防止快速按键导致掉头自杀
$score = 0
$gameOver = $false
$rand = New-Object Random

# 辅助函数：在指定位置绘制字符
function Draw-Point($x, $y, $char, $color) {
    try {
        $host.ui.RawUI.CursorPosition = New-Object System.Management.Automation.Host.Coordinates($x, $y)
        Write-Host -NoNewline $char -ForegroundColor $color
    } catch {}
}

# 初始化：绘制墙壁
for($x=0; $x -le $width; $x++) {
    Draw-Point $x 0 "#" "Gray"
    Draw-Point $x $height "#" "Gray"
}
for($y=0; $y -le $height; $y++) {
    Draw-Point 0 $y "#" "Gray"
    Draw-Point $width $y "#" "Gray"
}

# 初始化：生成食物
function New-Food {
    while($true) {
        $fx = $rand.Next(1, $width)
        $fy = $rand.Next(1, $height)
        $collision = $false
        foreach($part in $snake) {
            if($part.x -eq $fx -and $part.y -eq $fy) { $collision = $true; break }
        }
        if(-not $collision) { return @{x=$fx; y=$fy} }
    }
}
$food = New-Food
Draw-Point $food.x $food.y "*" "Yellow"

# 绘制初始蛇
foreach($part in $snake) {
    Draw-Point $part.x $part.y "o" "Green"
}

# 游戏主循环
while(-not $gameOver) {
    # 读取输入（非阻塞）
    while ($host.ui.RawUI.KeyAvailable) {
        $key = $host.ui.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        # 只处理按下的键，忽略释放
        # 37=Left, 38=Up, 39=Right, 40=Down, 27=Esc
        switch ($key.VirtualKeyCode) {
            37 { if($lastDirection -ne "Right") { $direction = "Left" } }
            38 { if($lastDirection -ne "Down")  { $direction = "Up" } }
            39 { if($lastDirection -ne "Left")  { $direction = "Right" } }
            40 { if($lastDirection -ne "Up")    { $direction = "Down" } }
            27 { $gameOver = $true }
        }
    }

    # 计算新头位置
    $head = $snake[0]
    $newHead = @{x=$head.x; y=$head.y}
    
    switch($direction) {
        "Up"    { $newHead.y-- }
        "Down"  { $newHead.y++ }
        "Left"  { $newHead.x-- }
        "Right" { $newHead.x++ }
    }
    $lastDirection = $direction

    # 碰撞检测：墙壁
    if ($newHead.x -le 0 -or $newHead.x -ge $width -or $newHead.y -le 0 -or $newHead.y -ge $height) {
        $gameOver = $true
        break
    }
    
    # 碰撞检测：自身
    foreach($part in $snake) {
        if($part.x -eq $newHead.x -and $part.y -eq $newHead.y) {
            $gameOver = $true
            break
        }
    }
    if($gameOver) { break }

    # 移动蛇：添加新头
    $snake = @($newHead) + $snake
    Draw-Point $newHead.x $newHead.y "O" "Green"
    Draw-Point $head.x $head.y "o" "Green" # 旧头变身

    # 检测吃食物
    if ($newHead.x -eq $food.x -and $newHead.y -eq $food.y) {
        $score += 10
        $food = New-Food
        Draw-Point $food.x $food.y "*" "Yellow"
    } else {
        # 没吃到：移除尾巴
        $tail = $snake[-1]
        $snake = $snake[0..($snake.Count - 2)]
        Draw-Point $tail.x $tail.y " " "Black"
    }

    # 显示分数
    Draw-Point 0 ($height + 1) "Score: $score  (Press ESC to quit)" "White"

    Start-Sleep -Milliseconds 100
}

# 游戏结束
Draw-Point 0 ($height + 2) "GAME OVER! Final Score: $score" "Red"
Draw-Point 0 ($height + 3) "Press any key to exit..." "Gray"
$host.ui.RawUI.FlushInputBuffer()
$host.ui.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
Clear-Host
