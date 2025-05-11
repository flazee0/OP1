document.addEventListener('DOMContentLoaded', function() {
    const calculateBtn = document.getElementById('calculateBtn');
    const totalAmountInput = document.getElementById('totalAmount');
    const numberOfPeopleInput = document.getElementById('numberOfPeople');
    const amountPerPersonElement = document.getElementById('amountPerPerson');
    const historyList = document.getElementById('historyList');

    // Загрузка истории при старте
    loadHistory();

    calculateBtn.addEventListener('click', function() {
        const totalAmount = parseFloat(totalAmountInput.value);
        const numberOfPeople = parseInt(numberOfPeopleInput.value);

        if (isNaN(totalAmount) || isNaN(numberOfPeople) || totalAmount <= 0 || numberOfPeople <= 0) {
            alert('Пожалуйста, введите корректные значения');
            return;
        }

        const amountPerPerson = totalAmount / numberOfPeople;
        const result = `Каждый человек должен заплатить: ${amountPerPerson.toFixed(2)} ₽`;

        amountPerPersonElement.textContent = result;

        // Сохранение в историю
        saveToHistory(totalAmount, numberOfPeople, amountPerPerson);
    });

    function saveToHistory(totalAmount, numberOfPeople, amountPerPerson) {
        const historyItem = {
            totalAmount,
            numberOfPeople,
            amountPerPerson,
            date: new Date().toLocaleString()
        };

        // Отправка данных на сервер
        fetch('/save_bill/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(historyItem)
        })
        .then(response => response.json())
        .then(data => {
            loadHistory();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function loadHistory() {
        // Загрузка истории с сервера
        fetch('/get_history/')
            .then(response => response.json())
            .then(data => {
                historyList.innerHTML = '';
                data.forEach(item => {
                    const historyItem = document.createElement('div');
                    historyItem.className = 'history-item';
                    historyItem.innerHTML = `
                        <p>Дата: ${item.date}</p>
                        <p>Общая сумма: ${item.totalAmount} ₽</p>
                        <p>Количество человек: ${item.numberOfPeople}</p>
                        <p>С каждого: ${item.amountPerPerson.toFixed(2)} ₽</p>
                    `;
                    historyList.appendChild(historyItem);
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}); 