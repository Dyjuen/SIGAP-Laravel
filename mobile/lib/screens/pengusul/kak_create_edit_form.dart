import 'package:flutter/material.dart';
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
  final GlobalKey<FormState>? formKey; // Add formKey parameter

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
    this.formKey, // Initialize formKey
  });

  @override
  State<KakCreateEditForm> createState() => KakCreateEditFormState();
}

class KakCreateEditFormState extends State<KakCreateEditForm> {
  late TextEditingController namaController;
  late TextEditingController deskripsiController;
  late TextEditingController metodeController;
  late TextEditingController lokasiController;
  late TextEditingController sasaranController;

  DateTime? tanggalMulai;
  DateTime? tanggalSelesai;
  int? selectedTipeKegiatan;

  List<ManfaatItem> manfaatList = [];
  List<TahapanItem> tahapanList = [];
  List<IndikatorKinerjaItem> indikatorKinerjaList = [];
  List<TargetIkuItem> targetIkuList = [];
  List<RabItem> rabList = [];

  late final GlobalKey<FormState> _formKey;

  @override
  void initState() {
    super.initState();
    _formKey = widget.formKey ?? GlobalKey<FormState>();
    namaController = TextEditingController();
    deskripsiController = TextEditingController();
    metodeController = TextEditingController();
    lokasiController = TextEditingController();
    sasaranController = TextEditingController();

    if (widget.initialData != null) {
      _initializeFromData(widget.initialData!);
    }
  }

  void _initializeFromData(KakDetail data) {
    namaController.text = data.namaKegiatan;
    deskripsiController.text = data.deskripsiKegiatan;
    metodeController.text = data.metodePelaksanaan;
    lokasiController.text = data.lokasi;
    sasaranController.text = data.sasaranUtama;

    tanggalMulai = DateTime.tryParse(data.tanggalMulai);
    tanggalSelesai = DateTime.tryParse(data.tanggalSelesai);
    selectedTipeKegiatan = data.tipeKegiatanId;

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
            satuan1Id: r.satuan1Id,
            volume2: r.volume2?.toDouble(),
            satuan2Id: r.satuan2Id,
            volume3: r.volume3?.toDouble(),
            satuan3Id: r.satuan3Id,
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
            ikuId: int.tryParse(t.ikuId.toString()) ?? 0,
            ikuNama: t.ikuNama,
            target: t.target.toString(),
            satuanId: t.satuanId != null
                ? int.tryParse(t.satuanId.toString())
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
      'tanggal_mulai': tanggalMulai?.toIso8601String().split('T')[0] ?? '',
      'tanggal_selesai': tanggalSelesai?.toIso8601String().split('T')[0] ?? '',
      'tipe_kegiatan_id': selectedTipeKegiatan ?? '',
      'manfaat': manfaatList.map((m) => {'value': m.value}).toList(),
      'tahapan_pelaksanaan': tahapanList
          .map((t) => {'nama_tahapan': t.nama})
          .toList(),
      'indikator_kinerja': indikatorKinerjaList
          .map(
            (i) => {
              'bulan_indikator': i.bulanIndikator,
              'deskripsi_target': i.deskripsiTarget,
              'persentase_target': i.persentaseTarget,
            },
          )
          .toList(),
      'rab': rabList
          .map(
            (r) => {
              'uraian': r.uraian,
              'volume1': r.volume1,
              'satuan1_id': r.satuan1Id,
              'volume2': r.volume2,
              'satuan2_id': r.satuan2Id,
              'volume3': r.volume3,
              'satuan3_id': r.satuan3Id,
              'harga_satuan': r.hargaSatuan,
              'kategori_belanja_id': r.kategoriBelanjaId,
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
          id: DateTime.now().millisecondsSinceEpoch.toString(),
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
          id: DateTime.now().millisecondsSinceEpoch.toString(),
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
          id: DateTime.now().millisecondsSinceEpoch.toString(),
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
          id: DateTime.now().millisecondsSinceEpoch.toString(),
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
          id: DateTime.now().millisecondsSinceEpoch.toString(),
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

  Future<void> _selectDate(BuildContext context, bool isStartDate) async {
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
      });
    }
  }

