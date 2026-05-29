<x-mail::message>
# {{ $mailData['title'] }}

{{ $mailData['body'] }}

@if(isset($mailData['details']))
<x-mail::panel>
@foreach($mailData['details'] as $label => $value)
**{{ $label }}:** {{ $value }}<br>
@endforeach
</x-mail::panel>
@endif

<x-mail::button :url="$mailData['action_link']">
{{ $mailData['action_text'] }}
</x-mail::button>

Terima kasih,<br>
{{ config('app.name') }}
</x-mail::message>
