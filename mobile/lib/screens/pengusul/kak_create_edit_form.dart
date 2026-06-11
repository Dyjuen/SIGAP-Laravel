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

class KakCreateEditFormState extends State<KakCreateEditForm> {
  late TextEditingController namaController;
  late TextEditingController deskripsiController;
  late TextEditingController metodeController;
  late TextEditingController lokasiController;
  late TextEditingController sasaranController;
  late TextEditingController outputKegiatanController; // Added this

  DateTime? tanggalMulai;
  DateTime? tanggalSelesai;
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
    outputKegiatanController.text = data.outputKegiatan; // Added this

    tanggalMulai = DateTime.tryParse(data.tanggalMulai);
    tanggalSelesai = DateTime.tryParse(data.tanggalSelesai);
    selectedTipeKegiatan = data.tipeKegiatanId;
    if (selectedTipeKegiatan != null &&
        !widget.tipeKegiatanOptions.any(
          (option) => option['id'] == selectedTipeKegiatan,
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
                      (option) => option['id'] == r.satuan1Id,
                    ))
                ? r.satuan1Id
                : null,
            volume2: r.volume2?.toDouble(),
            satuan2Id:
                (r.satuan2Id != null &&
                    widget.satuanOptions.any(
                      (option) => option['id'] == r.satuan2Id,
                    ))
                ? r.satuan2Id
                : null,
            volume3: r.volume3?.toDouble(),
            satuan3Id:
                (r.satuan3Id != null &&
                    widget.satuanOptions.any(
                      (option) => option['id'] == r.satuan3Id,
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
                (int.tryParse(t.ikuId.toString()) != null &&
                    widget.ikuOptions.any(
                      (option) =>
                          option['id'] == int.tryParse(t.ikuId.toString()),
                    ))
                ? int.tryParse(t.ikuId.toString())!
                : 0,
            ikuNama: t.ikuNama,
            target: t.target.toString(),
            satuanId:
                (t.satuanId != null &&
                    widget.satuanOptions.any(
                      (option) =>
                          option['id'] ==
                          int.tryParse(t.satuanId.toString() ?? ''),
                    ))
                ? int.tryParse(t.satuanId.toString() ?? '')
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

  Widget _buildKerangkaAcuanKerjaForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextFormField(
            controller: namaController,
            decoration: const InputDecoration(labelText: 'Nama Kegiatan'),
            readOnly: widget.readOnly,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Nama kegiatan tidak boleh kosong';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<int?>(
            value: selectedTipeKegiatan,
            decoration: const InputDecoration(labelText: 'Tipe Kegiatan'),
            items: [
              const DropdownMenuItem<int?>(
                value: null,
                child: Text('Pilih Tipe Kegiatan'),
              ),
              ...widget.tipeKegiatanOptions
                  .where(
                    (option) => (option['id'] as int?) != null,
                  ) // Filter out options with null IDs from master data
                  .map<DropdownMenuItem<int?>>((option) {
                    return DropdownMenuItem<int?>(
                      value: (option['id'] as int?),
                      child: Text(option['nama'] ?? ''),
                    );
                  })
                  .toList(),
            ],
            onChanged: widget.readOnly
                ? null
                : (value) {
                    setState(() {
                      selectedTipeKegiatan = value;
                    });
                  },
            validator: (value) {
              if (value == null) {
                return 'Tipe kegiatan tidak boleh kosong';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: deskripsiController,
            decoration: const InputDecoration(
              labelText: 'Gambaran Umum Kegiatan',
            ),
            maxLines: 3,
            readOnly: widget.readOnly,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Gambaran umum kegiatan tidak boleh kosong';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: sasaranController,
            decoration: const InputDecoration(labelText: 'Sasaran Utama'),
            maxLines: 2,
            readOnly: widget.readOnly,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Sasaran utama tidak boleh kosong';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: outputKegiatanController,
            decoration: const InputDecoration(labelText: 'Output Kegiatan'),
            maxLines: 2,
            readOnly: widget.readOnly,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Output kegiatan tidak boleh kosong';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: metodeController,
            decoration: const InputDecoration(labelText: 'Metode Pelaksanaan'),
            maxLines: 2,
            readOnly: widget.readOnly,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Metode pelaksanaan tidak boleh kosong';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          Text(
            'Kurun Waktu Pelaksanaan',
            style: GoogleFonts.figtree(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: widget.readOnly
                      ? null
                      : () => _selectDate(context, true),
                  child: InputDecorator(
                    decoration: const InputDecoration(
                      labelText: 'Tanggal Mulai',
                      border: OutlineInputBorder(),
                    ),
                    child: Text(
                      tanggalMulai == null
                          ? 'Pilih Tanggal'
                          : DateFormat('dd/MM/yyyy').format(tanggalMulai!),
                      style: GoogleFonts.figtree(),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: InkWell(
                  onTap: widget.readOnly
                      ? null
                      : () => _selectDate(context, false),
                  child: InputDecorator(
                    decoration: const InputDecoration(
                      labelText: 'Tanggal Selesai',
                      border: OutlineInputBorder(),
                    ),
                    child: Text(
                      tanggalSelesai == null
                          ? 'Pilih Tanggal'
                          : DateFormat('dd/MM/yyyy').format(tanggalSelesai!),
                      style: GoogleFonts.figtree(),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            'Manfaat Kegiatan',
            style: GoogleFonts.figtree(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: manfaatList.length,
            itemBuilder: (context, index) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        initialValue: manfaatList[index].value,
                        decoration: InputDecoration(
                          labelText: 'Manfaat ${index + 1}',
                        ),
                        readOnly: widget.readOnly,
                        onChanged: (value) {
                          manfaatList[index].value = value;
                          widget.onFormChange(getFormData());
                        },
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Manfaat tidak boleh kosong';
                          }
                          return null;
                        },
                      ),
                    ),
                    if (!widget.readOnly)
                      IconButton(
                        icon: const Icon(Icons.remove_circle),
                        onPressed: () => _removeManfaat(index),
                      ),
                  ],
                ),
              );
            },
          ),
          if (!widget.readOnly)
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: _addManfaat,
                icon: const Icon(Icons.add),
                label: const Text('Tambah Manfaat'),
              ),
            ),
          const SizedBox(height: 16),
          Text(
            'Tahapan Kegiatan',
            style: GoogleFonts.figtree(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: tahapanList.length,
            itemBuilder: (context, index) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        initialValue: tahapanList[index].nama,
                        decoration: InputDecoration(
                          labelText: 'Tahapan ${index + 1}',
                        ),
                        readOnly: widget.readOnly,
                        onChanged: (value) {
                          tahapanList[index].nama = value;
                          widget.onFormChange(getFormData());
                        },
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Tahapan tidak boleh kosong';
                          }
                          return null;
                        },
                      ),
                    ),
                    if (!widget.readOnly)
                      IconButton(
                        icon: const Icon(Icons.remove_circle),
                        onPressed: () => _removeTahapan(index),
                      ),
                  ],
                ),
              );
            },
          ),
          if (!widget.readOnly)
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: _addTahapan,
                icon: const Icon(Icons.add),
                label: const Text('Tambah Tahapan'),
              ),
            ),
          const SizedBox(height: 16),
          Text(
            'Indikator Kinerja',
            style: GoogleFonts.figtree(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: indikatorKinerjaList.length,
            itemBuilder: (context, index) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Column(
                  children: [
                    TextFormField(
                      initialValue: indikatorKinerjaList[index].bulanIndikator,
                      decoration: InputDecoration(
                        labelText: 'Bulan Indikator ${index + 1}',
                      ),
                      readOnly: widget.readOnly,
                      onChanged: (value) {
                        indikatorKinerjaList[index].bulanIndikator = value;
                        widget.onFormChange(getFormData());
                      },
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Bulan indikator tidak boleh kosong';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      initialValue: indikatorKinerjaList[index].deskripsiTarget,
                      decoration: InputDecoration(
                        labelText: 'Deskripsi Target ${index + 1}',
                      ),
                      readOnly: widget.readOnly,
                      onChanged: (value) {
                        indikatorKinerjaList[index].deskripsiTarget = value;
                        widget.onFormChange(getFormData());
                      },
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Deskripsi target tidak boleh kosong';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      initialValue: indikatorKinerjaList[index].persentaseTarget
                          ?.toString(),
                      decoration: InputDecoration(
                        labelText: 'Persentase Target ${index + 1}',
                      ),
                      keyboardType: TextInputType.number,
                      readOnly: widget.readOnly,
                      onChanged: (value) {
                        indikatorKinerjaList[index].persentaseTarget =
                            double.tryParse(value);
                        widget.onFormChange(getFormData());
                      },
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Persentase target tidak boleh kosong';
                        }
                        if (double.tryParse(value) == null) {
                          return 'Harus angka';
                        }
                        return null;
                      },
                    ),
                    if (!widget.readOnly)
                      Align(
                        alignment: Alignment.centerRight,
                        child: IconButton(
                          icon: const Icon(Icons.remove_circle),
                          onPressed: () => _removeIndikatorKinerja(index),
                        ),
                      ),
                  ],
                ),
              );
            },
          ),
          if (!widget.readOnly)
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: _addIndikatorKinerja,
                icon: const Icon(Icons.add),
                label: const Text('Tambah Indikator Kinerja'),
              ),
            ),
          const SizedBox(height: 16),
        ],
      ),
    );
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

  Widget _buildIndikatorKinerjaUtamaForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Target IKU',
            style: GoogleFonts.figtree(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: targetIkuList.length,
            itemBuilder: (context, index) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Column(
                  children: [
                    DropdownButtonFormField<int?>(
                      value: targetIkuList[index].ikuId == 0
                          ? null
                          : targetIkuList[index].ikuId,
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
                                targetIkuList[index].ikuId = value ?? 0;
                                if (value != null) {
                                  targetIkuList[index].ikuNama =
                                      widget.ikuOptions.firstWhere(
                                        (element) => element['id'] == value,
                                      )['nama'] ??
                                      '';
                                } else {
                                  targetIkuList[index].ikuNama =
                                      ''; // Or handle appropriately if null
                                }
                                widget.onFormChange(getFormData());
                              });
                            },
                      validator: (value) {
                        if (value == null || value == 0) {
                          return 'IKU tidak boleh kosong';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      initialValue: targetIkuList[index].target,
                      decoration: InputDecoration(
                        labelText: 'Target ${index + 1}',
                      ),
                      readOnly: widget.readOnly,
                      onChanged: (value) {
                        targetIkuList[index].target = value;
                        widget.onFormChange(getFormData());
                      },
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Target tidak boleh kosong';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<int?>(
                      value: targetIkuList[index].satuanId,
                      decoration: InputDecoration(
                        labelText: 'Satuan ${index + 1}',
                      ),
                      items: [
                        const DropdownMenuItem<int?>(
                          value: null,
                          child: Text('Pilih Satuan'),
                        ),
                        ...widget.satuanOptions
                            .where(
                              (option) => (option['id'] as int?) != null,
                            ) // Filter out options with null IDs from master data
                            .map<DropdownMenuItem<int?>>((option) {
                              return DropdownMenuItem<int?>(
                                value: (option['id'] as int?),
                                child: Text(option['nama'] ?? ''),
                              );
                            })
                            .toList(),
                      ],
                      onChanged: widget.readOnly
                          ? null
                          : (value) {
                              setState(() {
                                targetIkuList[index].satuanId = value;
                                widget.onFormChange(getFormData());
                              });
                            },
                    ),
                    if (!widget.readOnly)
                      Align(
                        alignment: Alignment.centerRight,
                        child: IconButton(
                          icon: const Icon(Icons.remove_circle),
                          onPressed: () => _removeTargetIku(index),
                        ),
                      ),
                  ],
                ),
              );
            },
          ),
          if (!widget.readOnly)
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: _addTargetIku,
                icon: const Icon(Icons.add),
                label: const Text('Tambah Target IKU'),
              ),
            ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildRencanaAnggaranBiayaForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Rencana Anggaran Biaya',
            style: GoogleFonts.figtree(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          ...widget.kategoriBelanjaOptions.expand<Widget>((kategori) {
            final int kategoriId = kategori['id'] ?? 0;
            final String kategoriNama = kategori['nama'] ?? 'Unknown';
            final List<RabItem> rabItemsInCategory = rabList
                .where((item) => item.kategoriBelanjaId == kategoriId)
                .toList();

            return [
              const SizedBox(height: 16),
              Text(
                kategoriNama,
                style: GoogleFonts.figtree(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 8),
              ...rabItemsInCategory.map<Widget>((rabItem) {
                int index = rabItemsInCategory.indexOf(
                  rabItem,
                ); // Get index for label
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextFormField(
                        initialValue: rabItem.uraian,
                        decoration: InputDecoration(
                          labelText: 'Uraian RAB ${index + 1}',
                        ),
                        readOnly: widget.readOnly,
                        onChanged: (value) {
                          rabItem.uraian = value;
                          widget.onFormChange(getFormData());
                        },
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Uraian tidak boleh kosong';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              initialValue: rabItem.volume1.toString(),
                              decoration: InputDecoration(
                                labelText: 'Volume 1',
                              ),
                              keyboardType: TextInputType.number,
                              readOnly: widget.readOnly,
                              onChanged: (value) {
                                rabItem.volume1 = double.tryParse(value) ?? 0;
                                widget.onFormChange(getFormData());
                              },
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Volume 1 tidak boleh kosong';
                                }
                                if (double.tryParse(value) == null) {
                                  return 'Harus angka';
                                }
                                return null;
                              },
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: DropdownButtonFormField<int?>(
                              value: rabItem.satuan1Id,
                              decoration: InputDecoration(
                                labelText: 'Satuan 1',
                              ),
                              items: [
                                const DropdownMenuItem<int?>(
                                  value: null,
                                  child: Text('Pilih Satuan'),
                                ),
                                ...widget.satuanOptions
                                    .where(
                                      (option) =>
                                          (option['id'] as int?) != null,
                                    ) // Filter out options with null IDs from master data
                                    .map<DropdownMenuItem<int?>>((option) {
                                      return DropdownMenuItem<int?>(
                                        value: (option['id'] as int?),
                                        child: Text(option['nama'] ?? ''),
                                      );
                                    })
                                    .toList(),
                              ],
                              onChanged: widget.readOnly
                                  ? null
                                  : (value) {
                                      setState(() {
                                        rabItem.satuan1Id = value;
                                        widget.onFormChange(getFormData());
                                      });
                                    },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              initialValue: rabItem.volume2?.toString() ?? '',
                              decoration: InputDecoration(
                                labelText: 'Volume 2 (Opsional)',
                              ),
                              keyboardType: TextInputType.number,
                              readOnly: widget.readOnly,
                              onChanged: (value) {
                                rabItem.volume2 = double.tryParse(value);
                                widget.onFormChange(getFormData());
                              },
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: DropdownButtonFormField<int?>(
                              value: rabItem.satuan2Id,
                              decoration: InputDecoration(
                                labelText: 'Satuan 2 (Opsional)',
                              ),
                              items: [
                                const DropdownMenuItem<int?>(
                                  value: null,
                                  child: Text('Pilih Satuan'),
                                ),
                                ...widget.satuanOptions
                                    .where(
                                      (option) =>
                                          (option['id'] as int?) != null,
                                    ) // Filter out options with null IDs from master data
                                    .map<DropdownMenuItem<int?>>((option) {
                                      return DropdownMenuItem<int?>(
                                        value: (option['id'] as int?),
                                        child: Text(option['nama'] ?? ''),
                                      );
                                    })
                                    .toList(),
                              ],
                              onChanged: widget.readOnly
                                  ? null
                                  : (value) {
                                      setState(() {
                                        rabItem.satuan2Id = value;
                                        widget.onFormChange(getFormData());
                                      });
                                    },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              initialValue: rabItem.volume3?.toString() ?? '',
                              decoration: InputDecoration(
                                labelText: 'Volume 3 (Opsional)',
                              ),
                              keyboardType: TextInputType.number,
                              readOnly: widget.readOnly,
                              onChanged: (value) {
                                rabItem.volume3 = double.tryParse(value);
                                widget.onFormChange(getFormData());
                              },
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: DropdownButtonFormField<int?>(
                              value: rabItem.satuan3Id,
                              decoration: InputDecoration(
                                labelText: 'Satuan 3 (Opsional)',
                              ),
                              items: [
                                const DropdownMenuItem<int?>(
                                  value: null,
                                  child: Text('Pilih Satuan'),
                                ),
                                ...widget.satuanOptions
                                    .where(
                                      (option) =>
                                          (option['id'] as int?) != null,
                                    ) // Filter out options with null IDs from master data
                                    .map<DropdownMenuItem<int?>>((option) {
                                      return DropdownMenuItem<int?>(
                                        value: (option['id'] as int?),
                                        child: Text(option['nama'] ?? ''),
                                      );
                                    })
                                    .toList(),
                              ],
                              onChanged: widget.readOnly
                                  ? null
                                  : (value) {
                                      setState(() {
                                        rabItem.satuan3Id = value;
                                        widget.onFormChange(getFormData());
                                      });
                                    },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        initialValue: rabItem.hargaSatuan.toString(),
                        decoration: InputDecoration(labelText: 'Harga Satuan'),
                        keyboardType: TextInputType.number,
                        readOnly: widget.readOnly,
                        onChanged: (value) {
                          rabItem.hargaSatuan = double.tryParse(value) ?? 0;
                          widget.onFormChange(getFormData());
                        },
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Harga satuan tidak boleh kosong';
                          }
                          if (double.tryParse(value) == null) {
                            return 'Harus angka';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Total: ${NumberFormat.currency(locale: 'id', symbol: 'Rp ').format(rabItem.getTotal())}',
                        style: GoogleFonts.figtree(fontWeight: FontWeight.w600),
                      ),
                      if (!widget.readOnly)
                        Align(
                          alignment: Alignment.centerRight,
                          child: IconButton(
                            icon: const Icon(Icons.remove_circle),
                            onPressed: () {
                              setState(() {
                                rabList.removeWhere(
                                  (element) => element.id == rabItem.id,
                                );
                                widget.onFormChange(getFormData());
                              });
                            },
                          ),
                        ),
                      const Divider(),
                    ],
                  ),
                );
              }).toList(),
              if (!widget.readOnly)
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton.icon(
                    onPressed: () => _addRab(kategoriId),
                    icon: const Icon(Icons.add),
                    label: Text('Tambah RAB untuk ${kategoriNama ?? ''}'),
                  ),
                ),
            ];
          }).toList(),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return DefaultTabController(
      length: 3,
      child: Column(
        children: [
          TabBar(
            isScrollable: true,
            labelColor: Theme.of(context).colorScheme.primary,
            unselectedLabelColor: Theme.of(
              context,
            ).colorScheme.onSurfaceVariant,
            indicatorColor: Theme.of(context).colorScheme.primary,
            tabs: const [
              Tab(text: 'Kerangka Acuan Kerja'),
              Tab(text: 'Indikator Kinerja Utama'),
              Tab(text: 'Rencana Anggaran Biaya'),
            ],
          ),
          Expanded(
            child: Form(
              key: _formKey, // Use the internal _formKey
              child: TabBarView(
                children: [
                  _buildKerangkaAcuanKerjaForm(),
                  _buildIndikatorKinerjaUtamaForm(),
                  _buildRencanaAnggaranBiayaForm(),
                ],
              ),
            ),
          ),
          // Action Buttons (Only show if not readOnly)
          if (!widget.readOnly)
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  FilledButton(
                    onPressed: widget.isLoading
                        ? null
                        : () {
                            if (_formKey.currentState!.validate()) {
                              if (manfaatList.isEmpty) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                      'Minimal harus ada 1 manfaat',
                                    ),
                                  ),
                                );
                                return;
                              }
                              if (tahapanList.isEmpty) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                      'Minimal harus ada 1 tahapan',
                                    ),
                                  ),
                                );
                                return;
                              }
                              if (rabList.isEmpty) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                      'Minimal harus ada 1 item RAB',
                                    ),
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
                            style: GoogleFonts.figtree(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                  ),
                  const SizedBox(height: 16),
                  OutlinedButton(
                    onPressed: widget.isLoading
                        ? null
                        : () => Navigator.pop(context),
                    child: Text(
                      'Batal',
                      style: GoogleFonts.figtree(fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
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
    outputKegiatanController.dispose(); // Added this
    super.dispose();
  }
}