  Widget _buildSatuanDropdown({
    required String label,
    required int? value,
    required ValueChanged<int?> onChanged,
  }) {
    return DropdownButtonFormField<int>(
      value:
          widget.satuanOptions.any((s) => (s['satuan_id'] ?? s['id']) == value)
          ? value
          : null,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      items: widget.satuanOptions.map<DropdownMenuItem<int>>((satuan) {
        return DropdownMenuItem<int>(
          value: satuan['satuan_id'] ?? satuan['id'],
          child: Text(satuan['nama_satuan'] ?? satuan['name'] ?? ''),
        );
      }).toList(),
      onChanged: widget.readOnly ? null : onChanged,
    );
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Form(
      key: widget.formKey, // Use the external formKey
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Informasi Umum
          Text(
            'Informasi Umum',
            style: GoogleFonts.figtree(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 24),

          // Nama Kegiatan
          Builder(
            builder: (_) {
              final note = widget.initialData?.catatanNamaKegiatan;
              final hasNote = note != null && note.trim().isNotEmpty;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextFormField(
                    controller: namaController,
                    decoration: InputDecoration(
                      labelText: 'Nama Kegiatan',
                      hintText: 'Contoh: Workshop Digital Marketing',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(
                          color: hasNote
                              ? Colors.redAccent
                              : const Color(0xFFE2E8F0),
                          width: hasNote ? 1.2 : 0.5,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(
                          color: hasNote
                              ? Colors.redAccent
                              : colorScheme.primary,
                          width: hasNote ? 1.4 : 1.2,
                        ),
                      ),
                      errorBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(
                          color: Colors.redAccent,
                          width: 1.2,
                        ),
                      ),

                      filled: hasNote,
                      fillColor: hasNote ? const Color(0xFFFFF1F0) : null,
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Nama kegiatan harus diisi';
                      }
                      if (value.length < 5) {
                        return 'Minimal 5 karakter';
                      }
                      return null;
                    },
                    onChanged: widget.readOnly
                        ? null
                        : (_) => widget.onFormChange(getFormData()),
                    enabled: !widget.readOnly,
                  ),
                  if (hasNote) ...[
                    const SizedBox(height: 6),
                    Text(
                      'Catatan Verifikator: $note',
                      style: GoogleFonts.figtree(
                        fontSize: 12,
                        color: Colors.redAccent,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ],
              );
            },
          ),
          const SizedBox(height: 16),

          // Tipe Kegiatan
          Builder(
            builder: (_) {
              final note = widget.initialData?.catatanTipeKegiatan;
              final hasNote = note != null && note.trim().isNotEmpty;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  DropdownButtonFormField<int>(
                    value: selectedTipeKegiatan,
                    decoration: InputDecoration(
                      labelText: 'Tipe Kegiatan',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(
                          color: hasNote
                              ? Colors.redAccent
                              : const Color(0xFFE2E8F0),
                          width: hasNote ? 1.2 : 0.5,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(
                          color: hasNote
                              ? Colors.redAccent
                              : colorScheme.primary,
                          width: hasNote ? 1.4 : 1.2,
                        ),
                      ),
                      errorBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(
                          color: Colors.redAccent,
                          width: 1.2,
                        ),
                      ),
                      filled: hasNote,
                      fillColor: hasNote ? const Color(0xFFFFF1F0) : null,
                    ),
                    items: widget.tipeKegiatanOptions
                        .map<DropdownMenuItem<int>>(
                          (tipe) => DropdownMenuItem<int>(
                            value: tipe['tipe_kegiatan_id'] ?? tipe['id'],
                            child: Text(
                              tipe['nama_tipe'] ?? tipe['name'] ?? '',
                            ),
                          ),
                        )
                        .toList(),
                    onChanged: widget.readOnly
                        ? null
                        : (value) {
                            setState(() {
                              selectedTipeKegiatan = value;
                            });
                            widget.onFormChange(getFormData());
                          },
                    validator: (value) {
                      if (value == null) return 'Tipe kegiatan harus dipilih';
                      return null;
                    },
                  ),
                  if (hasNote) ...[
                    const SizedBox(height: 6),
                    Text(
                      'Catatan Verifikator: $note',
                      style: GoogleFonts.figtree(
                        fontSize: 12,
                        color: Colors.redAccent,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ],
              );
            },
          ),

          // Deskripsi
          Builder(
            builder: (_) {
              final note = widget.initialData?.catatanDeskripsiKegiatan;
              final hasNote = note != null && note.trim().isNotEmpty;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextFormField(
                    controller: deskripsiController,
                    decoration: InputDecoration(
                      labelText: 'Gambaran Umum Kegiatan',
                      hintText: 'Jelaskan kegiatan ini...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(
                          color: hasNote
                              ? Colors.redAccent
                              : const Color(0xFFE2E8F0),
                          width: hasNote ? 1.2 : 0.5,
                        ),
                      ),
                      filled: hasNote,
                      fillColor: hasNote ? const Color(0xFFFFF1F0) : null,
                    ),
                    maxLines: 4,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Deskripsi harus diisi';
                      }
                      if (value.length < 5) {
                        return 'Minimal 5 karakter';
                      }
                      return null;
                    },
                    onChanged: widget.readOnly
                        ? null
                        : (_) => widget.onFormChange(getFormData()),
                    enabled: !widget.readOnly,
                  ),
                  if (hasNote) ...[
                    const SizedBox(height: 6),
                    Text(
                      'Catatan Verifikator: $note',
                      style: GoogleFonts.figtree(
                        fontSize: 12,
                        color: Colors.redAccent,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ],
              );
            },
          ),
          const SizedBox(height: 16),

          // Sasaran Utama
          Builder(
            builder: (_) {
              final note = widget.initialData?.catatanSasaranUtama;
              final hasNote = note != null && note.trim().isNotEmpty;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextFormField(
                    controller: sasaranController,
                    decoration: InputDecoration(
                      labelText: 'Sasaran Utama',
                      hintText: 'Siapa target peserta?',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(
                          color: hasNote
                              ? Colors.redAccent
                              : const Color(0xFFE2E8F0),
                          width: hasNote ? 1.2 : 0.5,
                        ),
                      ),
                      filled: hasNote,
                      fillColor: hasNote ? const Color(0xFFFFF1F0) : null,
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Sasaran utama harus diisi';
                      }
                      return null;
                    },
                    onChanged: widget.readOnly
                        ? null
                        : (_) => widget.onFormChange(getFormData()),
                    enabled: !widget.readOnly,
                  ),
                  if (hasNote) ...[
                    const SizedBox(height: 6),
                    Text(
                      'Catatan Verifikator: $note',
                      style: GoogleFonts.figtree(
                        fontSize: 12,
                        color: Colors.redAccent,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ],
              );
            },
          ),
          const SizedBox(height: 16),

          // Manfaat
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Output/Manfaat Kegiatan',
                style: GoogleFonts.figtree(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: colorScheme.onSurface,
                ),
              ),
              if (!widget.readOnly)
                IconButton(
                  onPressed: _addManfaat,
                  icon: const Icon(Icons.add_circle),
                ),
            ],
          ),
          const SizedBox(height: 8),
          ...manfaatList.asMap().entries.map((entry) {
            int index = entry.key;
            ManfaatItem item = entry.value;
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TextFormField(
                          initialValue: item.value,
                          decoration: InputDecoration(
                            labelText: 'Manfaat ${index + 1}',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(
                                color:
                                    (item.note != null &&
                                        item.note!.trim().isNotEmpty)
                                    ? Colors.redAccent
                                    : const Color(0xFFE2E8F0),
                                width:
                                    (item.note != null &&
                                        item.note!.trim().isNotEmpty)
                                    ? 1.2
                                    : 0.5,
                              ),
                            ),
                            filled:
                                (item.note != null &&
                                item.note!.trim().isNotEmpty),
                            fillColor:
                                (item.note != null &&
                                    item.note!.trim().isNotEmpty)
                                ? const Color(0xFFFFF1F0)
                                : null,
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Manfaat tidak boleh kosong';
                            }
                            return null;
                          },
                          onChanged: widget.readOnly
                              ? null
                              : (value) {
                                  setState(() {
                                    item.value = value;
                                  });
                                },
                          enabled: !widget.readOnly,
                        ),
                        if (item.note != null &&
                            item.note!.trim().isNotEmpty) ...[
                          const SizedBox(height: 6),
                          Text(
                            'Catatan Verifikator: ${item.note}',
                            style: GoogleFonts.figtree(
                              fontSize: 12,
                              color: Colors.redAccent,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: () => _removeManfaat(index),
                    icon: const Icon(Icons.delete, color: Colors.red),
                  ),
                ],
              ),
            );
          }),
          if (manfaatList.isEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Text(
                'Klik + untuk menambah manfaat',
                style: GoogleFonts.figtree(
                  fontSize: 12,
                  color: colorScheme.outline,
                ),
              ),
            ),
          const SizedBox(height: 24),

          // Metode Pelaksanaan
          Builder(
            builder: (_) {
              final note = widget.initialData?.catatanMetodePelaksanaan;
              final hasNote = note != null && note.trim().isNotEmpty;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextFormField(
                    controller: metodeController,
                    decoration: InputDecoration(
                      labelText: 'Metode Pelaksanaan',
                      hintText: 'Jelaskan cara pelaksanaannya...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(
                          color: hasNote
                              ? Colors.redAccent
                              : const Color(0xFFE2E8F0),
                          width: hasNote ? 1.2 : 0.5,
                        ),
                      ),
                      filled: hasNote,
                      fillColor: hasNote ? const Color(0xFFFFF1F0) : null,
                    ),
                    maxLines: 3,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Metode harus diisi';
                      }
                      if (value.length < 5) {
                        return 'Minimal 5 karakter';
                      }
                      return null;
                    },
                    onChanged: widget.readOnly
                        ? null
                        : (_) => widget.onFormChange(getFormData()),
                    enabled: !widget.readOnly,
                  ),
                  if (hasNote) ...[
                    const SizedBox(height: 6),
                    Text(
                      'Catatan Verifikator: $note',
                      style: GoogleFonts.figtree(
                        fontSize: 12,
                        color: Colors.redAccent,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ],
              );
            },
          ),
          const SizedBox(height: 16),

          // Tahapan
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Tahapan Kegiatan',
                style: GoogleFonts.figtree(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: colorScheme.onSurface,
                ),
              ),
              if (!widget.readOnly)
                IconButton(
                  onPressed: _addTahapan,
                  icon: const Icon(Icons.add_circle),
                ),
            ],
          ),
          const SizedBox(height: 8),
          ...tahapanList.asMap().entries.map((entry) {
            int index = entry.key;
            TahapanItem item = entry.value;
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: colorScheme.primary,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        '${index + 1}',
                        style: GoogleFonts.figtree(
                          color: colorScheme.onPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TextFormField(
                          initialValue: item.nama,
                          decoration: InputDecoration(
                            labelText: 'Tahapan ${index + 1}',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(
                                color:
                                    (item.note != null &&
                                        item.note!.trim().isNotEmpty)
                                    ? Colors.redAccent
                                    : const Color(0xFFE2E8F0),
                                width:
                                    (item.note != null &&
                                        item.note!.trim().isNotEmpty)
                                    ? 1.2
                                    : 0.5,
                              ),
                            ),
                            filled:
                                (item.note != null &&
                                item.note!.trim().isNotEmpty),
                            fillColor:
                                (item.note != null &&
                                    item.note!.trim().isNotEmpty)
                                ? const Color(0xFFFFF1F0)
                                : null,
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Tahapan tidak boleh kosong';
                            }
                            return null;
                          },
                          onChanged: widget.readOnly
                              ? null
                              : (value) {
                                  setState(() {
                                    item.nama = value;
                                  });
                                },
                          enabled: !widget.readOnly,
                        ),
                        if (item.note != null &&
                            item.note!.trim().isNotEmpty) ...[
                          const SizedBox(height: 6),
                          Text(
                            'Catatan Verifikator: ${item.note}',
                            style: GoogleFonts.figtree(
                              fontSize: 12,
                              color: Colors.redAccent,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  if (!widget.readOnly)
                    IconButton(
                      onPressed: () => _removeTahapan(index),
                      icon: const Icon(Icons.delete, color: Colors.red),
                    ),
                ],
              ),
            );
          }),
          if (tahapanList.isEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Text(
                'Klik + untuk menambah tahapan',
                style: GoogleFonts.figtree(
                  fontSize: 12,
                  color: colorScheme.outline,
                ),
              ),
            ),
          const SizedBox(height: 24),

          // Indikator Kinerja
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Indikator Kinerja',
                style: GoogleFonts.figtree(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: colorScheme.onSurface,
                ),
              ),
              if (!widget.readOnly)
                IconButton(
                  onPressed: _addIndikatorKinerja,
                  icon: const Icon(Icons.add_circle),
                ),
            ],
          ),
          const SizedBox(height: 8),
          ...indikatorKinerjaList.asMap().entries.map((entry) {
            int index = entry.key;
            IndikatorKinerjaItem item = entry.value;
            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  border: Border.all(
                    color: (item.note != null && item.note!.trim().isNotEmpty)
                        ? Colors.redAccent
                        : colorScheme.outline,
                  ),
                  borderRadius: BorderRadius.circular(8),
                  color: (item.note != null && item.note!.trim().isNotEmpty)
                      ? const Color(0xFFFFF1F0)
                      : null,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Indikator ${index + 1}',
                          style: GoogleFonts.figtree(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        if (!widget.readOnly)
                          IconButton(
                            onPressed: () => _removeIndikatorKinerja(index),
                            icon: const Icon(Icons.delete, color: Colors.red),
                            iconSize: 20,
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      initialValue: item.bulanIndikator,
                      decoration: InputDecoration(
                        labelText: 'Bulan Indikator',
                        hintText: 'Contoh: Januari',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      onChanged: widget.readOnly
                          ? null
                          : (value) {
                              setState(() {
                                item.bulanIndikator = value;
                              });
                            },
                      enabled: !widget.readOnly,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      initialValue: item.deskripsiTarget,
                      decoration: InputDecoration(
                        labelText: 'Deskripsi Target',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide(
                            color:
                                (item.note != null &&
                                    item.note!.trim().isNotEmpty)
                                ? Colors.redAccent
                                : const Color(0xFFE2E8F0),
                            width:
                                (item.note != null &&
                                    item.note!.trim().isNotEmpty)
                                ? 1.2
                                : 0.5,
                          ),
                        ),
                        filled:
                            (item.note != null && item.note!.trim().isNotEmpty),
                        fillColor:
                            (item.note != null && item.note!.trim().isNotEmpty)
                            ? const Color(0xFFFFF1F0)
                            : null,
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Deskripsi target tidak boleh kosong';
                        }
                        return null;
                      },
                      onChanged: widget.readOnly
                          ? null
                          : (value) {
                              setState(() {
                                item.deskripsiTarget = value;
                              });
                            },
                      enabled: !widget.readOnly,
                    ),
                    if (item.note != null && item.note!.trim().isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text(
                        'Catatan Verifikator: ${item.note}',
                        style: GoogleFonts.figtree(
                          fontSize: 12,
                          color: Colors.redAccent,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                    const SizedBox(height: 12),
                    TextFormField(
                      initialValue: item.persentaseTarget?.toString() ?? '',
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      decoration: InputDecoration(
                        labelText: 'Persentase Target (%)',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      onChanged: widget.readOnly
                          ? null
                          : (value) {
                              setState(() {
                                item.persentaseTarget = double.tryParse(value);
                              });
                            },
                      enabled: !widget.readOnly,
                    ),
                  ],
                ),
              ),
            );
          }),
          if (indikatorKinerjaList.isEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Text(
                'Klik + untuk menambah indikator kinerja',
                style: GoogleFonts.figtree(
                  fontSize: 12,
                  color: colorScheme.outline,
                ),
              ),
            ),
          const SizedBox(height: 24),

          // Tanggal
          Text(
            'Periode Pelaksanaan',
            style: GoogleFonts.figtree(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: widget.readOnly
                      ? null
                      : () => _selectDate(context, true),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      border: Border.all(color: colorScheme.outline),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Tanggal Mulai',
                          style: GoogleFonts.figtree(fontSize: 12),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          tanggalMulai != null
                              ? DateFormat(
                                  'dd MMM yyyy',
                                  'id_ID',
                                ).format(tanggalMulai!)
                              : 'Pilih tanggal',
                          style: GoogleFonts.figtree(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: InkWell(
                  onTap: widget.readOnly
                      ? null
                      : () => _selectDate(context, false),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      border: Border.all(color: colorScheme.outline),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Tanggal Selesai',
                          style: GoogleFonts.figtree(fontSize: 12),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          tanggalSelesai != null
                              ? DateFormat(
                                  'dd MMM yyyy',
                                  'id_ID',
                                ).format(tanggalSelesai!)
                              : 'Pilih tanggal',
                          style: GoogleFonts.figtree(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Lokasi
          TextFormField(
            controller: lokasiController,
            decoration: InputDecoration(
              labelText: 'Lokasi',
              hintText: 'Contoh: Aula Utama Gedung A',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(
                  color:
                      (widget.initialData?.catatanLokasi != null &&
                          widget.initialData!.catatanLokasi!.trim().isNotEmpty)
                      ? Colors.redAccent
                      : const Color(0xFFE2E8F0),
                  width:
                      (widget.initialData?.catatanLokasi != null &&
                          widget.initialData!.catatanLokasi!.trim().isNotEmpty)
                      ? 1.2
                      : 0.5,
                ),
              ),
              filled:
                  (widget.initialData?.catatanLokasi != null &&
                  widget.initialData!.catatanLokasi!.trim().isNotEmpty),
              fillColor:
                  (widget.initialData?.catatanLokasi != null &&
                      widget.initialData!.catatanLokasi!.trim().isNotEmpty)
                  ? const Color(0xFFFFF1F0)
                  : null,
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Lokasi harus diisi';
              }
              return null;
            },
            onChanged: widget.readOnly
                ? null
                : (_) => widget.onFormChange(getFormData()),
            enabled: !widget.readOnly,
          ),
          if (widget.initialData?.catatanLokasi != null &&
              widget.initialData!.catatanLokasi!.trim().isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              'Catatan Verifikator: ${widget.initialData!.catatanLokasi!}',
              style: GoogleFonts.figtree(
                fontSize: 12,
                color: Colors.redAccent,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
          const SizedBox(height: 24),

          // Indikator Kinerja Utama (IKU)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Indikator Kinerja Utama (IKU)',
                style: GoogleFonts.figtree(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: colorScheme.onSurface,
                ),
              ),
              if (!widget.readOnly)
                IconButton(
                  onPressed: _addTargetIku,
                  icon: const Icon(Icons.add_circle),
                ),
            ],
          ),
          const SizedBox(height: 8),
          ...targetIkuList.asMap().entries.map((entry) {
            int index = entry.key;
            TargetIkuItem item = entry.value;
            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  border: Border.all(
                    color: (item.note != null && item.note!.trim().isNotEmpty)
                        ? Colors.redAccent
                        : colorScheme.outline,
                  ),
                  borderRadius: BorderRadius.circular(8),
                  color: (item.note != null && item.note!.trim().isNotEmpty)
                      ? const Color(0xFFFFF1F0)
                      : null,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Target IKU ${index + 1}',
                          style: GoogleFonts.figtree(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        if (!widget.readOnly)
                          IconButton(
                            onPressed: () => _removeTargetIku(index),
                            icon: const Icon(Icons.delete, color: Colors.red),
                            iconSize: 20,
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // IKU Selection
                    DropdownButtonFormField<int>(
                      value: widget.ikuOptions.any(
                                (i) => (i['iku_id'] ?? i['id']) == item.ikuId,
                              )
                          ? item.ikuId
                          : null,
                      decoration: InputDecoration(
                        labelText: 'Pilih IKU',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      items: widget.ikuOptions.map<DropdownMenuItem<int>>((
                        iku,
                      ) {
                        return DropdownMenuItem<int>(
                          value: iku['iku_id'] ?? iku['id'],
                          child: Text(
                            '${iku['kode_iku'] ?? ''} - ${iku['nama_iku'] ?? ''}',
                          ),
                        );
                      }).toList(),
                      onChanged: widget.readOnly
                          ? null
                          : (value) {
                              setState(() {
                                item.ikuId = value ?? 0;
                              });
                              widget.onFormChange(getFormData());
                            },
                    ),
                    const SizedBox(height: 12),
                    // Target Input
                    TextFormField(
                      initialValue: item.target,
                      decoration: InputDecoration(
                        labelText: 'Target Capaian',
                        hintText: 'Contoh: 100',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      keyboardType: TextInputType.text,
                      onChanged: widget.readOnly
                          ? null
                          : (value) {
                              setState(() {
                                item.target = value;
                              });
                              widget.onFormChange(getFormData());
                            },
                    ),
                    const SizedBox(height: 12),
                    // Satuan Selection
                    _buildSatuanDropdown(
                      label: 'Satuan Target',
                      value: item.satuanId,
                      onChanged: (val) {
                        setState(() {
                          item.satuanId = val;
                        });
                        widget.onFormChange(getFormData());
                      },
                    ),
                    if (item.note != null && item.note!.trim().isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text(
                        'Catatan Verifikator: ${item.note}',
                        style: GoogleFonts.figtree(
                          fontSize: 12,
                          color: Colors.redAccent,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            );
          }),
          if (targetIkuList.isEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Text(
                'Klik + untuk menambah target IKU',
                style: GoogleFonts.figtree(
                  fontSize: 12,
                  color: colorScheme.outline,
                ),
              ),
            ),
          const SizedBox(height: 16),

          // RAB Grouped by Category
          ...widget.kategoriBelanjaOptions.map((kategori) {
            final kategoriId = kategori['kategori_belanja_id'] ?? kategori['id'];
            final kategoriNama = kategori['nama'] ?? kategori['name'] ?? '';
            final categoryItems = rabList.where((item) => item.kategoriBelanjaId == kategoriId).toList();
            final categoryTotal = categoryItems.fold<double>(0, (sum, item) => sum + item.getTotal());

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        kategoriNama,
                        style: GoogleFonts.figtree(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: colorScheme.onSurface,
                        ),
                      ),
                    ),
                    if (!widget.readOnly)
                      IconButton(
                        onPressed: () => _addRab(kategoriId),
                        icon: const Icon(Icons.add_circle),
                      ),
                  ],
                ),
                if (categoryTotal > 0)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: Text(
                      'Subtotal: Rp ${NumberFormat("#,##0", "id_ID").format(categoryTotal.toInt())}',
                      style: GoogleFonts.figtree(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: colorScheme.primary,
                      ),
                    ),
                  ),
                const SizedBox(height: 8),
                if (categoryItems.isEmpty)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: Text(
                      'Klik + untuk menambah $kategoriNama',
                      style: GoogleFonts.figtree(
                        fontSize: 12,
                        color: colorScheme.outline,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                ...categoryItems.map((item) {
                  final indexInMainList = rabList.indexOf(item);
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: (item.note != null && item.note!.trim().isNotEmpty)
                              ? Colors.redAccent
                              : colorScheme.outline,
                        ),
                        borderRadius: BorderRadius.circular(8),
                        color: (item.note != null && item.note!.trim().isNotEmpty)
                            ? const Color(0xFFFFF1F0)
                            : null,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Item RAB',
                                style: GoogleFonts.figtree(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              if (!widget.readOnly)
                                IconButton(
                                  onPressed: () => _removeRab(indexInMainList),
                                  icon: const Icon(Icons.delete, color: Colors.red),
                                  iconSize: 20,
                                ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            initialValue: item.uraian,
                            decoration: InputDecoration(
                              labelText: 'Uraian',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Uraian tidak boleh kosong';
                              }
                              return null;
                            },
                            onChanged: widget.readOnly
                                ? null
                                : (value) {
                                    setState(() {
                                      item.uraian = value;
                                    });
                                  },
                            enabled: !widget.readOnly,
                          ),
                          if (item.note != null && item.note!.trim().isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Text(
                              'Catatan Verifikator: ${item.note!}',
                              style: GoogleFonts.figtree(
                                fontSize: 12,
                                color: Colors.redAccent,
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          ],
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                flex: 1,
                                child: Column(
                                  children: [
                                    TextFormField(
                                      initialValue: item.volume1.toString(),
                                      decoration: InputDecoration(
                                        labelText: 'Vol 1',
                                        border: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                      ),
                                      keyboardType: TextInputType.number,
                                      onChanged: widget.readOnly
                                          ? null
                                          : (value) {
                                              setState(() {
                                                item.volume1 =
                                                    double.tryParse(value) ?? 0;
                                              });
                                            },
                                      enabled: !widget.readOnly,
                                    ),
                                    const SizedBox(height: 8),
                                    _buildSatuanDropdown(
                                      label: 'Satuan 1',
                                      value: item.satuan1Id,
                                      onChanged: (val) =>
                                          setState(() => item.satuan1Id = val),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                flex: 1,
                                child: Column(
                                  children: [
                                    TextFormField(
                                      initialValue: item.volume2?.toString() ?? '',
                                      decoration: InputDecoration(
                                        labelText: 'Vol 2',
                                        border: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                      ),
                                      keyboardType: TextInputType.number,
                                      onChanged: widget.readOnly
                                          ? null
                                          : (value) {
                                              setState(() {
                                                item.volume2 = double.tryParse(value);
                                              });
                                            },
                                      enabled: !widget.readOnly,
                                    ),
                                    const SizedBox(height: 8),
                                    _buildSatuanDropdown(
                                      label: 'Satuan 2',
                                      value: item.satuan2Id,
                                      onChanged: (val) =>
                                          setState(() => item.satuan2Id = val),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                flex: 1,
                                child: Column(
                                  children: [
                                    TextFormField(
                                      initialValue: item.volume3?.toString() ?? '',
                                      decoration: InputDecoration(
                                        labelText: 'Vol 3',
                                        border: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                      ),
                                      keyboardType: TextInputType.number,
                                      onChanged: widget.readOnly
                                          ? null
                                          : (value) {
                                              setState(() {
                                                item.volume3 = double.tryParse(value);
                                              });
                                            },
                                      enabled: !widget.readOnly,
                                    ),
                                    const SizedBox(height: 8),
                                    _buildSatuanDropdown(
                                      label: 'Satuan 3',
                                      value: item.satuan3Id,
                                      onChanged: (val) =>
                                          setState(() => item.satuan3Id = val),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            initialValue: item.hargaSatuan.toString(),
                            decoration: InputDecoration(
                              labelText: 'Harga Satuan (Rp)',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            keyboardType: TextInputType.number,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Harga satuan harus diisi';
                              }
                              return null;
                            },
                            onChanged: widget.readOnly
                                ? null
                                : (value) {
                                    setState(() {
                                      item.hargaSatuan = double.tryParse(value) ?? 0;
                                    });
                                  },
                            enabled: !widget.readOnly,
                          ),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: colorScheme.primaryContainer,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Total:',
                                  style: GoogleFonts.figtree(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 12,
                                  ),
                                ),
                                Text(
                                  'Rp ${NumberFormat("#,##0", "id_ID").format(item.getTotal().toInt())}',
                                  style: GoogleFonts.figtree(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ],
            );
          }),
          if (rabList.isEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Text(
                'Klik + untuk menambah item RAB',
                style: GoogleFonts.figtree(
                  fontSize: 12,
                  color: colorScheme.outline,
                ),
              ),
            ),
          const SizedBox(height: 24),

          // Total RAB
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: colorScheme.primary,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total RAB',
                  style: GoogleFonts.figtree(
                    color: colorScheme.onPrimary,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                Text(
                  'Rp ${NumberFormat("#,##0", "id_ID").format(rabList.fold<double>(0, (sum, item) => sum + item.getTotal()).toInt())}',
                  style: GoogleFonts.figtree(
                    color: colorScheme.onPrimary,
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),

          // Action Buttons (Only show if not readOnly)
          if (!widget.readOnly) ...[
            FilledButton(
              onPressed: widget.isLoading
                  ? null
                  : () {
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
                    },
              child: widget.isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text(
                      'Simpan',
                      style: GoogleFonts.figtree(fontWeight: FontWeight.w600),
                    ),
            ),
            const SizedBox(height: 16),
            OutlinedButton(
              onPressed: widget.isLoading ? null : () => Navigator.pop(context),
              child: Text(
                'Batal',
                style: GoogleFonts.figtree(fontWeight: FontWeight.w600),
              ),
            ),
          ],
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  @override
  void dispose() {
    namaController.dispose();
    deskripsiController.dispose();
    metodeController.dispose();
    lokasiController.dispose();
    sasaranController.dispose();
    super.dispose();
  }
}
