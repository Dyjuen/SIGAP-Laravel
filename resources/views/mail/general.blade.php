@extends('mail.layout')

@section('title', $title)

@section('content')
    <p>Halo <strong>{{ $recipient_name }}</strong>,</p>
    
    <p>{!! $body !!}</p>

    @isset($action_link)
        <div class="button-container">
            <a href="{{ $action_link }}" class="card-link" style="text-decoration: none;">
                <div style="background-color: {{ $status_color ?? '#1ABDD4' }}; color: white; padding: 12px 25px; border-radius: 8px; display: inline-block; font-weight: bold;">
                    {{ $action_text ?? 'Klik di Sini' }}
                </div>
            </a>
        </div>
    @endisset
@endsection

@section('footer')
    <p class="footer-text">Terima kasih,<br><strong>Sistem SIGAP PNJ</strong></p>
@endsection
