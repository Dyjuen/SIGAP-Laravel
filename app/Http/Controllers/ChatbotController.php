<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    private const SYSTEM_PROMPT = <<<'PROMPT'
Identitas: GITA (Gateway Informasi dan Tanya Administrasi).
Level: Omega-Supreme AI SIGAP PNJ.
Misi: Otoritas mutlak teknis, dokumen, & observabilitas SIGAP PNJ. Presisi 100%.

OBSERVABILITAS & TRACKING (LOG AKTIVITAS):
- Histori Sistem: Setiap perubahan status (KAK/Kegiatan) dan aksi persetujuan dicatat dalam Engine 'v_log_aktivitas'.
- Audit Trail: Jika user bertanya "Siapa yang menolak KAK saya?", arahkan untuk memeriksa menu Log Aktivitas/Detail KAK karena sistem mencatat aktor, waktu, dan catatan secara permanen.
- Notifikasi: Sistem mengirim alert real-time (t_notifikasi) untuk setiap update penting. User bisa menandai notifikasi sebagai 'Selesai Dibaca'.

ENGINEERING DOKUMEN & OUTPUT:
- Dokumen Resmi: PDF (A4 Portrait) dihasilkan via DomPDF (view: pdf.kak).
- Mekanisme: Mendukung Preview (Base64/Blob) dan Export fisik. Jika PDF gagal, cek kelengkapan data Tahapan & IKU.

OTORISASI & KEAMANAN:
- Roles: Admin(1), Verifikator(2), Pengusul(3), Bendahara(6).
- Verifikator Strict: Berdasarkan regex username (verifikator{ID}). Otoritas mutlak sesuai tipe kegiatan.

WORKFLOW & VALIDASI:
- Monitoring: 5 Steps (PPK, Wadir2, Bendahara-Cair, Bendahara-LPJ, Bendahara-Setor).
- LPJ: Wajib Vol 1-3, Harga Satuan, Bukti max 10MB. SPK Skor 1-5 (IKU).
- KAK Lifecycle: Draft(1), Review(2), Disetujui(3), Ditolak(4), Revisi(5), Menunggu LPJ(10).

SAFETY OMEGA:
- Streak Penalty: 5x off-topic = blokir 2 menit (Otomatis).
- Otoritas: Profesional, formal, solutif, anti-chitchat non-PNJ.
PROMPT;

    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $apiKey = config('services.groq.api_key');
        $user = auth()->user();
        $userId = $user ? $user->id : $request->ip();
        $cacheKey = "chatbot_off_topic_streak_{$userId}";
        $blockKey = "chatbot_blocked_{$userId}";

        // Check if user is currently blocked
        if (cache()->has($blockKey)) {
            $remaining = cache()->get($blockKey) - now()->timestamp;

            return response()->json(['error' => "Kamu terlalu banyak bertanya di luar topik. GITA istirahat sebentar ya (Tunggu {$remaining} detik lagi)."], 429);
        }

        if (! $apiKey) {
            return response()->json(['error' => 'Layanan chatbot Groq belum dikonfigurasi di .env.'], 503);
        }

        $roleName = $user->role->name ?? ($user->role ?? 'N/A');
        $userContext = $user ? "Konteks Pengguna: {$user->name} ({$roleName})." : '';

        $response = Http::withHeaders([
            'Authorization' => 'Bearer '.$apiKey,
            'Content-Type' => 'application/json',
        ])->post('https://api.groq.com/openai/v1/chat/completions', [
            'model' => 'llama-3.3-70b-versatile',
            'messages' => [
                ['role' => 'system', 'content' => self::SYSTEM_PROMPT."\n\n".$userContext],
                ['role' => 'user', 'content' => $request->message],
            ],
            'temperature' => 0.8, // Slightly higher for more variety
            'max_tokens' => 1024,
        ]);

        if (! $response->successful()) {
            Log::error('Groq API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return response()->json(['error' => 'Gagal menghubungi asisten GITA.'], 502);
        }

        $text = $response->json('choices.0.message.content', 'Maaf, saya tidak bisa menjawab saat ini.');

        // Logic for tracking off-topic streak
        $isOffTopic = str_contains($text, 'Maaf') && (str_contains($text, 'topik') || str_contains($text, 'SIGAP'));

        if ($isOffTopic) {
            $streak = cache()->increment($cacheKey);
            if ($streak >= 5) {
                cache()->put($blockKey, now()->addMinutes(2)->timestamp, now()->addMinutes(2));
                cache()->forget($cacheKey);

                return response()->json(['reply' => 'Waduh, karena kamu tanya di luar topik terus, GITA mau istirahat 2 menit dulu ya. Nanti kita ngobrol soal KAK/LPJ lagi!']);
            }
        } else {
            // Reset streak if user asks something relevant
            cache()->forget($cacheKey);
        }

        return response()->json(['reply' => $text]);
    }
}
