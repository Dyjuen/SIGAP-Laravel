import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/screens/pengusul/kak_create_edit_form.dart';

void main() {
  testWidgets('KakCreateEditForm validates performance indicator percentage', (WidgetTester tester) async {
    // Build KakCreateEditForm
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: DefaultTabController(
            length: 3,
            child: KakCreateEditForm(
              tipeKegiatanOptions: const [
                {'tipe_kegiatan_id': 1, 'nama_tipe': 'Tipe A'}
              ],
              ikuOptions: const [
                {'id': 1, 'kode_iku': 'IKU 1', 'nama_iku': 'IKU Pertama'}
              ],
              satuanOptions: const [
                {'id': 1, 'nama': 'Persen'}
              ],
              kategoriBelanjaOptions: const [
                {'id': 1, 'nama': 'Belanja Bahan'}
              ],
              onSubmit: () {},
              onFormChange: (_) {},
            ),
          ),
        ),
      ),
    );

    // Initial state: form is rendered
    expect(find.byType(KakCreateEditForm), findsOneWidget);

    // Find and scroll to the "Tambah Indikator Kinerja" button
    final addButtonFinder = find.text('Tambah Indikator Kinerja');
    expect(addButtonFinder, findsOneWidget);
    await tester.ensureVisible(addButtonFinder);
    await tester.pumpAndSettle();
    await tester.tap(addButtonFinder);
    await tester.pumpAndSettle();

    // Scroll/find the performance indicator target field
    final percentageFieldFinder = find.widgetWithText(TextFormField, 'Persentase Target (%)');
    expect(percentageFieldFinder, findsOneWidget);
    await tester.ensureVisible(percentageFieldFinder);
    await tester.pumpAndSettle();

    // Type "120" (invalid, > 100)
    await tester.enterText(percentageFieldFinder, '120');
    await tester.pumpAndSettle();

    // Since we set autovalidateMode: AutovalidateMode.onUserInteraction,
    // the error "Persentase maksimal 100%" should appear under the input on interaction.
    expect(find.text('Persentase maksimal 100%'), findsOneWidget);

    // Type "-5" (invalid, < 0)
    await tester.enterText(percentageFieldFinder, '-5');
    await tester.pumpAndSettle();
    expect(find.text('Persentase minimal 0%'), findsOneWidget);

    // Type "invalid" (invalid, not a number)
    await tester.enterText(percentageFieldFinder, 'abc');
    await tester.pumpAndSettle();
    expect(find.text('Harus angka'), findsOneWidget);

    // Type "85" (valid)
    await tester.enterText(percentageFieldFinder, '85');
    await tester.pumpAndSettle();
    expect(find.text('Persentase maksimal 100%'), findsNothing);
    expect(find.text('Persentase minimal 0%'), findsNothing);
    expect(find.text('Harus angka'), findsNothing);
  });
}
