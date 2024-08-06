import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Размер игрового поля
const boardSize = 20;

// Функция для получения случайной позиции на игровом поле
const getRandomPosition = () => {
    return {
        x: Math.floor(Math.random() * boardSize),
        y: Math.floor(Math.random() * boardSize),
    };
};

const App = () => {
    const [snake, setSnake] = useState([{ x: 2, y: 2 }]);
    const [direction, setDirection] = useState({ x: 1, y: 0 });
    const [food, setFood] = useState(getRandomPosition());
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false); // Флаг для начала игры
    const gameBoardRef = useRef(null);

    // Обработчик нажатия клавиш для изменения направления змейки
    useEffect(() => {
        const handleKeyPress = (event) => {
            switch (event.key) {
                case 'ArrowUp':
                    setDirection((prev) => (prev.y === 1 ? prev : { x: 0, y: -1 }));
                    break;
                case 'ArrowDown':
                    setDirection((prev) => (prev.y === -1 ? prev : { x: 0, y: 1 }));
                    break;
                case 'ArrowLeft':
                    setDirection((prev) => (prev.x === 1 ? prev : { x: -1, y: 0 }));
                    break;
                case 'ArrowRight':
                    setDirection((prev) => (prev.x === -1 ? prev : { x: 1, y: 0 }));
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    // Логика обработки свайпов
    useEffect(() => {
        const handleSwipe = (event) => {
            const touch = event.changedTouches[0];
            const startX = touch.clientX;
            const startY = touch.clientY;

            const handleMove = (event) => {
                const touchMove = event.changedTouches[0];
                const endX = touchMove.clientX;
                const endY = touchMove.clientY;

                const diffX = endX - startX;
                const diffY = endY - startY;

                if (Math.abs(diffX) > Math.abs(diffY)) {
                    if (diffX > 0) {
                        setDirection((prev) => (prev.x === -1 ? prev : { x: 1, y: 0 }));
                    } else {
                        setDirection((prev) => (prev.x === 1 ? prev : { x: -1, y: 0 }));
                    }
                } else {
                    if (diffY > 0) {
                        setDirection((prev) => (prev.y === -1 ? prev : { x: 0, y: 1 }));
                    } else {
                        setDirection((prev) => (prev.y === 1 ? prev : { x: 0, y: -1 }));
                    }
                }

                window.removeEventListener('touchmove', handleMove);
            };

            window.addEventListener('touchmove', handleMove);

            window.addEventListener('touchend', () => {
                window.removeEventListener('touchmove', handleMove);
            });
        };

        window.addEventListener('touchstart', handleSwipe);

        return () => {
            window.removeEventListener('touchstart', handleSwipe);
        };
    }, []);

    // Основная логика игры
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const moveSnake = () => {
            setSnake((prevSnake) => {
                const newSnake = [...prevSnake];
                const head = newSnake[newSnake.length - 1];
                let newHead = { x: head.x + direction.x, y: head.y + direction.y };

                // Проход через края экрана
                if (newHead.x >= boardSize) newHead.x = 0;
                if (newHead.x < 0) newHead.x = boardSize - 1;
                if (newHead.y >= boardSize) newHead.y = 0;
                if (newHead.y < 0) newHead.y = boardSize - 1;

                // Проверка на столкновение с хвостом
                if (newSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
                    setGameOver(true);
                    return prevSnake;
                }

                newSnake.push(newHead);

                // Проверка на съедение еды
                if (newHead.x === food.x && newHead.y === food.y) {
                    setFood(getRandomPosition());
                } else {
                    newSnake.shift();
                }

                return newSnake;
            });
        };

        const intervalId = setInterval(moveSnake, 200);

        return () => clearInterval(intervalId);
    }, [direction, food, gameStarted, gameOver]);

    // Функция для начала новой игры
    const startNewGame = () => {
        setSnake([{ x: 2, y: 2 }]);
        setDirection({ x: 1, y: 0 });
        setFood(getRandomPosition());
        setGameOver(false);
        setGameStarted(true);
    };

    return (
        <div className="container">
            {!gameStarted && (
                <div className="menu">
                    <button onClick={startNewGame}>Start Game</button>
                </div>
            )}
            <div className="game-board" ref={gameBoardRef}>
                {gameOver && <div className="game-over">Game Over</div>}
                {Array.from({ length: boardSize }).map((_, row) => (
                    <div key={row} className="row">
                        {Array.from({ length: boardSize }).map((_, col) => (
                            <div
                                key={col}
                                className={`cell ${
                                    snake.some((segment) => segment.x === col && segment.y === row)
                                        ? 'snake'
                                        : food.x === col && food.y === row
                                            ? 'food'
                                            : ''
                                }`}
                            />
                        ))}
                    </div>
                ))}
            </div>
            {gameOver && (
                <div className="menu">
                    <button onClick={startNewGame}>Restart Game</button>
                </div>
            )}
        </div>
    );
};

export default App;
