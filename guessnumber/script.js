<script>
  // Загадываем число от 1 до 100
const secretNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;
const maxAttempts = 10; // Количество максимальных попыток
const previousGuesses = []; // Массив для хранения предыдущих попыток




function Guess()
{
const outputDiv = document.getElementById('output');
const attemptsDiv = document.getElementById('attempts');
const inputField = document.getElementById('userInput');
const submitButton = document.getElementById('submitBtn');








    const userInput = parseInt(inputField.value);
   
    // Проверка введенного числа
    if (isNaN(userInput) || userInput < 1 || userInput > 100) {
        outputDiv.textContent = "Пожалуйста, введите число от 1 до 100.";
        return;
    }




    attempts++;
    previousGuesses.push(userInput); // Сохраняем текущую попытку




    if (userInput === secretNumber) {
        outputDiv.textContent = `Поздравляю! Вы угадали число ${secretNumber} за ${attempts} ${attempts === 1 ? "попытку" : "попытки"}.`;
        inputField.disabled = true; // Блокируем ввод после выигрыша
    } else if (userInput < secretNumber) {
        outputDiv.textContent = "Ваше число меньше загаданного.";
    } else {
        outputDiv.textContent = "Ваше число больше загаданного.";
    }




    // Обновляем количество оставшихся попыток
    const remainingAttempts = maxAttempts - attempts;
    attemptsDiv.textContent = `Оставшиеся попытки: ${remainingAttempts}`;




    // Проверяем, исчерпаны ли попытки
    if (attempts === maxAttempts) {
        outputDiv.textContent = `Извините, вы использовали все ${maxAttempts} попыток. Загаданное число было ${secretNumber}.`;
        inputField.disabled = true; // Блокируем ввод после окончания попыток
    }




    // Выводим предыдущие попытки
    attemptsDiv.innerHTML += `<br>Ваши попытки: ${previousGuesses.join(', ')}`;




    inputField.value = ''; // Очищаем поле ввода
};




</script>