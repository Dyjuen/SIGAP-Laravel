import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../models/lpj_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/lpj_provider.dart';
import 'lpj_detail_page.dart';

class LpjListPage extends StatefulWidget {
  const LpjListPage({super.key});

  @override
  State<LpjListPage> createState() => _LpjListPageState();
}

class _LpjListPageState extends State<LpjListPage> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _statusFilter = 'Semua';
  Timer? _ticker;
  DateTime _now = DateTime.now();

  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<LpjProvider>().fetchLpjList());
    _ticker = Timer.periodic(const Duration(minutes: 1), (_) {
      if (mounted) {
        setState(() => _now = DateTime.now());
      }
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          title: Text(
            'Daftar LPJ',
            style: GoogleFonts.figtree(
              color: const Color(0xFF0F172A),
              fontWeight: FontWeight.w800,
            ),
          ),
          iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
          actions: [
            IconButton(
              onPressed: () => context.read<LpjProvider>().fetchLpjList(),
              icon: const Icon(Icons.refresh_rounded),
            ),
          ],
        ),
        body: Consumer2<AuthProvider, LpjProvider>(
          builder: (context, authProvider, lpjProvider, _) {
            final roleId = authProvider.user?.roleId;
            final filteredList = _filterItems(lpjProvider.lpjList, roleId);
            final totalCount = lpjProvider.lpjList.length;

            if (lpjProvider.isLoading && totalCount == 0) {
              return const Center(
                child: CircularProgressIndicator(color: Color(0xFF33C8DA)),
              );
            }

            if (lpjProvider.errorMessage != null && totalCount == 0) {
              return _buildErrorState(lpjProvider.errorMessage!);
            }

            return RefreshIndicator(
              onRefresh: () => lpjProvider.fetchLpjList(),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildHero(totalCount, filteredList.length),
                    const SizedBox(height: 16),
                    _buildSearchBar(),
                    const SizedBox(height: 12),
                    _buildStatusFilter(roleId),
                    const SizedBox(height: 16),
                    if (lpjProvider.errorMessage != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _buildInlineError(lpjProvider.errorMessage!),
                      ),
                    if (filteredList.isEmpty)
                      _buildEmptyState()
                    else
                      ...filteredList.map(
                        (item) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _buildItemCard(
                            context,
                            item,
                            authProvider.user?.roleId,
                            _now,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  List<LpjListItem> _filterItems(List<LpjListItem> items, int? roleId) {
    final query = _searchQuery.trim().toLowerCase();
    return items.where((item) {
      // Note: Bendahara should still see Draft in the list, but actions
      // and displayed status are handled when rendering each item.

      final matchesQuery =
          query.isEmpty ||
          item.namaKegiatan.toLowerCase().contains(query) ||
          item.lpjStatusDisplay.toLowerCase().contains(query);
      final matchesStatus =
          _statusFilter == 'Semua' || item.lpjStatusDisplay == _statusFilter;
      return matchesQuery && matchesStatus;
    }).toList();
  }

  Widget _buildHero(int totalCount, int filteredCount) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Laporan Pertanggungjawaban',
            style: GoogleFonts.figtree(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Daftar kegiatan mengikuti alur web: lihat status, buka detail, lalu lanjut review atau submit ulang bila perlu.',
            style: GoogleFonts.figtree(
              color: Colors.white.withOpacity(0.82),
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _StatPill(label: 'Total', value: totalCount.toString()),
              const SizedBox(width: 10),
              _StatPill(label: 'Tampil', value: filteredCount.toString()),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: TextField(
        controller: _searchController,
        onChanged: (value) => setState(() => _searchQuery = value),
        decoration: InputDecoration(
          hintText: 'Cari nama kegiatan atau status LPJ',
          prefixIcon: const Icon(Icons.search_rounded),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 14,
          ),
          hintStyle: GoogleFonts.figtree(color: const Color(0xFF94A3B8)),
        ),
      ),
    );
  }

  Widget _buildStatusFilter(int? roleId) {
    final statuses = [
      'Semua',
      if (roleId != 6) 'Draft',
      'Menunggu Approval',
      'Disetujui',
      'Perlu Revisi',
      'Selesai',
    ];

    // Ensure bendahara doesn't keep 'Draft' as active filter
    if (roleId == 6 && _statusFilter == 'Draft') {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) setState(() => _statusFilter = 'Semua');
      });
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _statusFilter,
          isExpanded: true,
          icon: const Icon(Icons.keyboard_arrow_down_rounded),
          items: statuses
              .map(
                (status) => DropdownMenuItem(
                  value: status,
                  child: Text(
                    status,
                    style: GoogleFonts.figtree(fontWeight: FontWeight.w600),
                  ),
                ),
              )
              .toList(),
          onChanged: (value) {
            if (value == null) return;
            setState(() => _statusFilter = value);
          },
        ),
      ),
    );
  }

  Widget _buildItemCard(
    BuildContext context,
    LpjListItem item,
    int? roleId,
    DateTime now,
  ) {
    // Determine display status and color. For Bendahara (roleId==6), show
    // Draft items but display their status as 'Menunggu LPJ' and use the
    // Submitted color so they look like waiting items.
    String displayStatus = item.lpjStatusDisplay;
    Color themeColor = _statusColor(item.lpjStatus);
    if (roleId == 6 && item.lpjStatus == 'Draft') {
      displayStatus = 'Menunggu LPJ';
      themeColor = _statusColor('Submitted');
    }
    final actionLabel = _actionLabel(item, roleId);

    return InkWell(
      onTap: () => _openDetail(context, item.kegiatanId),
      borderRadius: BorderRadius.circular(22),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: const [
            BoxShadow(
              color: Color(0x080F172A),
              blurRadius: 18,
              offset: Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.namaKegiatan,
                        style: GoogleFonts.figtree(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        item.statusNama.isNotEmpty
                            ? 'Tahap: ${item.statusNama}'
                            : 'Tahap kegiatan belum tersedia',
                        style: GoogleFonts.figtree(
                          fontSize: 12,
                          color: const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
                _StatusChip(label: displayStatus, color: themeColor),
              ],
            ),
            const SizedBox(height: 14),
            _InfoRow(
              icon: Icons.account_balance_wallet_outlined,
              label: 'Anggaran',
              value: _formatCurrency(item.totalAnggaranDiusulkan),
            ),
            const SizedBox(height: 8),
            _InfoRow(
              icon: Icons.payments_outlined,
              label: 'Dicairkan',
              value: _formatCurrency(item.danaDicairkan),
            ),
            if (item.tglBatasLpj != null || item.lpjSubmittedAt != null) ...[
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  if (item.tglBatasLpj != null)
                    _MiniBadge(
                      icon: Icons.schedule_rounded,
                      text: 'Batas: ${_formatDate(item.tglBatasLpj!)}',
                    ),
                  if (item.lpjSubmittedAt != null)
                    _MiniBadge(
                      icon: Icons.cloud_done_outlined,
                      text: 'Submit: ${_formatDate(item.lpjSubmittedAt!)}',
                    ),
                  if (item.tglBatasLpj != null)
                    _MiniBadge(
                      icon: Icons.hourglass_bottom_rounded,
                      text: _countdownText(item.tglBatasLpj!, now),
                      highlight: _isDeadlineClose(item.tglBatasLpj!, now),
                    ),
                ],
              ),
            ],
            const SizedBox(height: 14),
            // For Bendahara viewing Draft items, do not show any action button.
            if (!(roleId == 6 && item.lpjStatus == 'Draft'))
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => _openDetail(context, item.kegiatanId),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF33C8DA),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: Text(
                    actionLabel,
                    style: GoogleFonts.figtree(fontWeight: FontWeight.w700),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          const Icon(
            Icons.description_outlined,
            size: 56,
            color: Color(0xFF94A3B8),
          ),
          const SizedBox(height: 14),
          Text(
            'Tidak ada LPJ yang cocok',
            style: GoogleFonts.figtree(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Coba ubah pencarian atau filter status.',
            textAlign: TextAlign.center,
            style: GoogleFonts.figtree(color: const Color(0xFF64748B)),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 56, color: Colors.redAccent),
            const SizedBox(height: 14),
            Text(
              message,
              textAlign: TextAlign.center,
              style: GoogleFonts.figtree(color: const Color(0xFF0F172A)),
            ),
            const SizedBox(height: 14),
            ElevatedButton(
              onPressed: () => context.read<LpjProvider>().fetchLpjList(),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF33C8DA),
                foregroundColor: Colors.white,
              ),
              child: const Text('Coba Lagi'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInlineError(String message) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.red.shade100),
      ),
      child: Text(
        message,
        style: GoogleFonts.figtree(color: Colors.red.shade700),
      ),
    );
  }

  void _openDetail(BuildContext context, String kegiatanId) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => LpjDetailPage(kegiatanId: kegiatanId)),
    ).then((_) => context.read<LpjProvider>().fetchLpjList());
  }

  String _actionLabel(LpjListItem item, int? roleId) {
    if (roleId == 6 && item.lpjStatus == 'Approved') {
      return 'Selesaikan LPJ';
    }
    if (item.lpjStatus == 'Draft' || item.lpjStatus == 'Revision Requested') {
      return 'Lihat / Submit LPJ';
    }
    return 'Lihat / Review LPJ';
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'Draft':
        return const Color(0xFF3B82F6);
      case 'Submitted':
        return const Color(0xFFF59E0B);
      case 'Approved':
        return const Color(0xFF10B981);
      case 'Revision Requested':
        return const Color(0xFFF97316);
      case 'Completed':
        return const Color(0xFF8B5CF6);
      default:
        return const Color(0xFF64748B);
    }
  }

  String _formatCurrency(double value) {
    return NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    ).format(value);
  }

  String _formatDate(String rawValue) {
    final date = DateTime.tryParse(rawValue);
    if (date == null) return rawValue;
    return DateFormat('dd MMM yyyy', 'id_ID').format(date);
  }

  String _safeText(String? value) {
    return (value ?? '').toString();
  }

  String _countdownText(String rawValue, DateTime now) {
    final deadline = DateTime.tryParse(rawValue);
    if (deadline == null) return 'Timer LPJ: $rawValue';

    final remaining = deadline.difference(now);
    final remainingMinutes = remaining.inMinutes;

    if (remainingMinutes < 0) {
      final overdueDays = (remainingMinutes.abs() / (60 * 24)).ceil();
      return 'Terlambat $overdueDays hari';
    }

    final daysLeft = (remainingMinutes / (60 * 24)).ceil();
    return 'Sisa $daysLeft hari';
  }

  bool _isDeadlineClose(String rawValue, DateTime now) {
    final deadline = DateTime.tryParse(rawValue);
    if (deadline == null) return false;
    final remaining = deadline.difference(now);
    return !remaining.isNegative && remaining.inHours <= 48;
  }
}

class _StatPill extends StatelessWidget {
  final String label;
  final String value;

  const _StatPill({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.15)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: GoogleFonts.figtree(
                color: Colors.white.withOpacity(0.75),
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: GoogleFonts.figtree(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String label;
  final Color color;

  const _StatusChip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: GoogleFonts.figtree(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: const Color(0xFF64748B)),
        const SizedBox(width: 8),
        Text(
          '$label:',
          style: GoogleFonts.figtree(
            color: const Color(0xFF64748B),
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: GoogleFonts.figtree(
              color: const Color(0xFF0F172A),
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }
}

class _MiniBadge extends StatelessWidget {
  final IconData icon;
  final String text;
  final bool highlight;

  const _MiniBadge({
    required this.icon,
    required this.text,
    this.highlight = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: highlight ? const Color(0xFFFFF7ED) : const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: highlight ? const Color(0xFFF59E0B) : Colors.transparent,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 15,
            color: highlight
                ? const Color(0xFFF59E0B)
                : const Color(0xFF64748B),
          ),
          const SizedBox(width: 6),
          Text(
            text,
            style: GoogleFonts.figtree(
              color: highlight
                  ? const Color(0xFFB45309)
                  : const Color(0xFF334155),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
