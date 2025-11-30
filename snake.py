import random
import os
import time
import msvcrt
import sys

# 游戏设置
WIDTH = 40
HEIGHT = 20
SPEED = 0.1  # 刷新间隔（秒）

# 字符定义
CHAR_SNAKE_HEAD = 'O'
CHAR_SNAKE_BODY = 'o'
CHAR_FOOD = '*'
CHAR_EMPTY = ' '
CHAR_WALL = '#'

class SnakeGame:
    def __init__(self):
        self.width = WIDTH
        self.height = HEIGHT
        self.snake = [(self.width // 2, self.height // 2)]
        self.direction = (0, -1)  # 初始向上: (x, y) -> (0, -1)
        self.food = self.spawn_food()
        self.score = 0
        self.game_over = False

    def spawn_food(self):
        while True:
            x = random.randint(1, self.width - 2)
            y = random.randint(1, self.height - 2)
            if (x, y) not in self.snake:
                return (x, y)

    def get_input(self):
        # 处理所有积压的按键，只取最后一个有效按键，防止输入延迟
        while msvcrt.kbhit():
            key = msvcrt.getch()
            if key == b'\xe0':  # 方向键前缀
                key = msvcrt.getch()
                if key == b'H': # Up
                    if self.direction != (0, 1): self.direction = (0, -1)
                elif key == b'P': # Down
                    if self.direction != (0, -1): self.direction = (0, 1)
                elif key == b'K': # Left
                    if self.direction != (1, 0): self.direction = (-1, 0)
                elif key == b'M': # Right
                    if self.direction != (-1, 0): self.direction = (1, 0)
            elif key in [b'w', b'W']:
                 if self.direction != (0, 1): self.direction = (0, -1)
            elif key in [b's', b'S']:
                 if self.direction != (0, -1): self.direction = (0, 1)
            elif key in [b'a', b'A']:
                 if self.direction != (1, 0): self.direction = (-1, 0)
            elif key in [b'd', b'D']:
                 if self.direction != (-1, 0): self.direction = (1, 0)
            elif key == b'\x1b': # ESC
                self.game_over = True

    def update(self):
        head_x, head_y = self.snake[0]
        dx, dy = self.direction
        new_head = (head_x + dx, head_y + dy)

        # 检查撞墙
        if new_head[0] <= 0 or new_head[0] >= self.width - 1 or \
           new_head[1] <= 0 or new_head[1] >= self.height - 1:
            self.game_over = True
            return

        # 检查撞自己
        if new_head in self.snake:
            self.game_over = True
            return

        self.snake.insert(0, new_head)

        # 检查吃食物
        if new_head == self.food:
            self.score += 10
            self.food = self.spawn_food()
        else:
            self.snake.pop()

    def draw(self):
        # 使用字符串拼接一次性输出，减少闪烁
        buffer = []
        
        # 顶部墙壁
        buffer.append(CHAR_WALL * self.width)
        
        # 游戏区域
        for y in range(1, self.height - 1):
            line = [CHAR_WALL]
            for x in range(1, self.width - 1):
                if (x, y) == self.snake[0]:
                    line.append(CHAR_SNAKE_HEAD)
                elif (x, y) in self.snake[1:]:
                    line.append(CHAR_SNAKE_BODY)
                elif (x, y) == self.food:
                    line.append(CHAR_FOOD)
                else:
                    line.append(CHAR_EMPTY)
            line.append(CHAR_WALL)
            buffer.append("".join(line))
        
        # 底部墙壁
        buffer.append(CHAR_WALL * self.width)
        
        # 分数和提示
        buffer.append(f"Score: {self.score}")
        buffer.append("Controls: W/A/S/D or Arrow Keys. ESC to quit.")
        
        # 清屏并打印
        os.system('cls')
        print("\n".join(buffer))

    def run(self):
        os.system('cls')
        print("Snake Game starting...")
        time.sleep(1)
        
        while not self.game_over:
            self.get_input()
            self.update()
            self.draw()
            time.sleep(SPEED)
        
        print("\nGAME OVER!")
        print(f"Final Score: {self.score}")
        # 等待用户按键后退出，避免窗口直接关闭
        print("Press any key to exit...")
        while msvcrt.kbhit(): # 清除缓冲区
            msvcrt.getch()
        msvcrt.getch()

if __name__ == "__main__":
    try:
        game = SnakeGame()
        game.run()
    except KeyboardInterrupt:
        print("\nGame aborted.")
