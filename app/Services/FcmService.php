<?php

namespace App\Services;

use App\Models\DeviceToken;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Exception\Messaging\NotFound;
use Kreait\Firebase\Exception\MessagingException;
use Kreait\Firebase\Messaging;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Throwable;

class FcmService
{
    protected ?Messaging $messaging;

    public function __construct(?Messaging $messaging = null)
    {
        $this->messaging = $messaging;
    }

    /**
     * Send push notification to all devices registered to a specific user.
     */
    public function sendToUser(int $userId, string $title, string $body, array $data = []): void
    {
        $tokens = DeviceToken::where('user_id', $userId)->pluck('token')->toArray();

        if (empty($tokens)) {
            return;
        }

        foreach ($tokens as $token) {
            $this->sendToToken($token, $title, $body, $data);
        }
    }

    /**
     * Send push notification to a specific token.
     */
    public function sendToToken(string $token, string $title, string $body, array $data = []): void
    {
        if (! $this->messaging) {
            Log::warning('FCM message not sent: Firebase Messaging not initialized.');

            return;
        }

        try {
            // Ensure all values in data payload are strings (FCM requirement)
            $stringData = [];
            foreach ($data as $key => $value) {
                $stringData[(string) $key] = (string) $value;
            }

            $message = CloudMessage::new()
                ->withToken($token)
                ->withNotification(Notification::create($title, $body))
                ->withData($stringData);

            $this->messaging->send($message);
        } catch (NotFound $e) {
            // Token is invalid/expired. Delete from database.
            Log::warning('FCM token not found. Removing from database: '.$token);
            DeviceToken::where('token', $token)->delete();
        } catch (MessagingException $e) {
            Log::error('FCM messaging exception: '.$e->getMessage());
        } catch (Throwable $e) {
            Log::error('Unexpected error sending FCM notification: '.$e->getMessage());
        }
    }
}
