import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../models/kak_model.dart';

class ManfaatItem {
  String id;
  String value;
  String? note;

  ManfaatItem({required this.id, required this.value});
}

class TahapanItem {
  String id;
  String nama;
  int urutan;
  String? note;

  TahapanItem({required this.id, required this.nama, required this.urutan});
}

class IndikatorKinerjaItem {
  String id;
  String bulanIndikator;
  String deskripsiTarget;
  double? persentaseTarget;
  String? note;

  IndikatorKinerjaItem({
    required this.id,
    required this.bulanIndikator,
    required this.deskripsiTarget,
    this.persentaseTarget,
    this.note,
  });
}

class TargetIkuItem {
  String id;
  int ikuId;
  String ikuNama;
  String target;
  int? satuanId;
  String? note;

  TargetIkuItem({
    required this.id,
    required this.ikuId,
    required this.ikuNama,
    required this.target,
    this.satuanId,
    this.note,
  });
}

class RabItem {
  String id;
  String uraian;
  double volume1;
  int? satuan1Id;
  double? volume2;
  int? satuan2Id;
  double? volume3;
  int? satuan3Id;
  double hargaSatuan;
  int kategoriBelanjaId;
  String? note;

  RabItem({
    required this.id,
    required this.uraian,
    required this.volume1,
    this.satuan1Id,
    this.volume2,
    this.satuan2Id,
    this.volume3,
    this.satuan3Id,
    required this.hargaSatuan,
    required this.kategoriBelanjaId,
    this.note,
  });

  double getTotal() {
    double v2 = volume2 ?? 1;
    double v3 = volume3 ?? 1;
    return volume1 * v2 * v3 * hargaSatuan;
  }
}

class KakCreateEditForm extends StatefulWidget {
  final KakDetail? initialData;
  final List<dynamic> tipeKegiatanOptions;
  final List<dynamic> ikuOptions;
  final List<dynamic> satuanOptions;
  final List<dynamic> kategoriBelanjaOptions;
  final bool readOnly;
  final VoidCallback onSubmit;
  final bool isLoading;
  final Function(Map<String, dynamic>) onFormChange;

  const KakCreateEditForm({
    super.key,
    this.initialData,
    required this.tipeKegiatanOptions,
    this.ikuOptions = const [],
    this.satuanOptions = const [],
    this.kategoriBelanjaOptions = const [],
    this.readOnly = false,
    required this.onSubmit,
    this.isLoading = false,
    required this.onFormChange,
  });

  @override
  State<KakCreateEditForm> createState() => KakCreateEditFormState();
}

class KakCreateEditFormState extends State<KakCreateEditForm> with SingleTickerProviderStateMixin {
  late TextEditingController namaController;
  late TextEditingController deskripsiController;
  late TextEditingController metodeController;
  late TextEditingController lokasiController;
  late TextEditingController sasaranController;
  late TextEditingController outputKegiatanController; // Added this
  late TabController _tabController;

  DateTime? tanggalMulai;
  DateTime? tanggalSelesai;
  DateTime? _initialTanggalMulai;
  DateTime? _initialTanggalSelesai;
  int? selectedTipeKegiatan;

