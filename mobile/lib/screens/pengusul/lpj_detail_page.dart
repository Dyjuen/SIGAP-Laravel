import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../providers/lpj_provider.dart';
import 'lpj_form_page.dart';

class LpjDetailPage extends StatefulWidget {
  final String kegiatanId;

  const LpjDetailPage({super.key, required this.kegiatanId});

  @override
  State<LpjDetailPage> createState() => _LpjDetailPageState();
}

class _LpjDetailPageState extends State<LpjDetailPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => context.read<LpjProvider>().getLpjDetail(widget.kegiatanId),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Detail LPJ', style: GoogleFonts.figtree(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
      ),
      body: Consumer<LpjProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final detail = provider.selectedLpj;
          if (detail == null) {
            return const Center(child: Text('Data LPJ tidak ditemukan.'));
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  detail.namaKegiatan,
                  style: GoogleFonts.figtree(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: _getStatusColor(detail.statusDisplay).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    detail.statusDisplay,
                    style: TextStyle(
                      color: _getStatusColor(detail.statusDisplay),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Timeline & Approvals',
                  style: GoogleFonts.figtree(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                // Timeline widget representation
                _buildTimelineItem('Submitted', detail.lpjSubmittedAt ?? '-'),
                _buildTimelineItem('Approved', detail.lpjApprovedAt ?? '-'),
                _buildTimelineItem('Completed', detail.lpjCompletedAt ?? '-'),
                
                const SizedBox(height: 24),
                Text(
                  'Realisasi Anggaran',
                  style: GoogleFonts.figtree(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    side: const BorderSide(color: Color(0xFFE2E8F0)),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Total Diusulkan: Rp ${detail.totalAnggaranDiusulkan}'),
                        const SizedBox(height: 8),
                        Text('Total Realisasi: Rp ${detail.totalRealisasi}'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                if (detail.isDraft || detail.isRevisionRequested)
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => LpjFormPage(kegiatanId: detail.kegiatanId),
                          ),
                        ).then((_) => provider.getLpjDetail(widget.kegiatanId));
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00BCD4),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text('Edit / Submit LPJ', style: TextStyle(color: Colors.white)),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildTimelineItem(String title, String time) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          const Icon(Icons.circle, size: 12, color: Color(0xFF00BCD4)),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
              Text(time, style: const TextStyle(color: Colors.grey, fontSize: 12)),
            ],
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    if (status.contains('Draft')) return Colors.grey;
    if (status.contains('Menunggu')) return Colors.orange;
    if (status.contains('Disetujui')) return Colors.green;
    if (status.contains('Revisi')) return Colors.red;
    if (status.contains('Selesai')) return Colors.blue;
    return Colors.black;
  }
}
