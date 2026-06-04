import 'package:flutter/material.dart';
import '../core/app_theme.dart';
import 'sigap_logo.dart';

class SigapAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String roleLabel;
  final List<Widget>? actions;
  final bool showBackButton;

  const SigapAppBar({
    super.key,
    required this.roleLabel,
    this.actions,
    this.showBackButton = false,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      scrolledUnderElevation: 0,
      surfaceTintColor: Colors.transparent,
      titleSpacing: showBackButton ? 0 : 20,
      leading: showBackButton
          ? IconButton(
              icon: const Icon(
                Icons.arrow_back_ios_new_rounded,
                color: AppTheme.textPrimary,
                size: 20,
              ),
              onPressed: () => Navigator.of(context).pop(),
            )
          : null,
      title: Row(
        children: [
          const SigapLogo(width: 80, height: 24),
          const SizedBox(width: 12),
          Container(
            width: 1,
            height: 16,
            color: AppTheme.border,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              roleLabel,
              style: AppTheme.caption.copyWith(
                color: AppTheme.textSecondary,
                fontWeight: FontWeight.w600,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
      actions: actions,
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(
          color: AppTheme.border,
          height: 1,
        ),
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