  List<ManfaatItem> manfaatList = [];
  List<TahapanItem> tahapanList = [];
  List<IndikatorKinerjaItem> indikatorKinerjaList = [];
  List<TargetIkuItem> targetIkuList = [];
  List<RabItem> rabList = [];

  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    namaController = TextEditingController();
    deskripsiController = TextEditingController();
    metodeController = TextEditingController();
    lokasiController = TextEditingController();
    sasaranController = TextEditingController();
    outputKegiatanController = TextEditingController(); // Added this
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      setState(() {});
    });

    if (widget.initialData != null) {
      _initializeFromData(widget.initialData!);
    }
  }

  bool get showRevisionNotes =>
      widget.initialData?.statusId == 5 ||
      widget.initialData?.statusNama?.toLowerCase() == 'revisi' ||
      widget.initialData?.statusNama?.toLowerCase() == 'perlu revisi';

  void _initializeFromData(KakDetail data) {
    namaController.text = data.namaKegiatan;
    deskripsiController.text = data.deskripsiKegiatan;
    metodeController.text = data.metodePelaksanaan;
    lokasiController.text = data.lokasi;
    sasaranController.text = data.sasaranUtama;
    outputKegiatanController.text = data.outputKegiatan; // Added this

    tanggalMulai = DateTime.tryParse(data.tanggalMulai);
    tanggalSelesai = DateTime.tryParse(data.tanggalSelesai);
    _initialTanggalMulai = tanggalMulai;
    _initialTanggalSelesai = tanggalSelesai;
    selectedTipeKegiatan = data.tipeKegiatanId;
    if (selectedTipeKegiatan != null &&
        !widget.tipeKegiatanOptions.any(
          (option) => int.tryParse((option['tipe_kegiatan_id'] ?? option['id'] ?? '').toString()) == selectedTipeKegiatan,
        )) {
      selectedTipeKegiatan = null; // Reset if not found
    }

    manfaatList = data.manfaat
        .map((m) => ManfaatItem(id: m.manfaatId.toString(), value: m.manfaat))
        .toList();
    // carry over verifier notes
    for (int i = 0; i < manfaatList.length; i++) {
      if (i < data.manfaat.length) {
        manfaatList[i].note = data.manfaat[i].catatan;
      }
    }

    tahapanList = data.tahapan
        .map(
          (t) => TahapanItem(
            id: t.tahapanId.toString(),
            nama: t.namaTahapan,
            urutan: t.urutan,
          ),
        )
        .toList();
    for (int i = 0; i < tahapanList.length; i++) {
      if (i < data.tahapan.length) {
        tahapanList[i].note = data.tahapan[i].catatanVerifikator;
      }
    }

    rabList = data.rab
        .map(
          (r) => RabItem(
            id: r.anggaranId.toString(),
            uraian: r.uraian,
            volume1: r.volume1?.toDouble() ?? 0,
            satuan1Id:
                (r.satuan1Id != null &&
                    widget.satuanOptions.any(
                      (option) => int.tryParse((option['satuan_id'] ?? option['id'] ?? '').toString()) == r.satuan1Id,
                    ))
                ? r.satuan1Id
                : null,
            volume2: r.volume2?.toDouble(),
            satuan2Id:
                (r.satuan2Id != null &&
                    widget.satuanOptions.any(
                      (option) => int.tryParse((option['satuan_id'] ?? option['id'] ?? '').toString()) == r.satuan2Id,
                    ))
                ? r.satuan2Id
                : null,
            volume3: r.volume3?.toDouble(),
            satuan3Id:
                (r.satuan3Id != null &&
                    widget.satuanOptions.any(
                      (option) => int.tryParse((option['satuan_id'] ?? option['id'] ?? '').toString()) == r.satuan3Id,
                    ))
                ? r.satuan3Id
                : null,
            hargaSatuan: r.hargaSatuan?.toDouble() ?? 0,
            kategoriBelanjaId: r.kategoriBelanjaId,
          ),
        )
        .toList();
    for (int i = 0; i < rabList.length; i++) {
      if (i < data.rab.length) {
        rabList[i].note = data.rab[i].catatanVerifikator;
      }
    }

    indikatorKinerjaList = data.indikatorKinerja
        .map(
          (i) => IndikatorKinerjaItem(
            id: i.targetId.toString(),
            bulanIndikator: i.bulanIndikator,
            deskripsiTarget: i.deskripsiTarget,
            persentaseTarget: i.persentaseTarget,
            note: i.catatanVerifikator,
          ),
        )
        .toList();
    for (int i = 0; i < indikatorKinerjaList.length; i++) {
      // already set note via mapping above
    }
    // targetIku mapping
    targetIkuList = data.targetIku
        .map(
          (t) => TargetIkuItem(
            id: t.ikuId.toString(),
            ikuId:
                (int.tryParse(t.ikuId) != null &&
                    widget.ikuOptions.any(
                      (option) =>
                          int.tryParse((option['iku_id'] ?? option['id'] ?? '').toString()) == int.tryParse(t.ikuId),
                    ))
                ? int.tryParse(t.ikuId)!
                : 0,
            ikuNama: t.ikuNama,
            target: t.target.toString(),
            satuanId:
                (t.satuanId != null &&
                    widget.satuanOptions.any(
                      (option) =>
                          int.tryParse((option['satuan_id'] ?? option['id'] ?? '').toString()) ==
                          int.tryParse(t.satuanId ?? ''),
                    ))
                ? int.tryParse(t.satuanId ?? '')
                : null,
            note: t.catatanVerifikator,
          ),
        )
        .toList();
  }

  Map<String, dynamic> getFormData() {
    return {
      'nama_kegiatan': namaController.text,
      'deskripsi_kegiatan': deskripsiController.text,
      'metode_pelaksanaan': metodeController.text,
      'lokasi': lokasiController.text,
      'sasaran_utama': sasaranController.text,
      'output_kegiatan': outputKegiatanController.text, // Added this
      'tanggal_mulai': tanggalMulai?.toIso8601String().split('T')[0] ?? '',
      'tanggal_selesai': tanggalSelesai?.toIso8601String().split('T')[0] ?? '',
      'tipe_kegiatan_id': selectedTipeKegiatan ?? '',
      'manfaat': manfaatList
          .map((m) {
            final map = <String, dynamic>{'value': m.value};
            if (!m.id.startsWith('new_')) {
              map['manfaat_id'] = m.id;
            }
            return map;
          })
          .toList(),
      'tahapan_pelaksanaan': tahapanList
          .map((t) {
            final map = <String, dynamic>{'nama_tahapan': t.nama};
            if (!t.id.startsWith('new_')) {
              map['tahapan_id'] = t.id;
            }
            return map;
          })
          .toList(),
      'indikator_kinerja': indikatorKinerjaList
          .map(
            (i) {
              final map = <String, dynamic>{
                'bulan_indikator': i.bulanIndikator,
                'deskripsi_target': i.deskripsiTarget,
                'persentase_target': i.persentaseTarget,
              };
              if (!i.id.startsWith('new_')) {
                map['target_id'] = i.id;
              }
              return map;
            },
          )
          .toList(),
      'rab': rabList
          .map(
            (r) {
              final map = <String, dynamic>{
                'uraian': r.uraian,
                'volume1': r.volume1,
                'satuan1_id': r.satuan1Id,
                'volume2': r.volume2,
                'satuan2_id': r.satuan2Id,
                'volume3': r.volume3,
                'satuan3_id': r.satuan3Id,
                'harga_satuan': r.hargaSatuan,
                'kategori_belanja_id': r.kategoriBelanjaId,
              };
              if (!r.id.startsWith('new_')) {
                map['anggaran_id'] = r.id;
              }
              return map;
            },
          )
          .toList(),
      'target_iku': targetIkuList
          .map(
            (t) => {
              'iku_id': t.ikuId,
              'target': t.target,
              'satuan_id': t.satuanId,
            },
          )
          .toList(),
    };
  }

  void _addManfaat() {
    setState(() {
      manfaatList.add(
        ManfaatItem(
          id: 'new_${DateTime.now().millisecondsSinceEpoch}',
          value: '',
        ),
      );
    });
  }

  void _removeManfaat(int index) {
    setState(() {
      manfaatList.removeAt(index);
    });
  }

  void _addTahapan() {
    setState(() {
      tahapanList.add(
        TahapanItem(
          id: 'new_${DateTime.now().millisecondsSinceEpoch}',
          nama: '',
          urutan: tahapanList.length + 1,
        ),
      );
    });
  }

  void _removeTahapan(int index) {
    setState(() {
      tahapanList.removeAt(index);
      // Re-order
      for (int i = 0; i < tahapanList.length; i++) {
        tahapanList[i].urutan = i + 1;
      }
    });
  }

  void _addIndikatorKinerja() {
    setState(() {
      indikatorKinerjaList.add(
        IndikatorKinerjaItem(
          id: 'new_${DateTime.now().millisecondsSinceEpoch}',
          bulanIndikator: '',
          deskripsiTarget: '',
          persentaseTarget: null,
        ),
      );
    });
  }

  void _removeIndikatorKinerja(int index) {
    setState(() {
      indikatorKinerjaList.removeAt(index);
    });
  }

  void _addTargetIku() {
    setState(() {
      targetIkuList.add(
        TargetIkuItem(
          id: 'new_${DateTime.now().millisecondsSinceEpoch}',
          ikuId: 0,
          ikuNama: '',
          target: '',
        ),
      );
    });
  }

  void _removeTargetIku(int index) {
    setState(() {
      targetIkuList.removeAt(index);
    });
  }

  void _addRab(int kategoriId) {
    setState(() {
      rabList.add(
        RabItem(
          id: 'new_${DateTime.now().millisecondsSinceEpoch}',
          uraian: '',
          volume1: 1,
          hargaSatuan: 0,
          kategoriBelanjaId: kategoriId,
        ),
      );
    });
  }

  void _removeRab(int index) {
    setState(() {
      rabList.removeAt(index);
    });
  }

  Future<void> _selectDate(BuildContext context, bool isStartDate, FormFieldState<DateTime> state) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: isStartDate
          ? (tanggalMulai ?? DateTime.now())
          : (tanggalSelesai ?? DateTime.now()),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );
    if (picked != null) {
      setState(() {
        if (isStartDate) {
          tanggalMulai = picked;
        } else {
          tanggalSelesai = picked;
        }
        state.didChange(picked);
        widget.onFormChange(getFormData());
      });
    }
  }

  Widget _buildSatuanDropdown({
    required String label,
    required int? value,
    required ValueChanged<int?> onChanged,
    String? Function(int?)? validator,
  }) {
    return DropdownButtonFormField<int?>(
      isExpanded: true,
      value: widget.satuanOptions.any((s) => int.tryParse((s['satuan_id'] ?? s['id'] ?? '').toString()) == value)
          ? value
          : null,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: Colors.white,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        border:
            OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFCBD5E1), width: 1.2),
        ),
      ),
      items: [
        const DropdownMenuItem<int?>(
          value: null,
          child: Text('Satuan'),
        ),
        ...widget.satuanOptions
            .where((o) => int.tryParse((o['satuan_id'] ?? o['id'] ?? '').toString()) != null)
            .map<DropdownMenuItem<int?>>((o) => DropdownMenuItem<int?>(
                  value: int.tryParse((o['satuan_id'] ?? o['id'] ?? '').toString()),
                  child: Text((o['nama_satuan'] ?? o['nama'] ?? '').toString()),
                )),
      ],
      onChanged: widget.readOnly ? null : onChanged,
      validator: validator,
    );
  }

  // ─── helpers ─────────────────────────────────────────────────────────────
  Widget _sectionCard({
    required IconData icon,
    required String title,
    required List<Widget> children,
    Color iconColor = const Color(0xFF33C8DA),
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: iconColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, size: 17, color: iconColor),
                ),
                const SizedBox(width: 10),
                Text(
                  title,
                  style: GoogleFonts.figtree(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: children,
            ),
          ),
        ],
      ),
    );
  }

  Widget _addItemButton({
    required String label,
    required VoidCallback onPressed,
    IconData icon = Icons.add_circle_outline,
  }) {
    return OutlinedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 16),
      label: Text(label, style: GoogleFonts.figtree(fontSize: 13)),
      style: OutlinedButton.styleFrom(
        foregroundColor: const Color(0xFF33C8DA),
        side: const BorderSide(color: Color(0xFF33C8DA), width: 1.2),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  // ─── helper for revision notes ───────────────────────────────────────────
  Widget _buildNoteDisplay(String? note) {
    if (!showRevisionNotes || note == null || note.isEmpty) {
      return const SizedBox.shrink();
    }
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7ED), // Light orange background
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFFFCC80)), // Orange border
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.info_outline,
            color: Color(0xFFE65100), // Dark orange icon
            size: 18,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Catatan Verifikator: $note',
              style: GoogleFonts.figtree(
                fontSize: 12,
                color: const Color(0xFFE65100), // Dark orange text
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Tab 1: Kerangka Acuan Kerja ─────────────────────────────────────────
  Widget _buildKerangkaAcuanKerjaForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Informasi Dasar ──────────────────────────────────────────────
          _sectionCard(
            icon: Icons.info_outline,
            title: 'Informasi Dasar',
            children: [
              TextFormField(
                controller: namaController,
                decoration: const InputDecoration(
                  labelText: 'Nama Kegiatan',
                  prefixIcon: Icon(Icons.event_note_outlined, size: 20),
                ),
                readOnly: widget.readOnly,
                validator: (v) =>
                    (v == null || v.isEmpty) ? 'Nama kegiatan wajib diisi' : null,
              ),
              _buildNoteDisplay(widget.initialData?.catatanNamaKegiatan),
              const SizedBox(height: 14),
              DropdownButtonFormField<int?>(
                value: widget.tipeKegiatanOptions.any((o) => int.tryParse((o['tipe_kegiatan_id'] ?? o['id'] ?? '').toString()) == selectedTipeKegiatan)
                    ? selectedTipeKegiatan
                    : null,
                isExpanded: true,
                decoration: const InputDecoration(
                  labelText: 'Tipe Kegiatan',
                  prefixIcon: const Icon(Icons.category_outlined, size: 20),
                ),
                items: [
                  const DropdownMenuItem<int?>(
                    value: null,
                    child: Text('Pilih Tipe Kegiatan'),
                  ),
                  ...widget.tipeKegiatanOptions
                      .where((o) => int.tryParse((o['tipe_kegiatan_id'] ?? o['id'] ?? '').toString()) != null)
                      .map<DropdownMenuItem<int?>>((o) => DropdownMenuItem<int?>(
                            value: int.tryParse((o['tipe_kegiatan_id'] ?? o['id'] ?? '').toString()),
                            child: Text(
                              (o['nama_tipe'] ?? o['nama'] ?? '').toString(),
                              overflow: TextOverflow.ellipsis,
                            ),
                          )),
                ],
                onChanged: widget.readOnly
                    ? null
                    : (v) => setState(() => selectedTipeKegiatan = v),
                validator: (v) =>
                    (v == null) ? 'Tipe kegiatan wajib dipilih' : null,
              ),
              _buildNoteDisplay(widget.initialData?.catatanTipeKegiatan),
            ],
          ),

          // ── Kurun Waktu ──────────────────────────────────────────────────
          _sectionCard(
            icon: Icons.calendar_today_outlined,
            title: 'Kurun Waktu Pelaksanaan',
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: FormField<DateTime>(
                      initialValue: tanggalMulai,
                      validator: (val) {
                        if (tanggalMulai == null) {
                          return 'Wajib diisi';
                        }
                        final today = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
                        final isNew = widget.initialData == null;
                        final dateChanged = tanggalMulai != _initialTanggalMulai;
                        if ((isNew || dateChanged) && tanggalMulai!.isBefore(today)) {
                          return 'Tidak boleh sebelum hari ini';
                        }
                        return null;
                      },
                      builder: (FormFieldState<DateTime> state) {
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            InkWell(
                              onTap: widget.readOnly
                                  ? null
                                  : () => _selectDate(context, true, state),
                              borderRadius: BorderRadius.circular(10),
                              child: InputDecorator(
                                decoration: InputDecoration(
                                  labelText: 'Tanggal Mulai',
                                  errorText: state.errorText,
                                  prefixIcon: const Icon(
                                    Icons.calendar_month_outlined,
                                    size: 20,
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                        color: Color(0xFFCBD5E1), width: 1.2),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                        color: Color(0xFFCBD5E1), width: 1.2),
                                  ),
                                ),
                                child: Text(
                                  tanggalMulai == null
                                      ? 'Pilih Tanggal'
                                      : DateFormat('dd/MM/yyyy').format(tanggalMulai!),
                                  style: GoogleFonts.figtree(
                                    fontSize: 14,
                                    color: tanggalMulai == null
                                        ? const Color(0xFF94A3B8)
                                        : const Color(0xFF0F172A),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: FormField<DateTime>(
                      initialValue: tanggalSelesai,
                      validator: (val) {
                        if (tanggalSelesai == null) {
                          return 'Wajib diisi';
                        }
                        if (tanggalMulai != null && tanggalSelesai!.isBefore(tanggalMulai!)) {
                          return 'Tidak boleh sebelum tanggal mulai';
                        }
                        return null;
                      },
                      builder: (FormFieldState<DateTime> state) {
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            InkWell(
                              onTap: widget.readOnly
                                  ? null
                                  : () => _selectDate(context, false, state),
                              borderRadius: BorderRadius.circular(10),
                              child: InputDecorator(
                                decoration: InputDecoration(
                                  labelText: 'Tanggal Selesai',
                                  errorText: state.errorText,
                                  prefixIcon: const Icon(
                                    Icons.calendar_month_outlined,
                                    size: 20,
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                        color: Color(0xFFCBD5E1), width: 1.2),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                        color: Color(0xFFCBD5E1), width: 1.2),
                                  ),
                                ),
                                child: Text(
                                  tanggalSelesai == null
                                      ? 'Pilih Tanggal'
                                      : DateFormat('dd/MM/yyyy').format(tanggalSelesai!),
                                  style: GoogleFonts.figtree(
                                    fontSize: 14,
                                    color: tanggalSelesai == null
                                        ? const Color(0xFF94A3B8)
                                        : const Color(0xFF0F172A),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                ],
              ),
              _buildNoteDisplay(widget.initialData?.catatanTanggal),
              const SizedBox(height: 14),
              TextFormField(
                controller: lokasiController,
                decoration: const InputDecoration(
                  labelText: 'Lokasi Pelaksanaan',
                  prefixIcon: Icon(Icons.location_on_outlined, size: 20),
                ),
                readOnly: widget.readOnly,
                onChanged: (_) => widget.onFormChange(getFormData()),
                validator: (v) =>
                    (v == null || v.isEmpty) ? 'Lokasi wajib diisi' : null,
              ),
              _buildNoteDisplay(widget.initialData?.catatanLokasi),
            ],
          ),

          // ── Deskripsi & Metode ───────────────────────────────────────────
          _sectionCard(
            icon: Icons.description_outlined,
            title: 'Detail Kegiatan',
            children: [
              TextFormField(
                controller: deskripsiController,
                decoration: const InputDecoration(
                  labelText: 'Gambaran Umum Kegiatan',
                  alignLabelWithHint: true,
                  prefixIcon: Padding(
                    padding: EdgeInsets.only(bottom: 52),
                    child: Icon(Icons.article_outlined, size: 20),
                  ),
                ),
                maxLines: 4,
                readOnly: widget.readOnly,
                validator: (v) => (v == null || v.isEmpty)
                    ? 'Gambaran umum wajib diisi'
                    : null,
              ),
              _buildNoteDisplay(widget.initialData?.catatanDeskripsiKegiatan),
              const SizedBox(height: 14),
              TextFormField(
                controller: sasaranController,
                decoration: const InputDecoration(
                  labelText: 'Sasaran Utama',
                  alignLabelWithHint: true,
                  prefixIcon: Padding(
                    padding: EdgeInsets.only(bottom: 24),
                    child: Icon(Icons.track_changes_outlined, size: 20),
                  ),
                ),
                maxLines: 2,
                readOnly: widget.readOnly,
                validator: (v) =>
                    (v == null || v.isEmpty) ? 'Sasaran utama wajib diisi' : null,
              ),
              _buildNoteDisplay(widget.initialData?.catatanSasaranUtama),
              const SizedBox(height: 14),
              TextFormField(
                controller: outputKegiatanController,
                decoration: const InputDecoration(
                  labelText: 'Output Kegiatan',
                  alignLabelWithHint: true,
                  prefixIcon: Padding(
                    padding: EdgeInsets.only(bottom: 24),
                    child: Icon(Icons.output_outlined, size: 20),
                  ),
                ),
                maxLines: 2,
                readOnly: widget.readOnly,
                validator: (v) => (v == null || v.isEmpty)
                    ? 'Output kegiatan wajib diisi'
                    : null,
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: metodeController,
                decoration: const InputDecoration(
                  labelText: 'Metode Pelaksanaan',
                  alignLabelWithHint: true,
                  prefixIcon: Padding(
                    padding: EdgeInsets.only(bottom: 24),
                    child: Icon(Icons.schema_outlined, size: 20),
                  ),
                ),
                maxLines: 2,
                readOnly: widget.readOnly,
                validator: (v) => (v == null || v.isEmpty)
                    ? 'Metode pelaksanaan wajib diisi'
                    : null,
              ),
              _buildNoteDisplay(widget.initialData?.catatanMetodePelaksanaan),
            ],
          ),

          // ── Manfaat ──────────────────────────────────────────────────────
          _sectionCard(
            icon: Icons.volunteer_activism_outlined,
            title: 'Output/Manfaat Kegiatan',
            children: [
              if (manfaatList.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Text(
                    'Belum ada manfaat. Klik tombol di bawah untuk menambahkan.',
                    style: GoogleFonts.figtree(
                      fontSize: 13,
                      color: const Color(0xFF94A3B8),
                    ),
                  ),
                ),
              ...manfaatList.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: const Color(0xFF33C8DA).withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(7),
                            ),
                            child: Center(
                              child: Text(
                                '${index + 1}',
                                style: GoogleFonts.figtree(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF33C8DA),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: TextFormField(
                              initialValue: item.value,
                              decoration: InputDecoration(
                                labelText: 'Manfaat ${index + 1}',
                              ),
                              readOnly: widget.readOnly,
                              onChanged: (v) {
                                item.value = v;
                                widget.onFormChange(getFormData());
                              },
                              validator: (v) => (v == null || v.isEmpty)
                                  ? 'Manfaat tidak boleh kosong'
                                  : null,
                            ),
                          ),
                          if (!widget.readOnly)
                            IconButton(
                              icon: const Icon(
                                Icons.delete_outline,
                                color: Color(0xFFEF4444),
                                size: 20,
                              ),
                              onPressed: () => _removeManfaat(index),
                            ),
                        ],
                      ),
                    ),
                    _buildNoteDisplay(item.note),
                  ],
                );
              }),
              if (!widget.readOnly) ...[
                const SizedBox(height: 4),
                _addItemButton(
                  label: 'Tambah Manfaat',
                  onPressed: _addManfaat,
                ),
              ],
            ],
          ),

          // ── Tahapan ──────────────────────────────────────────────────────
          _sectionCard(
            icon: Icons.format_list_numbered_outlined,
            title: 'Tahapan Kegiatan',
            children: [
              if (tahapanList.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Text(
                    'Belum ada tahapan. Klik tombol di bawah untuk menambahkan.',
                    style: GoogleFonts.figtree(
                      fontSize: 13,
                      color: const Color(0xFF94A3B8),
                    ),
                  ),
                ),
              ...tahapanList.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: const Color(0xFF33C8DA).withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(7),
                            ),
                            child: Center(
                              child: Text(
                                '${index + 1}',
                                style: GoogleFonts.figtree(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF33C8DA),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: TextFormField(
                              initialValue: item.nama,
                              decoration: InputDecoration(
                                labelText: 'Tahapan ${index + 1}',
                              ),
                              readOnly: widget.readOnly,
                              onChanged: (v) {
                                item.nama = v;
                                widget.onFormChange(getFormData());
                              },
                              validator: (v) => (v == null || v.isEmpty)
                                  ? 'Tahapan tidak boleh kosong'
                                  : null,
                            ),
                          ),
                          if (!widget.readOnly)
                            IconButton(
                              icon: const Icon(
                                Icons.delete_outline,
                                color: Color(0xFFEF4444),
                                size: 20,
                              ),
                              onPressed: () => _removeTahapan(index),
                            ),
                        ],
                      ),
                    ),
                    _buildNoteDisplay(item.note),
                  ],
                );
              }),
              if (!widget.readOnly) ...[
                const SizedBox(height: 4),
                _addItemButton(
                  label: 'Tambah Tahapan',
                  onPressed: _addTahapan,
                  icon: Icons.playlist_add_outlined,
                ),
              ],
            ],
          ),

          // ── Indikator Kinerja ─────────────────────────────────────────────
          _sectionCard(
            icon: Icons.trending_up_outlined,
            title: 'Indikator Kinerja',
            children: [
              if (indikatorKinerjaList.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Text(
                    'Belum ada indikator. Klik tombol di bawah untuk menambahkan.',
                    style: GoogleFonts.figtree(
                      fontSize: 13,
                      color: const Color(0xFF94A3B8),
                    ),
                  ),
                ),
              ...indikatorKinerjaList.asMap().entries.map((entry) {
                final index = entry.key;
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0FDFF),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: const Color(0xFF33C8DA).withValues(alpha: 0.25),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Indikator ${index + 1}',
                            style: GoogleFonts.figtree(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF2BA9B8),
                            ),
                          ),
                          const Spacer(),
                          if (!widget.readOnly)
                            InkWell(
                              onTap: () => _removeIndikatorKinerja(index),
                              borderRadius: BorderRadius.circular(6),
                              child: const Icon(
                                Icons.delete_outline,
                                color: Color(0xFFEF4444),
                                size: 20,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      DropdownButtonFormField<String?>(
                        isExpanded: true,
                        value: const [
                          'Januari',
                          'Februari',
                          'Maret',
                          'April',
                          'Mei',
                          'Juni',
                          'Juli',
                          'Agustus',
                          'September',
                          'Oktober',
                          'November',
                          'Desember'
                        ].contains(indikatorKinerjaList[index].bulanIndikator)
                            ? indikatorKinerjaList[index].bulanIndikator
                            : null,
                        decoration: const InputDecoration(
                          labelText: 'Bulan Indikator',
                          prefixIcon:
                              Icon(Icons.calendar_view_month_outlined, size: 18),
                        ),
                        items: [
                          const DropdownMenuItem<String?>(
                            value: null,
                            child: Text('Pilih Bulan'),
                          ),
                          ...[
                            'Januari',
                            'Februari',
                            'Maret',
                            'April',
                            'Mei',
                            'Juni',
                            'Juli',
                            'Agustus',
                            'September',
                            'Oktober',
                            'November',
                            'Desember'
                          ].map((month) => DropdownMenuItem<String?>(
                                value: month,
                                child: Text(month),
                              )),
                        ],
                        onChanged: widget.readOnly
                            ? null
                            : (v) {
                                setState(() {
                                  indikatorKinerjaList[index].bulanIndikator = v ?? '';
                                  widget.onFormChange(getFormData());
                                });
                              },
                        validator: (v) => (v == null || v.isEmpty)
                            ? 'Bulan indikator wajib diisi'
                            : null,
                      ),
                      const SizedBox(height: 10),
                      TextFormField(
                        initialValue:
                            indikatorKinerjaList[index].deskripsiTarget,
                        decoration: const InputDecoration(
                          labelText: 'Deskripsi Target',
                          prefixIcon:
                              Icon(Icons.subject_outlined, size: 18),
                        ),
                        readOnly: widget.readOnly,
                        onChanged: (v) {
                          indikatorKinerjaList[index].deskripsiTarget = v;
                          widget.onFormChange(getFormData());
                        },
                        validator: (v) => (v == null || v.isEmpty)
                            ? 'Deskripsi target wajib diisi'
                            : null,
                      ),
                      const SizedBox(height: 10),
                      TextFormField(
                        initialValue: indikatorKinerjaList[index].persentaseTarget
                            ?.toString(),
                        decoration: const InputDecoration(
                          labelText: 'Persentase Target (%)',
                          prefixIcon: Icon(Icons.percent_outlined, size: 18),
                        ),
                        keyboardType: TextInputType.number,
                        readOnly: widget.readOnly,
                        onChanged: (v) {
                          indikatorKinerjaList[index].persentaseTarget =
                              double.tryParse(v);
                          widget.onFormChange(getFormData());
                        },
                        validator: (v) {
                          if (v == null || v.isEmpty) {
                            return 'Persentase target wajib diisi';
                          }
                          if (double.tryParse(v) == null) return 'Harus angka';
                          return null;
                        },
                      ),
                      _buildNoteDisplay(indikatorKinerjaList[index].note),
                    ],
                  ),
                );
              }),
              if (!widget.readOnly) ...[
                const SizedBox(height: 4),
                _addItemButton(
                  label: 'Tambah Indikator Kinerja',
                  onPressed: _addIndikatorKinerja,
                  icon: Icons.add_chart_outlined,
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  // ─── Tab 2: Indikator Kinerja Utama ──────────────────────────────────────
  Widget _buildIndikatorKinerjaUtamaForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionCard(
            icon: Icons.flag_outlined,
            title: 'Target IKU',
            children: [
              if (targetIkuList.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Text(
                    'Belum ada target IKU. Klik tombol di bawah untuk menambahkan.',
                    style: GoogleFonts.figtree(
                      fontSize: 13,
                      color: const Color(0xFF94A3B8),
                    ),
                  ),
                ),
              ...targetIkuList.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0FDFF),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFF33C8DA).withValues(alpha: 0.25),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF33C8DA),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              'Target IKU ${index + 1}',
                              style: GoogleFonts.figtree(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          const Spacer(),
                          if (!widget.readOnly)
                            InkWell(
                              onTap: () => _removeTargetIku(index),
                              borderRadius: BorderRadius.circular(6),
                              child: const Icon(
                                Icons.delete_outline,
                                color: Color(0xFFEF4444),
                                size: 20,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<int?>(
                        isExpanded: true,
                        value: widget.ikuOptions.any((iku) => (iku['iku_id'] ?? iku['id']) == item.ikuId) && item.ikuId != 0
                            ? item.ikuId
                            : null,
                        decoration: const InputDecoration(
                          labelText: 'Pilih IKU',
                          prefixIcon: Icon(Icons.flag_circle_outlined, size: 20),
                          filled: true,
                          fillColor: Colors.white,
                        ),
                        items: [
                          const DropdownMenuItem<int?>(
                            value: null,
                            child: Text('Pilih IKU'),
                          ),
                          ...widget.ikuOptions.map<DropdownMenuItem<int?>>((iku) {
                            final ikuId = (iku['iku_id'] ?? iku['id']) as int?;
                            return DropdownMenuItem<int?>(
                              value: ikuId,
                              child: Text(
                                '${iku['kode_iku'] ?? ''} - ${iku['nama_iku'] ?? ''}',
                                overflow: TextOverflow.ellipsis,
                              ),
                            );
                          }),
                        ],
                        onChanged: widget.readOnly
                            ? null
                            : (value) {
                                setState(() {
                                  targetIkuList[index].ikuId = value ?? 0;
                                  if (value != null) {
                                    final found = widget.ikuOptions
                                        .where((e) =>
                                            (e['iku_id'] ?? e['id']) == value)
                                        .toList();
                                    targetIkuList[index].ikuNama = found.isNotEmpty
                                        ? (found.first['nama_iku'] ?? '')
                                        : '';
                                  } else {
                                    targetIkuList[index].ikuNama = '';
                                  }
                                  widget.onFormChange(getFormData());
                                });
                              },
                        validator: (v) =>
                            (v == null || v == 0) ? 'IKU wajib dipilih' : null,
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              initialValue: item.target,
                              decoration: const InputDecoration(
                                labelText: 'Target Capaian',
                                prefixIcon: Icon(Icons.numbers, size: 18),
                                filled: true,
                                fillColor: Colors.white,
                              ),
                              keyboardType: TextInputType.number,
                              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                              readOnly: widget.readOnly,
                              onChanged: (v) {
                                targetIkuList[index].target = v;
                                widget.onFormChange(getFormData());
                              },
                              validator: (v) {
                                if (v == null || v.isEmpty) {
                                  return 'Target wajib diisi';
                                }
                                if (int.tryParse(v) == null) {
                                  return 'Harus angka';
                                }
                                return null;
                              },
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: DropdownButtonFormField<int?>(
                              isExpanded: true,
                              value: widget.satuanOptions.any((s) => int.tryParse((s['satuan_id'] ?? s['id'] ?? '').toString()) == item.satuanId)
                                  ? item.satuanId
                                  : null,
                              decoration: const InputDecoration(
                                labelText: 'Satuan',
                                prefixIcon:
                                    Icon(Icons.straighten_outlined, size: 18),
                                filled: true,
                                fillColor: Colors.white,
                              ),
                              items: [
                                const DropdownMenuItem<int?>(
                                  value: null,
                                  child: Text('Pilih Satuan'),
                                ),
                                ...widget.satuanOptions
                                    .where((o) => int.tryParse((o['satuan_id'] ?? o['id'] ?? '').toString()) != null)
                                    .map<DropdownMenuItem<int?>>((o) =>
                                        DropdownMenuItem<int?>(
                                          value: int.tryParse((o['satuan_id'] ?? o['id'] ?? '').toString()),
                                          child: Text((o['nama_satuan'] ?? o['nama'] ?? '').toString()),
                                        )),
                              ],
                              onChanged: widget.readOnly
                                  ? null
                                  : (v) => setState(() {
                                        targetIkuList[index].satuanId = v;
                                        widget.onFormChange(getFormData());
                                      }),
                            ),
                          ),
                        ],
                      ),
                      _buildNoteDisplay(item.note),
                    ],
                  ),
                );
              }),
              if (!widget.readOnly) ...[
                const SizedBox(height: 4),
                _addItemButton(
                  label: 'Tambah Target IKU',
                  onPressed: _addTargetIku,
                  icon: Icons.add_task_outlined,
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  // ─── Tab 3: Rencana Anggaran Biaya ────────────────────────────────────────
  Widget _buildRencanaAnggaranBiayaForm() {
    final currencyFmt =
        NumberFormat.currency(locale: 'id', symbol: 'Rp ', decimalDigits: 0);
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ...widget.kategoriBelanjaOptions.map<Widget>((kategori) {
            final int kategoriId = (kategori['kategori_belanja_id'] ?? kategori['id']) ?? 0;
            final String kategoriNama = (kategori['nama'] ?? kategori['nama_kategori'] ?? 'Unknown').toString();
            final List<RabItem> items =
                rabList.where((r) => r.kategoriBelanjaId == kategoriId).toList();

            return _sectionCard(
              icon: Icons.account_balance_wallet_outlined,
              title: kategoriNama,
              children: [
                if (items.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Text(
                      'Belum ada item RAB untuk kategori ini.',
                      style: GoogleFonts.figtree(
                        fontSize: 13,
                        color: const Color(0xFF94A3B8),
                      ),
                    ),
                  ),
                ...items.asMap().entries.map((entry) {
                  final index = entry.key;
                  final rabItem = entry.value;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: const Color(0xFFE2E8F0),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              'Item ${index + 1}',
                              style: GoogleFonts.figtree(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF2BA9B8),
                              ),
                            ),
                            const Spacer(),
                            if (!widget.readOnly)
                              InkWell(
                                onTap: () => setState(() {
                                  rabList.removeWhere((e) => e.id == rabItem.id);
                                  widget.onFormChange(getFormData());
                                }),
                                child: const Icon(
                                  Icons.delete_outline,
                                  color: Color(0xFFEF4444),
                                  size: 18,
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        TextFormField(
                          initialValue: rabItem.uraian,
                          decoration: const InputDecoration(
                            labelText: 'Uraian',
                            prefixIcon: Icon(Icons.receipt_long_outlined, size: 18),
                            filled: true,
                            fillColor: Colors.white,
                          ),
                          readOnly: widget.readOnly,
                          onChanged: (v) {
                            rabItem.uraian = v;
                            widget.onFormChange(getFormData());
                          },
                          validator: (v) => (v == null || v.isEmpty)
                              ? 'Uraian tidak boleh kosong'
                              : null,
                        ),
                        const SizedBox(height: 8),
                        // Volume 1 + Satuan 1
                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                initialValue: rabItem.volume1.toString(),
                                decoration: const InputDecoration(
                                  labelText: 'Vol 1',
                                  filled: true,
                                  fillColor: Colors.white,
                                ),
                                keyboardType: TextInputType.number,
                                readOnly: widget.readOnly,
                                onChanged: (v) {
                                  rabItem.volume1 = double.tryParse(v) ?? 0;
                                  widget.onFormChange(getFormData());
                                },
                                validator: (v) =>
                                    (v == null || double.tryParse(v) == null)
                                        ? 'Wajib angka'
                                        : null,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _buildSatuanDropdown(
                                label: 'Satuan 1',
                                value: rabItem.satuan1Id,
                                onChanged: (v) => setState(() {
                                  rabItem.satuan1Id = v;
                                  widget.onFormChange(getFormData());
                                }),
                                validator: (v) => v == null ? 'Satuan 1 wajib diisi' : null,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        // Volume 2 + Satuan 2
                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                initialValue: rabItem.volume2?.toString() ?? '',
                                decoration: const InputDecoration(
                                  labelText: 'Vol 2 (opsional)',
                                  filled: true,
                                  fillColor: Colors.white,
                                ),
                                keyboardType: TextInputType.number,
                                readOnly: widget.readOnly,
                                onChanged: (v) {
                                  rabItem.volume2 = double.tryParse(v);
                                  widget.onFormChange(getFormData());
                                },
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _buildSatuanDropdown(
                                label: 'Satuan 2',
                                value: rabItem.satuan2Id,
                                onChanged: (v) => setState(() {
                                  rabItem.satuan2Id = v;
                                  widget.onFormChange(getFormData());
                                }),
                                validator: (v) {
                                  if (rabItem.volume2 != null && rabItem.volume2! > 0 && v == null) {
                                    return 'Satuan 2 wajib diisi';
                                  }
                                  return null;
                                },
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        // Volume 3 + Satuan 3
                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                initialValue: rabItem.volume3?.toString() ?? '',
                                decoration: const InputDecoration(
                                  labelText: 'Vol 3 (opsional)',
                                  filled: true,
                                  fillColor: Colors.white,
                                ),
                                keyboardType: TextInputType.number,
                                readOnly: widget.readOnly,
                                onChanged: (v) {
                                  rabItem.volume3 = double.tryParse(v);
                                  widget.onFormChange(getFormData());
                                },
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _buildSatuanDropdown(
                                label: 'Satuan 3',
                                value: rabItem.satuan3Id,
                                onChanged: (v) => setState(() {
                                  rabItem.satuan3Id = v;
                                  widget.onFormChange(getFormData());
                                }),
                                validator: (v) {
                                  if (rabItem.volume3 != null && rabItem.volume3! > 0 && v == null) {
                                    return 'Satuan 3 wajib diisi';
                                  }
                                  return null;
                                },
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          initialValue: rabItem.hargaSatuan.toStringAsFixed(0),
                          decoration: const InputDecoration(
                            labelText: 'Harga Satuan (Rp)',
                            prefixIcon: Icon(Icons.paid_outlined, size: 18),
                            filled: true,
                            fillColor: Colors.white,
                          ),
                          keyboardType: TextInputType.number,
                          readOnly: widget.readOnly,
                          onChanged: (v) {
                            rabItem.hargaSatuan = double.tryParse(v) ?? 0;
                            widget.onFormChange(getFormData());
                            setState(() {});
                          },
                          validator: (v) =>
                              (v == null || double.tryParse(v) == null)
                                  ? 'Harga wajib diisi'
                                  : null,
                        ),
                        const SizedBox(height: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF33C8DA),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Total',
                                style: GoogleFonts.figtree(
                                  fontSize: 13,
                                  color: Colors.white70,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              Text(
                                currencyFmt.format(rabItem.getTotal()),
                                style: GoogleFonts.figtree(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                        _buildNoteDisplay(rabItem.note),
                      ],
                    ),
                  );
                }),
                if (!widget.readOnly) ...[
                  const SizedBox(height: 4),
                  _addItemButton(
                    label: 'Tambah Item $kategoriNama',
                    onPressed: () => _addRab(kategoriId),
                    icon: Icons.add_shopping_cart_outlined,
                  ),
                ],
              ],
            );
          }),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // ── Premium TabBar ────────────────────────────────────────────────
        Container(
          color: Colors.white,
          child: TabBar(
            controller: _tabController,
            isScrollable: true,
              tabAlignment: TabAlignment.start,
              labelColor: const Color(0xFF33C8DA),
              unselectedLabelColor: const Color(0xFF94A3B8),
              labelStyle: GoogleFonts.figtree(
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
              unselectedLabelStyle: GoogleFonts.figtree(
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
              indicatorSize: TabBarIndicatorSize.label,
              indicator: UnderlineTabIndicator(
                borderSide: const BorderSide(
                  color: Color(0xFF33C8DA),
                  width: 2.5,
                ),
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(2),
                ),
              ),
              dividerColor: const Color(0xFFE2E8F0),
              tabs: const [
                Tab(text: 'Kerangka Acuan'),
                Tab(text: 'Target IKU'),
                Tab(text: 'Anggaran (RAB)'),
              ],
            ),
          ),

          // ── Form content ─────────────────────────────────────────────────
          Expanded(
            child: Form(
              key: _formKey,
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildKerangkaAcuanKerjaForm(),
                  _buildIndikatorKinerjaUtamaForm(),
                  _buildRencanaAnggaranBiayaForm(),
                ],
              ),
            ),
          ),

          // ── Action Buttons ─────────────────────────────────────────────
          if (!widget.readOnly)
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(
                  top: BorderSide(color: Color(0xFFE2E8F0), width: 1),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: widget.isLoading
                          ? null
                          : () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        side: const BorderSide(color: Color(0xFFCBD5E1)),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10)),
                      ),
                      child: Text(
                        'Batal',
                        style: GoogleFonts.figtree(
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF64748B),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: Builder(
                      builder: (context) {
                        final isLastTab = _tabController.index == 2;
                        return FilledButton(
                          onPressed: widget.isLoading
                              ? null
                              : () {
                                  if (isLastTab) {
                                    if (_formKey.currentState!.validate()) {
                                      if (manfaatList.isEmpty) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(
                                            content: Text('Minimal harus ada 1 manfaat'),
                                          ),
                                        );
                                        return;
                                      }
                                      if (tahapanList.isEmpty) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(
                                            content: Text('Minimal harus ada 1 tahapan'),
                                          ),
                                        );
                                        return;
                                      }
                                      if (rabList.isEmpty) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(
                                            content: Text('Minimal harus ada 1 item RAB'),
                                          ),
                                        );
                                        return;
                                      }
                                      widget.onFormChange(getFormData());
                                      widget.onSubmit();
                                    }
                                  } else {
                                    _tabController.animateTo(_tabController.index + 1);
                                  }
                                },
                          style: FilledButton.styleFrom(
                            backgroundColor: const Color(0xFF33C8DA),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10)),
                          ),
                          child: widget.isLoading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      isLastTab
                                          ? Icons.save_outlined
                                          : Icons.arrow_forward_rounded,
                                      size: 18,
                                      color: Colors.white,
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      isLastTab ? 'Simpan KAK' : 'Selanjutnya',
                                      style: GoogleFonts.figtree(
                                        fontWeight: FontWeight.w600,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                        );
                      }
                    ),
                  ),
                ],
              ),
            ),
        ],
      );
  }

  @override
  void dispose() {
    _tabController.dispose();
    namaController.dispose();
    deskripsiController.dispose();
    metodeController.dispose();
    lokasiController.dispose();
    sasaranController.dispose();
    outputKegiatanController.dispose();
    super.dispose();
  }
}

