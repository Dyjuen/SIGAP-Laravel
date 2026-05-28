import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../models/kak_model.dart';

class ManfaatItem {
  String id;
  String value;

  ManfaatItem({required this.id, required this.value});
}

class TahapanItem {
  String id;
  String nama;
  int urutan;

  TahapanItem({required this.id, required this.nama, required this.urutan});
}

class IndikatorKinerjaItem {
  String id;
  String bulanIndikator;
  String deskripsiTarget;
  double? persentaseTarget;

  IndikatorKinerjaItem({
    required this.id,
    required this.bulanIndikator,
    required this.deskripsiTarget,
    this.persentaseTarget,
  });
}

class TargetIkuItem {
  String id;
  int ikuId;
  String ikuNama;
  String target;
  int? satuanId;

  TargetIkuItem({
    required this.id,
    required this.ikuId,
    required this.ikuNama,
    required this.target,
    this.satuanId,
  });
}

class RabItem {
  String id;
  String uraian;
  double volume1;
  double? volume2;
  double? volume3;
  double hargaSatuan;
  int kategoriBelanjaId;

  RabItem({
    required this.id,
    required this.uraian,
    required this.volume1,
    this.volume2,
    this.volume3,
    required this.hargaSatuan,
    required this.kategoriBelanjaId,
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
  final VoidCallback onSubmit;
  final bool isLoading;
  final Function(Map<String, dynamic>) onFormChange;

  const KakCreateEditForm({
    Key? key,
    this.initialData,
    required this.tipeKegiatanOptions,
    this.ikuOptions = const [],
    this.satuanOptions = const [],
    required this.onSubmit,
    this.isLoading = false,
    required this.onFormChange,
  }) : super(key: key);

  @override
  State<KakCreateEditForm> createState() => _KakCreateEditFormState();
}

class _KakCreateEditFormState extends State<KakCreateEditForm> {
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

    if (widget.initialData != null) {
      _initializeFromData(widget.initialData!);
    }
  }

  void _initializeFromData(KakDetail data) {
    namaController.text = data.namaKegiatan ?? '';
    deskripsiController.text = data.deskripsiKegiatan ?? '';
    metodeController.text = data.metodePelaksanaan ?? '';
    lokasiController.text = data.lokasi ?? '';
    sasaranController.text = data.sasaranUtama ?? '';

    tanggalMulai = data.tanggalMulai != null ? DateTime.tryParse(data.tanggalMulai!) : null;
    tanggalSelesai = data.tanggalSelesai != null ? DateTime.tryParse(data.tanggalSelesai!) : null;
    selectedTipeKegiatan = data.tipeKegiatanId;

    manfaatList = (data.manfaat ?? [])
        .map(
          (m) =>
              ManfaatItem(id: m.manfaatId.toString(), value: m.manfaat ?? ''),
        )
        .toList();

    tahapanList = (data.tahapan ?? [])
        .map(
          (t) => TahapanItem(
            id: t.tahapanId.toString(),
            nama: t.namaTahapan ?? '',
            urutan: t.urutan ?? 0,
          ),
        )
        .toList();

    rabList = (data.rab ?? [])
        .map(
          (r) => RabItem(
            id: r.anggaranId.toString(),
            uraian: r.uraian ?? '',
            volume1: (r.volume1 ?? 0).toDouble(),
            volume2: r.volume2?.toDouble(),
            volume3: r.volume3?.toDouble(),
            hargaSatuan: (r.hargaSatuan ?? 0).toDouble(),
            kategoriBelanjaId: 1, // Default, should come from data
          ),
        )
        .toList();

    indikatorKinerjaList = (data.indikatorKinerja ?? [])
        .map(
          (i) => IndikatorKinerjaItem(
            id: i.targetId.toString(),
            bulanIndikator: i.bulanIndikator ?? '',
            deskripsiTarget: i.deskripsiTarget ?? '',
            persentaseTarget: i.persentaseTarget,
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
              'volume2': r.volume2,
              'volume3': r.volume3,
              'harga_satuan': r.hargaSatuan,
              'kategori_belanja_id': r.kategoriBelanjaId,
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

  void _addRab() {
    setState(() {
      rabList.add(
        RabItem(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          uraian: '',
          volume1: 1,
          hargaSatuan: 0,
          kategoriBelanjaId: 1,
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

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Form(
      key: _formKey,
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
          const SizedBox(height: 16),

          // Nama Kegiatan
          TextFormField(
            controller: namaController,
            decoration: InputDecoration(
              labelText: 'Nama Kegiatan',
              hintText: 'Contoh: Workshop Digital Marketing',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
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
            onChanged: (_) => widget.onFormChange(getFormData()),
          ),
          const SizedBox(height: 16),

          // Tipe Kegiatan
          DropdownButtonFormField<int>(
            value: selectedTipeKegiatan,
            decoration: InputDecoration(
              labelText: 'Tipe Kegiatan',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            items: widget.tipeKegiatanOptions.map<DropdownMenuItem<int>>((
              tipe,
            ) {
              return DropdownMenuItem<int>(
                value: tipe['tipe_kegiatan_id'] ?? tipe['id'],
                child: Text(tipe['nama_tipe'] ?? tipe['name'] ?? ''),
              );
            }).toList(),
            onChanged: (value) {
              setState(() {
                selectedTipeKegiatan = value;
              });
              widget.onFormChange(getFormData());
            },
            validator: (value) {
              if (value == null) {
                return 'Tipe kegiatan harus dipilih';
              }
              return null;
            },
          ),
          const SizedBox(height: 24),

          // Deskripsi
          TextFormField(
            controller: deskripsiController,
            decoration: InputDecoration(
              labelText: 'Gambaran Umum Kegiatan',
              hintText: 'Jelaskan kegiatan ini...',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
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
            onChanged: (_) => widget.onFormChange(getFormData()),
          ),
          const SizedBox(height: 16),

          // Sasaran Utama
          TextFormField(
            controller: sasaranController,
            decoration: InputDecoration(
              labelText: 'Sasaran Utama',
              hintText: 'Siapa target peserta?',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Sasaran utama harus diisi';
              }
              return null;
            },
            onChanged: (_) => widget.onFormChange(getFormData()),
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
                    child: TextFormField(
                      initialValue: item.value,
                      decoration: InputDecoration(
                        labelText: 'Manfaat ${index + 1}',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Manfaat tidak boleh kosong';
                        }
                        return null;
                      },
                      onChanged: (value) {
                        setState(() {
                          item.value = value;
                        });
                      },
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
          }).toList(),
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
          TextFormField(
            controller: metodeController,
            decoration: InputDecoration(
              labelText: 'Metode Pelaksanaan',
              hintText: 'Jelaskan cara pelaksanaannya...',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
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
            onChanged: (_) => widget.onFormChange(getFormData()),
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
                    child: TextFormField(
                      initialValue: item.nama,
                      decoration: InputDecoration(
                        labelText: 'Tahapan ${index + 1}',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Tahapan tidak boleh kosong';
                        }
                        return null;
                      },
                      onChanged: (value) {
                        setState(() {
                          item.nama = value;
                        });
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: () => _removeTahapan(index),
                    icon: const Icon(Icons.delete, color: Colors.red),
                  ),
                ],
              ),
            );
          }).toList(),
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
                  border: Border.all(color: colorScheme.outline),
                  borderRadius: BorderRadius.circular(8),
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
                      onChanged: (value) {
                        setState(() {
                          item.bulanIndikator = value;
                        });
                      },
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      initialValue: item.deskripsiTarget,
                      decoration: InputDecoration(
                        labelText: 'Deskripsi Target',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Deskripsi target tidak boleh kosong';
                        }
                        return null;
                      },
                      onChanged: (value) {
                        setState(() {
                          item.deskripsiTarget = value;
                        });
                      },
                    ),
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
                      onChanged: (value) {
                        setState(() {
                          item.persentaseTarget = double.tryParse(value);
                        });
                      },
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
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
                  onTap: () => _selectDate(context, true),
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
                  onTap: () => _selectDate(context, false),
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
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Lokasi harus diisi';
              }
              return null;
            },
            onChanged: (_) => widget.onFormChange(getFormData()),
          ),
          const SizedBox(height: 16),

          // RAB
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Rencana Anggaran Biaya (RAB)',
                style: GoogleFonts.figtree(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: colorScheme.onSurface,
                ),
              ),
              IconButton(
                onPressed: _addRab,
                icon: const Icon(Icons.add_circle),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ...rabList.asMap().entries.map((entry) {
            int index = entry.key;
            RabItem item = entry.value;
            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  border: Border.all(color: colorScheme.outline),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Item RAB ${index + 1}',
                          style: GoogleFonts.figtree(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        IconButton(
                          onPressed: () => _removeRab(index),
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
                      onChanged: (value) {
                        setState(() {
                          item.uraian = value;
                        });
                      },
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          flex: 1,
                          child: TextFormField(
                            initialValue: item.volume1.toString(),
                            decoration: InputDecoration(
                              labelText: 'Vol 1',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            keyboardType: TextInputType.number,
                            onChanged: (value) {
                              setState(() {
                                item.volume1 = double.tryParse(value) ?? 0;
                              });
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          flex: 1,
                          child: TextFormField(
                            initialValue: item.volume2?.toString() ?? '',
                            decoration: InputDecoration(
                              labelText: 'Vol 2',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            keyboardType: TextInputType.number,
                            onChanged: (value) {
                              setState(() {
                                item.volume2 = double.tryParse(value);
                              });
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          flex: 1,
                          child: TextFormField(
                            initialValue: item.volume3?.toString() ?? '',
                            decoration: InputDecoration(
                              labelText: 'Vol 3',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            keyboardType: TextInputType.number,
                            onChanged: (value) {
                              setState(() {
                                item.volume3 = double.tryParse(value);
                              });
                            },
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
                      onChanged: (value) {
                        setState(() {
                          item.hargaSatuan = double.tryParse(value) ?? 0;
                        });
                      },
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
          }).toList(),
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

          // Submit Button
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

          // Cancel Button
          OutlinedButton(
            onPressed: widget.isLoading ? null : () => Navigator.pop(context),
            child: Text(
              'Batal',
              style: GoogleFonts.figtree(fontWeight: FontWeight.w600),
            ),
          ),
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
