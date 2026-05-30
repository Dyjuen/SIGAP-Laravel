import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../models/pencairan_model.dart';
import '../../providers/pencairan_provider.dart';

class PencairanPage extends StatefulWidget {
  const PencairanPage({super.key});

  @override
  State<PencairanPage> createState() => _PencairanPageState();
}

class _PencairanPageState extends State<PencairanPage> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      context.read<PencairanProvider>().fetchList();
    });
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text;
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  String _formatCurrency(double amount) {
    return NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    ).format(amount);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          title: Text(
            'Pencairan Dana',
            style: GoogleFonts.figtree(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF0F172A),
            ),
          ),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF0F172A), size: 20),
            onPressed: () => Navigator.of(context).pop(),
          ),
          centerTitle: true,
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(1.0),
            child: Container(
              color: const Color(0xFFE2E8F0),
              height: 1.0,
            ),
          ),
        ),
        body: Consumer<PencairanProvider>(
          builder: (context, provider, child) {
            if (provider.isLoading && provider.items.isEmpty) {
              return const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF33C8DA)),
                ),
              );
            }

            // Filter items based on search query
            final filteredItems = provider.items.where((item) {
              final query = _searchQuery.toLowerCase();
              return item.namaKegiatan.toLowerCase().contains(query) ||
                  item.pelaksanaManual.toLowerCase().contains(query) ||
                  item.penanggungJawabManual.toLowerCase().contains(query);
            }).toList();

            // Computations for summary card
            double totalAnggaran = 0;
            double totalDicairkan = 0;
            for (var item in provider.items) {
              totalAnggaran += item.totalAnggaranDiusulkan;
              totalDicairkan += item.danaDicairkan;
            }
            double totalSisa = totalAnggaran - totalDicairkan;

            return RefreshIndicator(
              onRefresh: () => provider.fetchList(),
              color: const Color(0xFF33C8DA),
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  // Summary Card (Cyan Gradient)
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF33C8DA), Color(0xFF00ACC1)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF33C8DA).withOpacity(0.3),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Ringkasan Anggaran Kegiatan',
                          style: GoogleFonts.figtree(
                            color: Colors.white.withOpacity(0.9),
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Total Anggaran',
                                    style: GoogleFonts.figtree(
                                      color: Colors.white70,
                                      fontSize: 11,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _formatCurrency(totalAnggaran),
                                    style: GoogleFonts.figtree(
                                      color: Colors.white,
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              width: 1,
                              height: 36,
                              color: Colors.white24,
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Total Dicairkan',
                                    style: GoogleFonts.figtree(
                                      color: Colors.white70,
                                      fontSize: 11,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _formatCurrency(totalDicairkan),
                                    style: GoogleFonts.figtree(
                                      color: Colors.white,
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const Divider(color: Colors.white24, height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Total Sisa Dana:',
                              style: GoogleFonts.figtree(
                                color: Colors.white.withOpacity(0.9),
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            Text(
                              _formatCurrency(totalSisa),
                              style: GoogleFonts.figtree(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Search Bar
                  TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Cari nama kegiatan atau pelaksana...',
                      hintStyle: GoogleFonts.figtree(color: const Color(0xFF94A3B8), fontSize: 14),
                      prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF94A3B8)),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear_rounded, color: Color(0xFF94A3B8)),
                              onPressed: () => _searchController.clear(),
                            )
                          : null,
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: const EdgeInsets.symmetric(vertical: 12),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFF33C8DA), width: 1.5),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Header List
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Daftar Kegiatan Pending Pencairan',
                        style: GoogleFonts.figtree(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF0F172A),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE0F7FA),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '${filteredItems.length} Kegiatan',
                          style: GoogleFonts.figtree(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF00ACC1),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // List view or empty state
                  if (filteredItems.isEmpty)
                    Container(
                      height: 250,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.receipt_long_rounded,
                            size: 64,
                            color: const Color(0xFF94A3B8).withOpacity(0.5),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _searchQuery.isNotEmpty
                                ? 'Tidak ada kegiatan pencarian cocok.'
                                : 'Semua kegiatan selesai dicairkan.',
                            style: GoogleFonts.figtree(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF64748B),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _searchQuery.isNotEmpty
                                ? 'Coba ganti kata kunci pencarian Anda'
                                : 'Daftar pencairan dana bendahara kosong',
                            style: GoogleFonts.figtree(
                              fontSize: 12,
                              color: const Color(0xFF94A3B8),
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    ...filteredItems.map((item) => _buildPencairanCard(context, item)),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildPencairanCard(BuildContext context, PencairanItem item) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title
            Text(
              item.namaKegiatan,
              style: GoogleFonts.figtree(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF0F172A),
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 12),

            // Chips
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _buildInfoChip(Icons.person_outline_rounded, 'Pelaksana: ${item.pelaksanaManual}'),
                _buildInfoChip(Icons.supervised_user_circle_outlined, 'PJ: ${item.penanggungJawabManual}'),
              ],
            ),

            // Wadir2 Note if present
            if (item.catatanWadir2 != null && item.catatanWadir2!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.amber.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.amber.shade200),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.assignment_late_outlined, size: 16, color: Colors.amber.shade800),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Catatan Wadir 2:',
                            style: GoogleFonts.figtree(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Colors.amber.shade900,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            item.catatanWadir2!,
                            style: GoogleFonts.figtree(
                              fontSize: 11,
                              color: Colors.amber.shade800,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 16),

            // Budget Info & Progress
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Progres Pencairan',
                  style: GoogleFonts.figtree(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF64748B),
                  ),
                ),
                Text(
                  '${item.disbursementPercent.toStringAsFixed(1)}%',
                  style: GoogleFonts.figtree(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF33C8DA),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: item.totalAnggaranDiusulkan > 0 ? (item.danaDicairkan / item.totalAnggaranDiusulkan) : 0,
                backgroundColor: const Color(0xFFF1F5F9),
                valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
                minHeight: 8,
              ),
            ),
            const SizedBox(height: 12),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Dana Dicairkan',
                      style: GoogleFonts.figtree(fontSize: 11, color: const Color(0xFF94A3B8)),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _formatCurrency(item.danaDicairkan),
                      style: GoogleFonts.figtree(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF0F172A),
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'Sisa Dana',
                      style: GoogleFonts.figtree(fontSize: 11, color: const Color(0xFF94A3B8)),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _formatCurrency(item.sisaDana),
                      style: GoogleFonts.figtree(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: item.sisaDana > 0 ? const Color(0xFF00ACC1) : const Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 16),
            const Divider(color: Color(0xFFE2E8F0), height: 1),
            const SizedBox(height: 12),

            // Actions Buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: item.isFullyDisbursed
                        ? null
                        : () => _showCairkanBottomSheet(context, item),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF33C8DA),
                      foregroundColor: Colors.white,
                      disabledBackgroundColor: const Color(0xFFCBD5E1),
                      disabledForegroundColor: const Color(0xFF94A3B8),
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: Text(
                      'Cairkan',
                      style: GoogleFonts.figtree(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _showSelesaiConfirmation(context, item),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF10B981),
                      side: const BorderSide(color: Color(0xFF10B981)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: Text(
                      'Selesai',
                      style: GoogleFonts.figtree(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: const Color(0xFF64748B)),
          const SizedBox(width: 6),
          Flexible(
            child: Text(
              label,
              style: GoogleFonts.figtree(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: const Color(0xFF64748B),
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  void _showCairkanBottomSheet(BuildContext context, PencairanItem item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (modalContext) {
        return _CairkanFormBottomSheet(
          item: item,
          onSuccess: (message) {
            Navigator.of(modalContext).pop();
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(message),
                backgroundColor: const Color(0xFF10B981),
              ),
            );
          },
          onError: (message) {
            ScaffoldMessenger.of(modalContext).showSnackBar(
              SnackBar(
                content: Text(message),
                backgroundColor: const Color(0xFFEF4444),
              ),
            );
          },
        );
      },
    );
  }

  void _showSelesaiConfirmation(BuildContext context, PencairanItem item) {
    showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text(
            'Selesaikan Pencairan?',
            style: GoogleFonts.figtree(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          content: Text(
            'Tindakan ini akan mengunci proses pencairan dan memulai tahap LPJ untuk kegiatan "${item.namaKegiatan}".',
            style: GoogleFonts.figtree(fontSize: 13, color: const Color(0xFF64748B)),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: Text(
                'Batal',
                style: GoogleFonts.figtree(
                  color: const Color(0xFF64748B),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.of(dialogContext).pop();
                final provider = context.read<PencairanProvider>();
                
                final success = await provider.selesaiPencairan(item.kegiatanId);
                if (success) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Proses pencairan berhasil diselesaikan.'),
                        backgroundColor: Color(0xFF10B981),
                      ),
                    );
                  }
                } else {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(provider.errorMessage ?? 'Gagal menyelesaikan pencairan.'),
                        backgroundColor: const Color(0xFFEF4444),
                      ),
                    );
                  }
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: Text(
                'Selesai',
                style: GoogleFonts.figtree(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _CairkanFormBottomSheet extends StatefulWidget {
  final PencairanItem item;
  final Function(String) onSuccess;
  final Function(String) onError;

  const _CairkanFormBottomSheet({
    required this.item,
    required this.onSuccess,
    required this.onError,
  });

  @override
  State<_CairkanFormBottomSheet> createState() => _CairkanFormBottomSheetState();
}

class _CairkanFormBottomSheetState extends State<_CairkanFormBottomSheet> {
  final TextEditingController _nominalController = TextEditingController();
  final TextEditingController _keteranganController = TextEditingController();
  
  double _nominalRaw = 0;
  String? _nominalError;
  bool _isConfirmEnabled = false;

  @override
  void initState() {
    super.initState();
    _nominalController.addListener(_onNominalChanged);
  }

  @override
  void dispose() {
    _nominalController.removeListener(_onNominalChanged);
    _nominalController.dispose();
    _keteranganController.dispose();
    super.dispose();
  }

  void _onNominalChanged() {
    final text = _nominalController.text;
    final digits = text.replaceAll(RegExp(r'[^0-9]'), '');
    
    if (digits.isEmpty) {
      setState(() {
        _nominalRaw = 0;
        _nominalError = null;
        _isConfirmEnabled = false;
      });
      return;
    }

    final double? parsedVal = double.tryParse(digits);
    if (parsedVal == null) return;

    // Apply formatting to display input as "Rp 1.000.000" or similar
    final formatted = NumberFormat("#,##0", "id_ID").format(parsedVal.toInt());
    
    if (formatted != text) {
      // Position cursor correctly at the end
      _nominalController.value = TextEditingValue(
        text: formatted,
        selection: TextSelection.collapsed(offset: formatted.length),
      );
    }

    setState(() {
      _nominalRaw = parsedVal;
      
      // Validation checks
      if (_nominalRaw <= 0) {
        _nominalError = 'Nominal harus lebih dari 0';
        _isConfirmEnabled = false;
      } else if (_nominalRaw > widget.item.sisaDana) {
        _nominalError = 'Nominal melebihi sisa dana (Rp ${NumberFormat("#,##0", "id_ID").format(widget.item.sisaDana)})';
        _isConfirmEnabled = false;
      } else {
        _nominalError = null;
        _isConfirmEnabled = true;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PencairanProvider>();

    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Cairkan Dana',
                style: GoogleFonts.figtree(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF0F172A),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded, color: Color(0xFF94A3B8)),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Masukkan nominal dana yang akan dicairkan untuk kegiatan ini.',
            style: GoogleFonts.figtree(
              fontSize: 12,
              color: const Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 16),
          
          // Sisa Dana info alert
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Sisa Dana Tersedia:',
                  style: GoogleFonts.figtree(fontSize: 12, color: const Color(0xFF64748B)),
                ),
                Text(
                  NumberFormat.currency(
                    locale: 'id_ID',
                    symbol: 'Rp ',
                    decimalDigits: 0,
                  ).format(widget.item.sisaDana),
                  style: GoogleFonts.figtree(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF00ACC1),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Nominal input
          Text(
            'Nominal Pencairan (Rp) *',
            style: GoogleFonts.figtree(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF475569),
            ),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _nominalController,
            keyboardType: TextInputType.number,
            autofocus: true,
            decoration: InputDecoration(
              hintText: 'Contoh: 1.000.000',
              hintStyle: GoogleFonts.figtree(color: const Color(0xFF94A3B8), fontSize: 14),
              prefixText: 'Rp ',
              prefixStyle: GoogleFonts.figtree(
                color: const Color(0xFF0F172A),
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
              errorText: _nominalError,
              errorStyle: GoogleFonts.figtree(color: const Color(0xFFEF4444), fontSize: 11),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: Color(0xFF33C8DA), width: 1.5),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: Color(0xFFEF4444)),
              ),
              focusedErrorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: Color(0xFFEF4444), width: 1.5),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Keterangan input
          Text(
            'Keterangan (Opsional)',
            style: GoogleFonts.figtree(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF475569),
            ),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _keteranganController,
            maxLength: 1000,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'Tulis keterangan pencairan...',
              hintStyle: GoogleFonts.figtree(color: const Color(0xFF94A3B8), fontSize: 14),
              contentPadding: const EdgeInsets.all(16),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: Color(0xFF33C8DA), width: 1.5),
              ),
              counterStyle: GoogleFonts.figtree(color: const Color(0xFF94A3B8), fontSize: 10),
            ),
          ),
          const SizedBox(height: 24),

          // Save / Cancel Actions
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: provider.isSubmitting ? null : () => Navigator.of(context).pop(),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF64748B),
                    side: const BorderSide(color: Color(0xFFE2E8F0)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: Text(
                    'Batal',
                    style: GoogleFonts.figtree(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: (!_isConfirmEnabled || provider.isSubmitting)
                      ? null
                      : () async {
                          final success = await context.read<PencairanProvider>().storePencairan(
                            kegiatanId: widget.item.kegiatanId,
                            nominal: _nominalRaw,
                            keterangan: _keteranganController.text,
                          );
                          if (success) {
                            widget.onSuccess('Berhasil mencatat pencairan dana.');
                          } else {
                            widget.onError(provider.errorMessage ?? 'Gagal menyimpan pencairan.');
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF33C8DA),
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: const Color(0xFFCBD5E1),
                    disabledForegroundColor: const Color(0xFF94A3B8),
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: provider.isSubmitting
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : Text(
                          'Cairkan',
                          style: GoogleFonts.figtree(fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
