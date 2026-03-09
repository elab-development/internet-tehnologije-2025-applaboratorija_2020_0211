<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Novi izveštaj prosledio korisnik</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .header {
            background-color: #28a745;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: white;
            padding: 20px;
            border-radius: 0 0 5px 5px;
        }
        .report-box {
            background-color: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #28a745;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #999;
        }
        .button {
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Novi Izveštaj Poslat</h1>
        </div>
        <div class="content">
            <p>Pozdrav,</p>

            <p>Korisnik je poslao novi izveštaj na ResearchHub platformi.</p>

            <div class="report-box">
                <p><strong>Korisnik:</strong> {{ $report->user->name }}</p>
                <p><strong>Email:</strong> {{ $report->user->email }}</p>
                <p><strong>Projekat:</strong> {{ $report->project?->title ?? 'Bez projekta' }}</p>
                <p><strong>Datum:</strong> {{ $report->created_at->format('d.m.Y H:i') }}</p>
                <p><strong>Status:</strong> {{ $report->status }}</p>
            </div>

            <h3>Opis Izveštaja:</h3>
            <p>{{ Str::limit($report->description, 300) }}</p>

            <p>
                <a href="{{ config('app.url') }}/admin/reports" class="button">Pregledajte Izveštaj</a>
            </p>

            <p style="margin-top: 30px;">Hvala što koristite ResearchHub.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} ResearchHub. Sva prava zadržana.</p>
        </div>
    </div>
</body>
</html>
