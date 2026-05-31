import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../providers/lpj_provider.dart';
import '../../models/lpj_model.dart';
import 'lpj_detail_page.dart';
import 'lpj_form_page.dart';

class LpjListPage extends StatefulWidget {
  const LpjListPage({super.key});

  @override
  State<LpjListPage> createState() => _LpjListPageState();
}

class _LpjListPageState extends State<LpjListPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => context.read<LpjProvider>().fetchLpjList(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Daftar LPJ',
          style: GoogleFonts.figtree(
            color: const Color(0xFF0F172A),
            fontWeight: FontWeight.bold,
          ),
        ),
        iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
      ),
      body: Consumer<LpjProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFF33C8DA)),
            );
          }

          if (provider.errorMessage != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(provider.errorMessage!),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => provider.fetchLpjList(),
                    child: const Text('Coba Lagi'),
                  ),
                ],
              ),
            );
          }

          final list = provider.lpjList;

          if (list.isEmpty) {
            return const Center(
              child: Text('Belum ada data LPJ.'),
            );
          }

          return RefreshIndicator(
            onRefresh: () => provider.fetchLpjList(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: list.length,
              itemBuilder: (context, index) {
                final item = list[index];
                return Card(
                  elevation: 0,
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    title: Text(
                      item.namaKegiatan,
                      style: GoogleFonts.figtree(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 8.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Status: ${item.lpjStatusDisplay}'),
                          const SizedBox(height: 4),
                          Text('Anggaran: Rp ${item.totalAnggaranDiusulkan}'),
                        ],
                      ),
                    ),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => LpjDetailPage(kegiatanId: item.kegiatanId),
                        ),
                      ).then((_) => provider.fetchLpjList());
                    },
                  ),
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF33C8DA),
        onPressed: () {
          // This should ideally select a KAK to create LPJ for, but for now we route to form.
          // Since form requires a kegiatanId, we'll route and let form handle if missing or passed null.
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const LpjFormPage(kegiatanId: ''),
            ),
          ).then((_) => context.read<LpjProvider>().fetchLpjList());
        },
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
