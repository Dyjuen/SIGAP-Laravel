<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    private const SYSTEM_PROMPT = <<<'PROMPT'
Kamu adalah GITA (Gateway Informasi dan Tanya Administrasi), asisten AI resmi SIGAP PNJ (Sistem Informasi Gerbang Administrasi Pengajuan).

Tugasmu adalah membantu civitas akademika Politeknik Negeri Jakarta dengan pertanyaan seputar:
- KAK (Kerangka Acuan Kerja): pengertian, format, cara membuat, dan alur pengajuan
- LPJ (Laporan Pertanggungjawaban): pengertian, format, cara membuat, syarat, dan alur pengumpulan
- Prosedur administrasi kegiatan kampus di PNJ
- Peran pengguna SIGAP: Pengusul, Verifikator, WD2, PPK, Bendahara, Rektorat

Aturan:
1. Selalu jawab dalam Bahasa Indonesia yang jelas dan ramah
2. Jika pertanyaan di luar topik di atas, arahkan pengguna untuk menghubungi pihak terkait
3. Jawaban singkat, padat, dan akurat
4. Jangan membuat informasi fiktif tentang kebijakan PNJ
PROMPT;

    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000'
        ], [
            'required' => 'Pesan tidak boleh kosong.',
            'string' => 'Pesan harus berupa teks.',
            'max' => 'Pesan maksimal :max karakter.',
        ]);

        $apiKey = config('services.gemini.api_key');

        if (! $apiKey) {
            return response()->json(['error' => 'Layanan chatbot belum dikonfigurasi.'], 503);
        }

        $response = Http::withHeaders(['Content-Type' => 'application/json'])
            ->post("https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [['text' => self::SYSTEM_PROMPT."\n\nPertanyaan pengguna: ".$request->message]],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 512,
                ],
            ]);

        if (! $response->successful()) {
            Log::error('Gemini API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return response()->json(['error' => 'Gagal menghubungi asisten.'], 502);
        }

        $text = $response->json('candidates.0.content.parts.0.text', 'Maaf, saya tidak bisa menjawab saat ini.');

        return response()->json(['reply' => $text]);
    }
}
