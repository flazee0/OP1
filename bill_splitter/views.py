from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import render
import json
import sqlite3
from datetime import datetime

def index(request):
    return render(request, 'index.html')

@csrf_exempt
@require_http_methods(["POST"])
def save_bill(request):
    try:
        data = json.loads(request.body)
        conn = sqlite3.connect('db.sqlite3')
        cursor = conn.cursor()
        
        # Создаем таблицу, если она не существует
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS bill_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                total_amount REAL,
                number_of_people INTEGER,
                amount_per_person REAL,
                date TEXT
            )
        ''')
        
        # Вставляем данные
        cursor.execute('''
            INSERT INTO bill_history (total_amount, number_of_people, amount_per_person, date)
            VALUES (?, ?, ?, ?)
        ''', (
            float(data['totalAmount']),
            int(data['numberOfPeople']),
            float(data['amountPerPerson']),
            data['date']
        ))
        
        conn.commit()
        conn.close()
        return JsonResponse({'status': 'success'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@require_http_methods(["GET"])
def get_history(request):
    try:
        conn = sqlite3.connect('db.sqlite3')
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM bill_history ORDER BY date DESC')
        rows = cursor.fetchall()
        
        history = []
        for row in rows:
            history.append({
                'totalAmount': row[1],
                'numberOfPeople': row[2],
                'amountPerPerson': row[3],
                'date': row[4]
            })
        
        conn.close()
        return JsonResponse(history, safe=False)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400) 