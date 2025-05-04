from random import choice

class MiniMax:
    def __init__(self, board):
        if not self.board_is_correct(board=board):
            raise RuntimeError(f"invalid board: {board}")
        self.int_board = 3
        self.COMP = 1
        self.HUMAN = -1
        self.board = [[0 for j in range(self.int_board)] for i in range(self.int_board)]
        for i in range(3):
            for j in range(3):
                if board[3 * i + j] == 'X': self.board[i][j] = -1
                elif board[3 * i + j] == 'O': self.board[i][j] = 1
                else: self.board[i][j] = 0

    def board_is_correct(self, board):
        if type(board) != list or len(board) != 9:
            return False
        for i in board:
            if i not in ['X', 'O', '']:
                return False
        return True

    def empty_cells(self, state):
        return [[x, y] for x, row in enumerate(state) for y, cell in enumerate(row) if cell == 0]

    def valid_move(self, x, y):
        if [x, y] in self.empty_cells(self.board):
            return True
        else:
            return False

    def evaluate(self):
        if self.wins(self.COMP):
            score = +1
        elif self.wins(self.HUMAN):
            score = -1
        else:
            score = 0

        return [-1, -1, score]

    def wins(self, player, winset=False):
        state = self.board
        size = len(state)
        lines = []

        # добавляем строки, столбцы и диагонали
        for i in range(size):
            # добавляем строку
            line = [state[i][j] for j in range(size)]
            lines.append(line)
            # добавляем столбец
            line = [state[j][i] for j in range(size)]
            lines.append(line)
            # добавляем диагональ 1
            if i == 0:
                line = [state[j][j] for j in range(size)]
                lines.append(line)
            # добавляем диагональ 2
            if i == size - 1:
                line = [state[j][size - j - 1] for j in range(size)]
                lines.append(line)

        # проверяем наличие выигрышной комбинации
        for line in lines:
            if line == [player] * size:
                return True
        return False

    def Game_over(self, state):
        return self.wins(self.HUMAN) or self.wins(self.COMP)

    def minimax(self, state, depth, player, alpha=-float('inf'), beta=float('inf')):  # Алгоритм минимакса
        if player == self.COMP:
            best = [-1, -1, -float('inf')]
        else:
            best = [-1, -1, float('inf')]

        if depth == 0 or self.Game_over(state):
            return self.evaluate()  # Проверяем лучший ход

        empty_cells = self.empty_cells(state)
        for cell in empty_cells:  # Вытаскиваем все свободные ячейки с поля
            x, y = cell[0], cell[1]
            state[x][y] = player
            score = self.minimax(state, depth - 1, -player, alpha, beta)  # min
            state[x][y] = 0
            score[0], score[1] = x, y

            if player == self.COMP:
                if score[2] > best[2]:
                    best = score
                alpha = max(alpha, score[2])  # Альфа бета отсечение
                if alpha >= beta:
                    break
            else:
                if score[2] < best[2]:
                    best = score
                beta = min(beta, score[2])  # Альфа бета отсечение
                if beta <= alpha:
                    break
        return best  # Возвращаем картеж с лучшими координатами x,y

    def ai_turn(self):  # Функция хода бота
        x = None
        y = None
        depth = len(self.empty_cells(self.board))  # Смотрим все свободные координаты
        if depth == 0 or self.Game_over(
                self.board):  # Если нету свободных клеток или игра кончилась то ничего не делаем
            return
        if depth == 9:  # Если глубина 9 то начало и 1 ход рандомный или если выпало на рандоме 1
            while self.valid_move(x, y) == False:
                x = choice([0, 1, 2])
                y = choice([0, 1, 2])
        else:  # если ничего подобного то ищем лучший ход с помощью алгоритма минимакса
            move = self.minimax(self.board, depth, self.COMP)
            x, y = move[0], move[1]
        return y + 3 * x