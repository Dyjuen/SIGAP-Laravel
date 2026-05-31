class MonitoringStats {
  final int total;
  final int running;
  final int completed;

  const MonitoringStats({
    required this.total,
    required this.running,
    required this.completed,
  });

  factory MonitoringStats.fromJson(Map<String, dynamic> json) {
    return MonitoringStats(
      total: _toInt(json['total']),
      running: _toInt(json['running']),
      completed: _toInt(json['completed']),
    );
  }
}

class MonitoringItem {
  final String kakId;
  final String kegiatanId;
  final String namaKegiatan;
  final int status;
  final Map<String, String?> dates;
  final int overdueDays;

  const MonitoringItem({
    required this.kakId,
    required this.kegiatanId,
    required this.namaKegiatan,
    required this.status,
    required this.dates,
    required this.overdueDays,
  });

  factory MonitoringItem.fromJson(Map<String, dynamic> json) {
    final rawDates = (json['dates'] is Map<String, dynamic>)
        ? json['dates'] as Map<String, dynamic>
        : <String, dynamic>{};

    return MonitoringItem(
      kakId: (json['kak_id'] ?? '').toString(),
      kegiatanId: (json['kegiatan_id'] ?? '').toString(),
      namaKegiatan: (json['nama_kegiatan'] ?? '-').toString(),
      status: _toInt(json['status'], fallback: 1),
      dates: {
        'accPPK': _toNullableString(rawDates['accPPK']),
        'accWD2': _toNullableString(rawDates['accWD2']),
        'uangMuka': _toNullableString(rawDates['uangMuka']),
        'lpj': _toNullableString(rawDates['lpj']),
        'setorFisik': _toNullableString(rawDates['setorFisik']),
      },
      overdueDays: _toInt(json['overdueDays']),
    );
  }
}

class MonitoringResponse {
  final List<MonitoringItem> items;
  final MonitoringStats stats;

  const MonitoringResponse({required this.items, required this.stats});

  factory MonitoringResponse.fromJson(Map<String, dynamic> json) {
    final rawData = json['data'];
    final rawStats = json['stats'] is Map<String, dynamic>
        ? json['stats'] as Map<String, dynamic>
        : <String, dynamic>{};

    List<dynamic> rows = const [];
    if (rawData is Map<String, dynamic> && rawData['data'] is List) {
      rows = rawData['data'] as List<dynamic>;
    } else if (rawData is List) {
      rows = rawData;
    }

    final items = rows
        .whereType<Map<String, dynamic>>()
        .map(MonitoringItem.fromJson)
        .toList();

    return MonitoringResponse(
      items: items,
      stats: MonitoringStats.fromJson(rawStats),
    );
  }
}

int _toInt(dynamic value, {int fallback = 0}) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  if (value is String) return int.tryParse(value) ?? fallback;
  return fallback;
}

String? _toNullableString(dynamic value) {
  if (value == null) return null;
  final normalized = value.toString().trim();
  return normalized.isEmpty ? null : normalized;
}
