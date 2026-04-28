@extends('mail.layout')

@section('title', $title)

@section('content')
    <p>Halo <strong>{{ $recipient_name }}</strong>,</p>
    
    <p>{!! $body !!}</p>

    @if(isset($details))
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
            @foreach($details as $label => $value)
                <p style="margin: 5px 0;"><strong>{{ $label }}:</strong> {{ $value }}</p>
            @endforeach
        </div>
    @endif
@endsection

@isset($action_link)
    @section('button_link', $action_link)
    @section('button_text', $action_text ?? 'Lihat Detail')
@endisset

@section('footer')
    <p class="footer-text">Jangan lewatkan tenggat waktu pengajuan LPJ Anda.</p>
    <p class="footer-text">Terima kasih,<br><strong>Sistem SIGAP PNJ</strong></p>
@endsection
